<template>
  <div id="category">
    <div class="page-header">
      <h1 v-if="category.title">{{category.title}}</h1>
      <h1 v-else>{{'new' | i18n}} {{'category' | i18n}}</h1>
    </div>

    <form>
      <div class="form-group">
        <label for="title">{{'title' | i18n}}</label>
        <input type="text" class="form-control" v-model="category.title">
      </div>

      <div class="form-group">
        <label for="name">{{'name' | i18n}}</label>
        <input type="text" class="form-control" v-model="category.name">
      </div>

      <div class="form-group">
        <label for="subtitle">{{'subtitle' | i18n}}</label>
        <input type="text" class="form-control" v-model="category.subtitle">
      </div>

      <div class="form-group">
        <label for="cover">{{'cover' | i18n}}</label>
        <div class="category-cover img-rounded">
          <img :src="category.cover" v-if="category.cover">
          <img src="https://placeholdit.imgix.net/~text?txtsize=47&txt=NO%20COVER&w=500&h=213" v-else>
        </div>

        <input type="file" v-el:cover>
      </div>

      <div class="form-group">
        <button class="btn btn-primary" @click="submit" v-el:submit><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> {{'finish' | i18n}}</button>
        <button class="btn btn-danger" @click="delete" v-if="category._key"><span class="glyphicon glyphicon-remove"></span> {{'delete' | i18n}}</button>
      </div>
    </form>
  </div>
</template>

<script>
  import Category from '../../models/Category'
  import Album from '../../models/Album'
  import filmyBucket from '../../models/qiniu-bucket'
  import 'sweetalert'
  import Vue from 'vue'

  const swalp = (...args) => {
    return new Promise(resolve => {
      swal(...args, (...argv) => resolve(...argv))
    })
  }

  export default {
    data() {
      return {
        category: {},
        model: null,
        new: false
      }
    },

    ready() {
      if (this.$route.params.name === 'new') {
        this.new = true
        return
      }

      Category.search('name', this.$route.params.name)
        .then(([ category ]) => {
          this.model = category
          this.category = category.getCacheData()
        })
    },

    methods: {
      submit() {
        const i18n = Vue.filter('i18n')
        let updateAlbums = false

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
            return new Promise(resolve => {
              if (this.$els.cover.files.length === 0) {
                return resolve([ this.category.cover, password ])
              }

              filmyBucket.fetchPutToken(password)
                .then(putToken => {
                  const key = `assets/category-${this.category.name}-${Math.random().toString(32).substr(2)}`

                  return filmyBucket.putFile(key, this.$els.cover.files[0], { putToken })
                    .then(() => key)
                })
                .then(key => resolve([filmyBucket.key(key).url(), password]))
            })
          })
          .then(([ coverUrl, password ]) => {
            this.category.cover = coverUrl

            if (this.new) {
              return new Promise(resolve => {
                this.model = new Category(this.category)
                this.model.once('ready', () => resolve(password))
              })
            } else if (this.$route.params.name !== this.category.name) {
              return Album.search('category', this.$route.params.name)
                .then(albums => {
                  return Promise.all(
                    albums.map(album => album.set('category', this.category.name))
                  )
                    .then(() => Album.saveToCloud(password))
                    .then(() => password)
                })
            } else {
              return password
            }
          })
          .then(password => {
            return Promise.all(
              [ 'title', 'name', 'subtitle', 'cover' ].map(key => this.model.set(key, this.category[key]))
            )
              .then(() => password)
          })
          .then(password => Category.saveToCloud(password))
          .then(() => {
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
          .then(password => Category.saveToCloud(password))
          .then(() => {
            swal({
              title: i18n('update succeed'),
              type: 'success'
            })

            this.$route.router.go('/categories')
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
  .category-cover {
    width: 500px;
    height: 213px;
    margin: 5px;
    overflow: hidden;
    position: relative;
  }

  .category-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>