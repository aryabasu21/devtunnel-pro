import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { Express } from "express";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "devportal";

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export interface StoredAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
}

function uploadBuffer(file: Express.Multer.File): Promise<UploadApiResponse> {
  if (!cloudName || !apiKey || !apiSecret) {
    return Promise.reject(new Error("Cloudinary storage is not configured"));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: uploadFolder, resource_type: "auto", use_filename: true, unique_filename: true },
      (error, result) => {
        if (error || !result) reject(error || new Error("Cloudinary upload failed"));
        else resolve(result);
      },
    );
    stream.end(file.buffer);
  });
}

export async function uploadAttachments(
  files: Express.Multer.File[],
): Promise<StoredAttachment[]> {
  return Promise.all(files.map(async (file) => {
    const uploaded = await uploadBuffer(file);
    return {
      filename: uploaded.public_id,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url,
      resourceType: uploaded.resource_type,
      format: uploaded.format,
    };
  }));
}
