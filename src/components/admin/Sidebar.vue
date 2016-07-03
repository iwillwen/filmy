<template>
  <div id="sidebar" v-el:sidebar>
    <h2>Filmy Admin</h2>

    <ul class="nav nav-pills nav-stacked">
      <li role="presentation" :class="{ active: active == 'dashboard' }"><a href="#!/dashboard">{{'dashboard' | i18n}}</a></li>
      <li role="presentation" :class="{ active: active == 'settings' }"><a href="#!/settings">{{'setting' | i18n}}</a></li>
      <li role="presentation" :class="{ active: active == 'categories' }"><a href="#!/categories">
        {{'category' | i18n}}
        <span class="badge">{{categories}}</span>
      </a></li>
      <li role="presentation" :class="{ active: active == 'albums' }"><a href="#!/albums">
        {{'album' | i18n}}
        <span class="badge">{{albums}}</span>
      </a></li>
      <hr />
      <li role="presentation"><a target="_blank" href="/">{{'go to home page' | i18n}}</a></li>
    </ul>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        categories: 0,
        albums: 0,

        active: 'dashboard'
      }
    },

    ready() {
      this.$route.router.beforeEach(({ to, next }) => {
        this.active = to.path.split('/')[1]

        next()
      })

      new Affix(this.$els.sidebar, {
        offsetTop: 50
      })
    },

    methods: {
      update(categories = this.categories, albums = this.albums) {
        this.categories = categories
        this.albums = albums
      }
    }
  }
</script>

<style scoped>
  
</style>