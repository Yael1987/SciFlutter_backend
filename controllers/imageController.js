import sharp from 'sharp'
import { uploadFile } from '../utils/minio.js'
import { promises as fs } from 'fs'
import AppError from '../utils/AppError.js'
// import { getFile, getFiles, uploadFile } from '../s3.js'

const saveArticle = async (req, res) => {
  const file = req.files.Image || req.files.upload

  // const compressFile = await sharp(file.tempFilePath)
  //   .toFormat('jpeg')
  //   .jpeg({quality: 80})
  //   .toBuffer()

  const fileName = `article-${Date.now()}.jpeg`

  const compressFile = await sharp(file.tempFilePath)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toBuffer()

  const minioResponse = await uploadFile(compressFile, fileName)

  // const result = await uploadFile(compressFile, `${fileName}.jpeg`)

  // if (result.$metadata?.httpStatusCode !== 200) return res.json({ error: { message: 'Failed to upload the image' } })

  // const imageUrl = `https://sciflutter.s3.amazonaws.com/${fileName}.jpeg`

  if (minioResponse.err) {
    return res.json({
      error: { message: 'Failed to upload the image' }
    })
  } else {
    fs.unlink(file.tempFilePath)

    return res.json({
      url: `http://localhost:9000/sciflutter/${fileName}`
      // url: `http://localhost:9000/sciflutter/article-1700676352289.jpeg`,
    })
  }
}

const unsaveArticle = (req, res) => { }

const likeArticle = (req, res) => {
  console.log(req.body)

  res.send('Received')
}

const saveUserPics = async (req, res, next) => {
  if (!req.files) next()

  const allowedPics = ['profile', 'cover']
  req.body.photos = req.body.photos || {}

  for(const key of Object.keys(req.files)){
    if (allowedPics.includes(key)) {
      const file = req.files[key]
      const fileName = `pics-user123/user-${key}-${Date.now()}.jpeg`

      const compressFile = await sharp(file.tempFilePath)
        .toFormat('jpeg')
        .jpeg({quality: 80})
        .toBuffer()

      const minioResponse = await uploadFile(compressFile, fileName)

      if (minioResponse.err) {
        next(new AppError('Error uploading image', 500))
      } else {
        await fs.unlink(file.tempFilePath)

        req.body.photos[key] = `http://localhost:9000/sciflutter/${fileName}`
      }
    }
  }

  next()
}

const unlikeArticle = (req, res) => {}
const followAuthor = (req, res) => {
  console.log(req.params.fileName)

  getFile(req.params.fileName)

  res.send('Received')
}
const unfollowAuthor = (req, res) => { }

const saveAsPdf = async (req, res) => {
  // const results = await getFiles()
  // res.json(results)
}

export {
  saveArticle,
  unsaveArticle,
  likeArticle,
  unlikeArticle,
  followAuthor,
  unfollowAuthor,
  saveAsPdf,
  saveUserPics
}
