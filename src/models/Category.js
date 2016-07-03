/**
 * Category
 */

import min from 'min'
import Model from 'min-model'
import filmyBucket from './qiniu-bucket'
import ChineseStringIndexer from '../libs/chinese-string-indexer'
import { isString } from 'lodash'

Model.use(min)

const Category = Model.extend('category', {
  title: String,
  name: String,
  subtitle: String,
  cover: String
})

Category.setIndexerForColumn('title', ChineseStringIndexer)
Category.setIndex('title')
Category.setIndex('name')

let ready = false

Category.load = function() {
  return Category.allInstances()
    .then(categories => {
      if (categories.length > 0) {
        ready = true
        return categories
      } else {
        return filmyBucket.getFile('categories.json')
          .then(body => JSON.parse(body))
      }
    })
    .then(categories => {
      return Promise.all(
        categories.map(category => {
          if (!ready) {
            return new Promise(resolve => {
              const _category = new Category(category._key, category)
              _category.once('ready', () => resolve(_category))
            })
          } else {
            return category
          }
        })
      )
    })
    .then(categories => categories.sort((a, b) => a.getCacheData().created_at < b.getCacheData().created_at))
    .catch(error => [])
}

Category.loadIfNotInit = function() {
  if (!ready) {
    return Category.load()
  } else {
    return Promise.resolve()
  }
}

Category.saveToCloud = function(password) {
  if (!isString(password)) {
    throw new TypeError('Password must be a string')
  }

  return filmyBucket.fetchPutToken(password, 'categories.json')  
    .then(putToken => {
      return Category.dump()
        .then(data =>[ data, putToken ])
    })
    .then(([ data, putToken ]) => {
      const fileData = new Blob([ JSON.stringify(data) ], { type: 'application/json' })
      fileData.name = 'categories.json'

      return filmyBucket.putFile(
        fileData.name,
        fileData,
        { putToken }
      )
    })
}

export default Category