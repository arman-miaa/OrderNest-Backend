import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import config from "../config/index";
import dotenv from "dotenv";

dotenv.config();

// DigitalOcean Spaces Config
const s3 = new S3Client({
  region: "nyc3",
  endpoint: process.env.DO_SPACE_ENDPOINT || "", // ✅ base region endpoint, NOT bucket-specific
  forcePathStyle: true, // ✅ prevents bucket duplication
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY as string,
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY as string,
  },
});

export async function deleteImageFromDigitalOcean(
  imageUrl: string
): Promise<boolean> {
  try {
    const bucketName = process.env.DO_SPACE_BUCKET!;

    // Extract key (remove CDN or endpoint URL)
    const cdnBase = process.env.DO_SPACE_CDN_ENDPOINT || "";
    const originBase = process.env.DO_SPACE_ORIGIN_ENDPOINT || "";

    let key = imageUrl.replace(cdnBase + "/", "").replace(originBase + "/", "");

    if (!key) {
      console.warn(`Could not extract key from URL: ${imageUrl}`);
      return false;
    }

    console.log("Deleting key:", key);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3.send(command);

    console.log(`Deleted: ${key}`);
    return true;
  } catch (err: any) {
    console.error("Delete failed:", err.message || err);
    return false;
  }
}

export async function deleteImagesFromDigitalOcean(
  imageUrls: string[]
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const url of imageUrls) {
    const isDeleted = await deleteImageFromDigitalOcean(url);
    if (isDeleted) {
      success.push(url);
    } else {
      failed.push(url);
    }
  }

  return { success, failed };
}
