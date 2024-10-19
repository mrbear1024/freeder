import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2_CONFIG } from '../config/r2Config';

const s3Client = new S3Client({
  region: R2_CONFIG.region,
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

export const uploadToR2 = async (file: File): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: file.name,
    Body: file,
  });

  try {
    await s3Client.send(command);
    return file.name;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
};

export const getSignedR2Url = async (key: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

export const listBooks = async (): Promise<string[]> => {
  const command = new ListObjectsV2Command({
    Bucket: R2_CONFIG.bucketName,
  });

  try {
    const response = await s3Client.send(command);
    return response.Contents?.map(object => object.Key as string) || [];
  } catch (error) {
    console.error('Error listing books:', error);
    throw error;
  }
};