import { DeleteObjectCommand, GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
// import fs from 'fs'

const client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_PUBLIC_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})

export async function uploadFile (file, fileName) {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file
  }

  const command = new PutObjectCommand(uploadParams)

  const result = await client.send(command)
  return result
}

export const deleteFile = async (imgUrl) => {
  const fileName = imgUrl.replace(`https://${process.env.AWS_BUCKET_HOST}/`, '')

  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName
  }

  const command = new DeleteObjectCommand(deleteParams)

  const result = await client.send(command)

  return result
}

export async function getFiles () {
  const command = new ListObjectsCommand({
    Bucket: process.env.AWS_BUCKET_NAME
  })

  const result = await client.send(command)

  return result.Contents
}

export async function getFile (fileName) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName
  })

  const result = await client.send(command)
  console.log(result)
}
