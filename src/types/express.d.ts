import { IClient } from "../models/clientModel";
import { IFormAdmin } from "../models/FormAdmin";


declare global {
  namespace Express {
    interface Request {
    user?:IClient,
    form?:IFormAdmin?
    }
  }
}

export {};