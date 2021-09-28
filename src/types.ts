export interface Visitor {
  name: string
  id: string
  email: string
}

export interface Location {
  countryCode: string
  city: string
}

export interface Sender {
  t: string
  n: string
}

export interface Message {
  sender: Sender
  type: string
  time: Date
  msg: string
}

export interface RootObject {
  id: string
  type: string
  pageId: string
  visitor: Visitor
  location: Location
  messageCount: number
  chatDuration: number
  rating: number
  createdOn: Date
  messages: Message[]
  domain: string
}
