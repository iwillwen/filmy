<template>
  <div id="album">
    <div class="page-header">
      <h1 v-if="!new">{{album.title}}</h1>
      <h1 v-else>{{'new' | i18n}} {{'album' | i18n}}</h1>
    </div>

    <form>
      <div class="form-group">
        <label for="title">{{'title' | i18n}}</label>
        <input type="text" class="form-control" v-model="album.title">
      </div>

      <div class="form-group">
        <label for="category">{{'category' | i18n}}</label>
        <select class="form-control" v-model="album.category">
          <option
            v-for="category in categories"
            :selected="category.selected"
            :value="category.name"
          >{{category.title}}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="content">{{'text content' | i18n}}</label>
        <textarea class="form-control" id="content" rows="7" v-model="album.content"></textarea>
      </div>

      <div class="photos" :class="{ over: over }" v-el:photos>
        <div class="photo img-rounded" v-for="(index, photo) in album.photos">
          <span @click="removePhoto(index)" class="remove-btn glyphicon glyphicon-remove" aria-hidden="true"></span>
          <img :src="photo">
        </div>
        <div class="photo" >
          <span class="add-btn glyphicon glyphicon-plus" aria-hidden="true" v-el:add></span>
        </div>
      </div>

      <div class="form-group">
        <button class="btn btn-primary" @click="submit" v-el:submit><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> {{'finish' | i18n}}</button>
        <button class="btn btn-danger" @click="delete" v-if="!new"><span class="glyphicon glyphicon-remove"></span> {{'delete' | i18n}}</button>
      </div>
    </form>
  </div>
</template>

<script>
  import Album from '../../models/Album'
  import Category from '../../models/Category'

  import Vue from 'vue'
  import qiniu from 'qiniu.js'
  import filmyBucket from '../../models/qiniu-bucket'
  import 'sweetalert'

  const URL = window.URL || window.webkitURL

  const swalp = (...args) => {
    return new Promise(resolve => {
      swal(...args, (...argv) => resolve(...argv))
    })
  }

  export default {
    data() {
      return {
        album: {
          photos: []
        },
        model: null,
        categories: [],
        new: false,
        over: false,

        photosToUpload: new Map()
      }
    },

    ready() {
      qiniu.bind(this.$els.add)
        .on('file', this.addPhoto)

      if (qiniu.supportDnd) {
        qiniu.bind.dnd(this.$els.photos, {})
          .on('over', () => this.over = true)
          .on('out', () => this.over = false)
      }

      Category.dump()
        .then(categories => this.categories = categories)

      if (this.$route.params.key === 'new') return this.new = true

      Album.fetch(this.$route.params.key)
        .then(album => {
          if (this.categories.length > 0) {
            this.categories
              .filter(c => c.name === album.getCacheData().category)
              .shift()
              .selected = true
          }

          this.model = album
          this.album = album.getCacheData()
        })
    },

    methods: {
      removePhoto(index) {
        this.photosToUpload.delete(this.album.photos[index])
        this.album.photos.splice(index, 1)
      },

      addPhoto(file) {
        this.over = false

        file.imageView({
          mode: 1,
          width: 125,
          height: 125
        }, (err, image) => {
          if (err) return

          image.toBlob(blob => {
            const blobUrl = URL.createObjectURL(blob)

            this.album.photos.push(blobUrl)
            this.photosToUpload.set(blobUrl, file)
          })
        })
      },

      submit() {
        const i18n = Vue.filter('i18n')

        swalp({
          title: i18n('input password'),
          type: 'input',
          inputType: 'password',
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          showLoaderOnConfirm: true
        })
          .then(password => {
            return filmyBucket.fetchPutToken(password)
              .then(putToken => [ putToken, password ])
          })
          .then(([ putToken, password ]) => {
            if (this.photosToUpload.size === 0) {
              return [ this.album.photos, password ]
            } else {
              const files = []

              for (const [, file] of this.photosToUpload.entries())
                files.push(file)

              return Promise.all(
                files.map(file => {
                  const key = `assets/photos/${Math.random().toString(32).substr(2)}`
                  return filmyBucket.putFile(key, file, { putToken })
                    .then(() => filmyBucket.key(key).url())
                })
              )
                .then(urls => {
                  return this.album.photos 
                    .filter(url => url[0] === 'h') // http://
                    .concat(urls)
                })
                .then(urls => [ urls, password ])
            }
          })
          .then(([ photos, password ]) => {
            if (this.new) {
              this.model = new Album({})
            }

            return Promise.all(
              [ 'title', 'category', 'content' ].map(key => {
                return this.model.set(key, this.album[key])
              })
            )
              .then(() => this.model.set('photos', photos))
              .then(() => password)
          })
          .then(password => Album.saveToCloud(password))
          .then(() => {
            this.photosToUpload = new Map()

            swal({
              title: i18n('update succeed'),
              type: 'success'
            })
          })
          .catch(err => {
            swal({
              title: err.message || i18n('something went wrong'),
              type: 'error'
            })
          })
      },

      delete() {
        const i18n = Vue.filter('i18n')

        swalp({
          title: i18n('are you sure'),
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          closeOnConfirm: false
        })
          .then(() => swalp({
            title: i18n('input password'),
            type: 'input',
            inputType: 'password',
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true
          }))
          .then(password => this.model.remove().then(() => password))
          .then(password => Album.saveToCloud(password))
          .then(() => {
            swal({
              title: i18n('update succeed'),
              type: 'success'
            })

            this.$route.router.go('/albums')
          })
          .catch(err => {
            swal({
              title: err.message || i18n('something went wrong'),
              type: 'error'
            })
          })
      }
    }
  }
</script>

<style scoped>
  .photos {
    width: 100%;
    min-height: 400px;
    border: 5px dashed #CCC;
    border-radius: 5px;
    padding: 5px;
    margin-bottom: 10px;
  }

  .photos.over {
    border-color: #888;
  }

  .photo {
    width: 125px;
    height: 125px;
    margin: 2.5px;
    float: left;
    position: relative;
  }

  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo .remove-btn {
    display: none;
    position: absolute;
    font-size: 10px;
    width: 16px;
    height: 16px;
    padding-left: 1px;
    line-height: 16px;
    text-align: center;

    background: #d9534f;
    color: #FFF;
    border-radius: 7px;
    top: -7px;
    right: -7px;
    cursor: pointer;
    z-index: 999;
  }

  .photo:hover .remove-btn {
    display: block;
  }

  .photo .add-btn {
    font-size: 25px;
    border: 2px dashed #999;
    cursor: pointer;
    color: #999;

    width: 125px;
    height: 125px;
    line-height: 125px;
    text-align: center;
  }
</style>