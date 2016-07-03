<template>
  <div id="config">
    <div class="page-header">
      <h1>{{'setting' | i18n}}</h1>
    </div>

    <div class="row">
      <form>
        <div class="form-group">
          <label for="title">{{'title' | i18n}}</label>
          <input type="text" class="form-control" id="title" placeholder="Filmy" v-model="title" />
        </div>

        <div class="form-group">
          <label for="subtitle">{{'subtitle' | i18n}}</label>
          <textarea type="text" class="form-control" id="subtitle" rows="7" v-model="subtitle"></textarea>
        </div>

        <label for="background">{{'background image' | i18n}}</label>
        <div class="form-group" style="overflow: hidden">
          <label class="col-sm-2 control-label"><input type="radio" value="url" name="background" v-model="background"> URL</label>
          <div class="col-sm-10">
            <input type="url" class="form-control" v-model="background_url">
          </div>

          <label class="col-sm-2 control-label"><input type="radio" value="file"  name="background" v-model="background"> {{'upload file' | i18n}}</label>
          
          <div class="col-sm-10">
            <input type="file" v-el:backgroundfile>
          </div>
        </div>

        <button type="button" class="btn btn-primary" @click="submit" data-toggle="button" data-loading-text="{{'working' | i18n}}..." v-el:submit>{{'finish' | i18n}}</button>
        <button type="button" class="btn btn-default" @click="reset">{{'reset' | i18n}}</button>
      </form>
    </div>
  </div>
</template>

<script>
  import swal from 'sweetalert'
  import Vue from 'vue'

  import filmyBucket from '../../models/qiniu-bucket'
  import Config from '../../models/Config'

  import openSimpleModal from '../../libs/simple-modal'

  export default {
    data() {
      return {
        title: '',
        subtitle: '',
        background: 'url',
        background_url: '',

        defaultConfig: {}
      }
    },

    ready() {
      Config.load()
        .then(config => {
          this.defaultConfig = config
          this.updateConfig(config)
        })
    },

    methods: {
      updateConfig(config) {
        this.title = config.title
        this.subtitle = config.description
        this.background_url = config.background
      },

      reset() {
        this.updateConfig(this.defaultConfig)
        this.background = 'url'
      },

      submit() {
        swal({
          title: Vue.filter('i18n')('input password'),
          type: 'input',
          inputType: 'password',
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          showLoaderOnConfirm: true
        }, password => {
          filmyBucket.fetchPutToken(password)
            .then(putToken => {
              switch (this.background) {
                case 'url':
                  return this.background_url
                  break
                case 'file':
                  const file = this.$els.backgroundfile.files[0]
                  if (!file) {
                    throw new Error('Please select a file.')
                  }

                  const key = `assets/bg-${Math.random().toString(32).substr(2)}`
                  return filmyBucket.putFile(key, file, { putToken })
                    .then(() => {
                      const asset = filmyBucket.key(key)
                      return asset.url()
                    })
              }
            })
            .then(backgroundUrl => {
              const config = {
                title: this.title,
                description: this.subtitle,
                background: backgroundUrl
              }

              return Config.update(password, config)
            })
            .then(() => swal({
              type: 'success',
              title: Vue.filter('i18n')('update succeed')
            }))
            .catch(err => swal({
              type: 'error',
              title: err.message || Vue.filter('i18n')('something went wrong')
            }))
        })
      }
    }
  }
</script>

<style scoped>
  @import url('https://cdn.jsdelivr.net/sweetalert/1.1.3/sweetalert.css')
</style>