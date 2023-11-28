import sharp from 'sharp'
import catchAsync from '../utils/catchAsync.js'
import { uploadFile } from '../utils/minio.js'
import AppError from '../utils/AppError.js'

export const saveUserPics = catchAsync(async (req, res, next) => {
  if (!req.files) return next()

  const allowedPics = ['profile', 'cover']
  req.body.photos = req.body.photos || {}

  for (const key of Object.keys(req.files)) {
    if (allowedPics.includes(key)) {
      const file = req.files[key]
      const fileName = `user-avatars/pic-${key}-${req.user.id}.jpeg`

      const compressFile = await sharp(file.data)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toBuffer()

      const minioResponse = await uploadFile(compressFile, fileName)

      if (minioResponse.err) {
        return next(new AppError('Error uploading image', 500))
      } else {
        req.body.photos[key] = `http://localhost:9000/sciflutter/${fileName}`
      }
    }
  }

  next()
})

export const uploadArticleMainImg = catchAsync(async (req, res, next) => {
  console.log(req.files)
  if (!req.files) return next()

  if (req.files.image) {
    const file = req.files.image
    const fileName = `articles-main/${req.body.name.replace(' ', '_')}-${req.user.id}.jpeg`

    const compressFile = await sharp(file.data)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer()

    const minioResponse = await uploadFile(compressFile, fileName)

    if (minioResponse.err) {
      return next(new AppError('Error uploading image', 500))
    } else {
      req.body.image = `http://localhost:9000/sciflutter/${fileName}`
    }
  }

  next()
})

export const uploadArticleImgs = catchAsync(async (req, res) => {
  const file = req.files.upload
  const fileName = `article-${Date.now()}.jpeg`

  const compressFile = await sharp(file.data)
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
    return res.json({
      url: `http://localhost:9000/sciflutter/${fileName}`
      // url: `http://localhost:9000/sciflutter/article-1700676352289.jpeg`,
    })
  }
})
