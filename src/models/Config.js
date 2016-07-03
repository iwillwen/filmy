/**
 * Config
 */

import min from 'min'
import filmyBucket from './qiniu-bucket'
import { isString, isPlainObject } from 'lodash'

const Config = {
  load(silent = false) {
    return min.exists('filmy:config')
      .then(exists => {
        if (exists) {
          // Fetch config from local store if cache was exists
          return min.hgetall('filmy:config')
        } else {
          // Fetch config from CDN
          return filmyBucket.getFile('config.json')
            .then(body => JSON.parse(body))
            .then(data => {

              try {
                min.hmset('filmy:config', data)
              } catch(err) {
                console.error(err);
              }
              return data
            })
        }
      })
      .catch(error => {
        if (!silent) alert('You must init Filmy with the administrator tools.')
      })
  },

  update(password, update = {}, silent = false) {
    if (!isString(password)) {
      throw new TypeError('Password must be a string')
    }

    return filmyBucket.fetchPutToken(password, 'config.json')
      .then(putToken => {
        return Config.load(silent)
          .then(oldConfig => [ oldConfig, putToken ])
          .catch(() => [ {}, putToken ])
      })
      .then(([ config, putToken ]) => {
        config = config || {}

        for (const key of Object.keys(update)) {
          config[key] = update[key]
        }

        const fileData = new Blob([ JSON.stringify(config) ], { type: 'application/json' })
        fileData.name = 'config.json'

        return filmyBucket.putFile(
          fileData.name,
          fileData,
          {
            putToken: putToken
          }
        )
      })
  }
}

export default Config