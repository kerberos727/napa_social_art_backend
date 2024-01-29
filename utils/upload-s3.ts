import { S3 } from "aws-sdk";

const uploadS3 = async (params) => {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.SOCIAL_ART_ACCESS_KEY,
    secretAccessKey: process.env.SOCIAL_ART_SECRET_KEY,
    region: process.env.SOCIAL_ART_REGION,
    signatureVersion: "v4",
  });
  const result = await s3.upload(params).promise();
  return result;
};

export { uploadS3 };
