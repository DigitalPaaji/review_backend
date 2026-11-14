import fs from "fs";
import path from "path";

export const deleteImage = async (imgPath: string): Promise<boolean> => {
  try {
    const filePath = path.join(process.cwd(), imgPath);

    await fs.promises.unlink(filePath);

    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Image not found:", imgPath);
      return false;
    }

    console.error("Image deletion error:", error);
    return false;
  }
};