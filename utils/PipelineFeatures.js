export default class PipelineFeatures {
  constructor (aggregationPipeline, queryString) {
    this.pipeline = aggregationPipeline
    this.queryString = queryString
  }

  filter = () => {
    //  1A) Filtering
    const queryObj = { ...this.queryString }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObj[el])

    //  1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    if (queryStr) {
      const filterObj = JSON.parse(queryStr)

      if (filterObj.name) filterObj.name = { $regex: filterObj.name, $options: 'i' }
      if (filterObj.discipline) filterObj.discipline = { $regex: filterObj.discipline, $options: 'i' }

      this.pipeline.unshift({ $match: filterObj })
    }

    return this
  }

  sort = () => {
    if (this.queryString?.sort) {
      let sortBy
      let order

      if (this.queryString.sort.at(0) !== '-') {
        sortBy = this.queryString.sort
        order = 1
      } else {
        sortBy = this.queryString.sort.slice(1)
        order = -1
      }

      this.pipeline.push({ $sort: { [sortBy]: order } })
    } else {
      this.pipeline.push({ $sort: { createdAt: 1 } })
    }

    return this
  }

  limit = () => {
    if (this.queryString?.limit) {
      this.pipeline.push({ $limit: parseInt(this.queryString.limit) })
    }

    return this
  }
}
