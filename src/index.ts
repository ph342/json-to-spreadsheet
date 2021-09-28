import { Command, flags } from "@oclif/command"
import { Dirent, promises as fs } from "fs"
import { RootObject } from "./types"

class JsonToSpreadsheet extends Command {
  static description = "Import JSONs and append the contents to a CSV file"

  static flags = {
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
  }

  static args = [
    {
      name: "src",
      required: true,
      description:
        "Directory with .json files (needs to have an \\ in the end!)",
    },
    {
      name: "target",
      required: true,
      description: "Target file with ending .csv",
    },
    {
      name: "delimiter",
      required: true,
      description: "Delimiter for the target .csv file",
      default: ";",
    },
  ]

  async run(): Promise<void> {
    const { args } = this.parse(JsonToSpreadsheet)

    const csvArray: string[][] = [
      [
        "Dateiname",
        "Typ",
        "pageId",
        "Besucher (Name)",
        "Besucher (ID)",
        "Besucher (E-Mail)",
        "Land",
        "Stadt",
        "Anz. Nachrichten",
        "Chat Dauer",
        "Bewertung",
        "Erstellt am",
      ],
    ]

    // write the headers
    csvArray.unshift(["sep=" + args.delimiter])

    const toCsv = (arr: Array<Array<string>>): string => {
      return arr.reduce(function (csvString: string, row: Array<string>) {
        csvString += row.join(args.delimiter)
        csvString += "\r\n"
        return csvString
      }, "")
    }

    const files = await this.listFiles(args.src)

    await Promise.all(
      files.map(async (file) => {
        const contents = await fs.readFile(args.src + file)
        this.appendToArray(csvArray, contents.toString())
      })
    )

    fs.appendFile(args.target, toCsv(csvArray))
  }

  private async listFiles(directory: string): Promise<string[]> {
    const dirents: Dirent[] = await fs.readdir(directory, {
      withFileTypes: true,
    })
    return dirents
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name)
  }

  private appendToArray(array: Array<Array<string>>, content: string): void {
    content.replace(/\n/g, " ")
    const json: RootObject = JSON.parse(content)
    if (!json) return

    const date = new Date(json.createdOn)
    const excelDate =
      25569.0 +
      (date.getTime() - date.getTimezoneOffset() * 60 * 1000) /
        (1000 * 60 * 60 * 24)

    array.push([
      json.id,
      json.type,
      json.pageId,
      json.visitor.name,
      json.visitor.id,
      json.visitor.email,
      json.location.countryCode,
      json.location.city,
      json.messageCount.toString(),
      json.chatDuration.toString(),
      json.rating.toString(),
      excelDate.toString().substr(0, 20),
    ])
  }
}

export = JsonToSpreadsheet
