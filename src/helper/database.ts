import mongoose from "mongoose";

export const reviewDB = mongoose.createConnection(
  process.env.DATABASE_URL!
);

export const crmDB = mongoose.createConnection(
  process.env.DB_URL!
);

  

 
export const connectDatabases = async (): Promise<void> => {
  try {
    await Promise.all([
      reviewDB.asPromise(),
      crmDB.asPromise(),
    ]);

    console.log("Learning database connected");
    console.log("CRM database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};
