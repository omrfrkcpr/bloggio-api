const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { AWS_S3_BUCKET_REGION, AWS_S3_BUCKET_NAME } = require("../../constants");

// Initialize the S3 client with your configuration
const client = new S3Client({ region: AWS_S3_BUCKET_REGION });

const bucketName = AWS_S3_BUCKET_NAME;

async function deleteObjectByDateKeyNumber(keyNumber) {
  try {
    // List the objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    const listResponse = await client.send(listCommand);

    // Filter the objects to find the one that includes the key number
    const objects = listResponse.Contents;
    const objectToDelete = objects.find((obj) => obj.Key.includes(keyNumber));

    if (!objectToDelete) {
      console.log(`No object found with key number: ${keyNumber}`);
      return;
    }

    // Step 3: Delete the object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectToDelete.Key,
    });
    const deleteResponse = await client.send(deleteCommand);

    console.log("Delete Response:", deleteResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { deleteObjectByDateKeyNumber };
