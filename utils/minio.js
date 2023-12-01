import { Client } from 'minio'

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

export async function uploadFile (file, fileName) {
  const metaData = {
    'Content-Type': 'application/octet-stream'
  }

  const result = await minioClient.putObject('sciflutter', fileName, file, metaData)

  return result
}

export async function deleteFile (imgUrl) {
  const fileName = imgUrl.replace('http://localhost:9000/sciflutter/', '').replace('http://127.0.0.1:9000/sciflutter/')

  const result = await minioClient.removeObject('sciflutter', fileName)

  return result
}
