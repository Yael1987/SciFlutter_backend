export default (req, res, next) => {
  const whiteList = ['author', 'createdAt', 'discipline', 'userId', 'role', 'status', 'name', 'authorId', 'article', 'user', 'id', 'type', 'limit', 'page', 'sort', 'year', 'month']

  req.query = Object.keys(req.query)
    .filter(key => whiteList.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.query[key]
      return obj
    }, {})

  next()
}
