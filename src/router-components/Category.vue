<template>
  <div id="category">
    <a class="back back-white" v-link="{ path: '/' }"><span class="icon-arrow-left"></span> <span>{{ 'home' | i18n | toUpperCase }}</span></a>

    <search-bar :router="$route.router" :options="{ category: $route.params.name }"></search-bar>
    <category :category="category" as-title="true"></category>

    <albums-list :albums="albums"></albums-list>
  </div>
</template>

<script>
  import Category from '../models/Category'
  import Album from '../models/Album'

  import CategoryItem from '../components/Category.vue'
  import AlbumsList from '../components/AlbumsList.vue'
  import SearchBar from '../components/SearchBar.vue'

  export default {
    name: 'CategoryPage',

    data() {
      return {
        category: {},
        albums: []
      }
    },

    ready() {
      Promise.all([
        Category.loadIfNotInit()
          .then(() => Category.search('name', this.$route.params.name))
          .then(result => result[0]),
        Album.fetchByCategory(this.$route.params.name)
      ])
        .then(([ category, albums ]) => {
          this.category = category.getCacheData()
          this.albums = albums.map(n => n.getCacheData())

          this.$dispatch('update-title', this.category.title)
        })
    },

    components: {
      Category: CategoryItem,
      AlbumsList,
      SearchBar
    }
  }
</script>

<style scoped>
  .back {
    position: absolute;
    z-index: 999;

    color: #666;
    cursor: pointer;
    padding: .5rem 0;
    margin: .5rem .8rem 0 .8rem;
    font-family: Arial;
    text-decoration: none;
  }
  .back .icon-arrow-left {
    vertical-align: middle;
  }

  .back.back-white {
    color: white;
    text-shadow: 0 0 1px gray;
  }
</style>