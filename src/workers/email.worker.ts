import { Worker } from "bullmq";
import { type EmailJobData } from "../queues/email.queue";
import { sendEmail, sendToClient } from "../helper/WelcomeEmail";
import bullRedis from "../helper/bullRedis";

const emailWorker = new Worker<EmailJobData>(
  "email-queue",
  async (job) => {
    

    if (job.name === "send-email") {
      await sendEmail(job.data.to);
      console.log("Email sent:", job.data.to);
    }
     
      if (job.name === "send-email-to-client") {
      await sendToClient(job.data.to,job.data.submissionData as string);
      console.log("Email sent:", job.data.to);
    }


  },
  {
    connection: bullRedis,
    concurrency: 5,
  }
);

emailWorker.on("ready", () => {
  console.log("Email worker ready!");
});

emailWorker.on("completed", (job) => {
  console.log("Email job completed:", job.id);
});

emailWorker.on("failed", (job, error) => {
  console.error("Email job failed:", job?.id, error);
});

emailWorker.on("error", (error) => {
  console.error("Worker error:", error);
});

export default emailWorker;