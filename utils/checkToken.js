import jwt from 'jsonwebtoken'

export const checkToken = (token) => {
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET)

    return [true, id]
  } catch (error) {
    return [false, null]
  }
}
