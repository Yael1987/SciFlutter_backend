export default class APIFeatures {
  constructor (query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter () {
    //  1A) Filtering
    const queryObj = { ...this.queryString }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObj[el])

    //  1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    const filterObj = JSON.parse(queryStr)

    if (filterObj.name) filterObj.name = { $regex: filterObj.name, $options: 'i' }
    if (filterObj.discipline) filterObj.discipline = { $regex: filterObj.discipline, $options: 'i' }
    if (filterObj.year) {
      const year = parseInt(filterObj.year)

      filterObj.createdAt = { $gte: new Date(year, 0), $lt: new Date(year + 1, 0) }
      delete filterObj.year
    }

    this.query = this.query.find(filterObj)
    return this
  }

  sort () {
    if (this.queryString?.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')

      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  limitFields () {
    if (this.queryString?.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }

    return this
  }

  async paginate () {
    const page = this.queryString?.page * 1 || 1
    const limit = this.queryString?.limit * 1 || 100
    const skip = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)

    const countQuery = { ...this.query._conditions }
    const totalDocs = await this.query.model.countDocuments(countQuery)

    const totalPages = Math.ceil(totalDocs / limit)

    return {
      features: this,
      totalPages
    }
  }
}
