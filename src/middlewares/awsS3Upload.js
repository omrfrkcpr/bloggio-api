"use strict";

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { CustomError } = require("../errors/customError");
const {
  AWS_S3_BUCKET_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} = require("../../constants");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure AWS S3
const s3Client = new S3Client({
  region: AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload Google avatar to S3
const uploadAvatarToS3 = async (avatarUrl, profileId) => {
  try {
    const response = await fetch(avatarUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${profileId}.jpg`;

    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (err) {
    throw new Error("Failed to upload avatar to S3.");
  }
};

// Middleware function to upload file to S3
const uploadToS3 = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new CustomError(
      "File type error. Only JPEG, JPG, and PNG files are allowed.",
      400
    );
  }

  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: `${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    // ACL: 'public-read' // Uncomment if you want the file to be publicly readable
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    req.fileLocation = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
    next();
  } catch (err) {
    throw new CustomError("Failed to upload file.", 500);
  }
};

module.exports = {
  upload,
  uploadAvatarToS3,
  uploadToS3,
};
