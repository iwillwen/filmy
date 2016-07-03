<template>
  <div id="search-result">
    <search-bar :query="decodeURIComponent($route.params.query)" static="true"></search-bar>

    <div class="margin-space"></div>

    <b class="title" v-if="!$route.query.category">分类</b>
    <content :categories="categories" v-if="!$route.query.category"></content>
    <span v-if="categories.length == 0 && !$route.query.category" id="empty">暂无分类</span>

    <b class="title">相册</b>
    <albums-list :albums="albums"></albums-list>
  </div>
</template>

<script>
  import SearchBar from '../components/SearchBar.vue'
  import Content from '../components/Content.vue'
  import AlbumsList from '../components/AlbumsList.vue'

  import Category from '../models/Category'
  import Album from '../models/Album'

  export default {
    name: 'SearchPage',

    data() {
      return {
        categories: [],
        albums: []
      }
    },

    ready() {
      const query = decodeURIComponent(this.$route.params.query)

      this.search(query)

      this.$on('search', query => this.search(query))
    },

    methods: {
      search(query) {
        let promises = []
        if (!this.$route.query.category) {
          promises = [
            Promise.all([
              Category.search('title', query),
              Category.search('name', query),
            ])
              .then(([ a, b ]) => a.concat(b))
              .then(result => result.map(n => new Category(n._key, n))),
            Promise.all([
              Album.search('title', query),
              Album.search('content', query)
            ])
              .then(([ a, b ]) => a.concat(b))
          ]
        } else {
          promises.push(
            Album.search('category', this.$route.query.category)
              .then(result => Promise.all([
                Album.search('title', query, result),
                Album.search('content', query, result)
              ]).then(([ a, b ]) => a.concat(b)))
          )
        }

        Promise.all(promises)
          .then(([ categories, albums ]) => {
            if (albums) {
              this.categories = categories.map(n => n.getCacheData())
              this.albums = albums.map(n => n.getCacheData())
            } else {
              this.albums = categories.map(n => n.getCacheData())
            }
          })
      }
    },

    components: {
      SearchBar,
      Content,
      AlbumsList
    }
  }
</script>

<style scoped>
  .margin-space {
    display: block;
    width: 100%;
    height: 65px;
  }

  b.title {
    margin: 5px 10px;
    display: block;
  }

  #empty {
    width: 100%;
    display: block;
    color: #999;
    text-align: center;
    font-family: "Lantinghei SC", "Lantinghei TC", Arial, serif;
    clear: both;
  }
</style>