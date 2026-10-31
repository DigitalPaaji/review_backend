import { IClient } from "../models/clientModel";


declare global {
  namespace Express {
    interface Request {
    user?:IClient
    }
  }
}

export {};