import { Queue } from "bullmq";
import bullRedis from "../helper/bullRedis";

export interface EmailJobData {
  to: string;
  submissionData:string | null;
}

export const emailQueue = new Queue<EmailJobData>(
  "email-queue",
  {
    connection: bullRedis,
  }
);