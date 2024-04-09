import sharp from 'sharp'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/AppError.js'
import Draft from '../models/draftModel.js'
import { deleteFile, uploadFile } from '../s3.js'

export const saveUserPics = catchAsync(async (req, res, next) => {
  if (!req.files) return next()

  const allowedPics = ['profile', 'cover']
  req.body.photos = req.body.photos || {}

  for (const key of Object.keys(req.files)) {
    if (allowedPics.includes(key)) {
      const file = req.files[key]
      const fileName = `user-avatars/pic-${key}-${req.user.id}-${Date.now()}.jpeg`

      const compressFile = await sharp(file.data)
        .toFormat('webp')
        .jpeg({ quality: 80 })
        .toBuffer()

      const minioResponse = await uploadFile(compressFile, `${fileName}.webp`)

      if (minioResponse.err) {
        return next(new AppError('Error uploading image', 500))
      } else {
        if (!req.user.photos[key].startsWith('/')) { await deleteFile(req.user.photos[key]) }

        req.body.photos[key] = `https://${process.env.AWS_BUCKET_HOST}/${fileName}`
      }
    }
  }

  next()
})

export const deleteUserImages = catchAsync(async (req, res, next) => {
  if (Object.keys(req.body).includes('photos[profile]')) {
    await deleteFile(req.user.photos.profile)
    return next()
  }

  if (Object.keys(req.body).includes('cover[cover]')) {
    await deleteFile(req.user.photos.cover)
    return next()
  }

  next()
})

export const uploadArticleMainImg = catchAsync(async (req, res, next) => {
  if (!req.files) return next()

  if (req.files.image) {
    const file = req.files.image
    const fileName = `articles-main/${req.body.name.replace(' ', '_')}-${req.user.id}.jpeg`

    const compressFile = await sharp(file.data)
      .toFormat('webp')
      .jpeg({ quality: 80 })
      .toBuffer()

    const minioResponse = await uploadFile(compressFile, `${fileName}.webp`)

    if (minioResponse.err) {
      return next(new AppError('Error uploading image', 500))
    } else {
      req.body.image = `https://${process.env.AWS_BUCKET_HOST}/${fileName}`
    }
  }

  next()
})

export const uploadArticleImgs = catchAsync(async (req, res) => {
  const draft = await Draft.findById(req.params.draftId)

  if (!draft) return res.json({ error: { message: 'Draft not found' } })

  const file = req.files.upload
  const fileName = `articles-images/${draft.name.replace(' ', '_')}-${Date.now()}.jpeg`

  const compressFile = await sharp(file.data)
    .toFormat('webp')
    .jpeg({ quality: 80 })
    .toBuffer()

  const minioResponse = await uploadFile(compressFile, `${fileName}.webp`)

  // const result = await uploadFile(compressFile, `${fileName}.jpeg`)

  // if (result.$metadata?.httpStatusCode !== 200) return res.json({ error: { message: 'Failed to upload the image' } })

  // const imageUrl = `https://sciflutter.s3.amazonaws.com/${fileName}.jpeg`

  if (minioResponse.err) {
    return res.json({
      error: { message: 'Failed to upload the image' }
    })
  } else {
    draft.images.push(`https://${process.env.AWS_BUCKET_HOST}/${fileName}`)
    await draft.save()

    return res.json({
      url: `https://${process.env.AWS_BUCKET_HOST}/${fileName}`
      // url: `http://localhost:9000/sciflutter/article-1700676352289.jpeg`,
    })
  }
})
