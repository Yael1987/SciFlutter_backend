import Favorite from '../models/favoriteModel.js'
import BaseRepository from './BaseRepository.js'

export default class FavoriteRepository extends BaseRepository {
  constructor () {
    super(Favorite)
  }
}
