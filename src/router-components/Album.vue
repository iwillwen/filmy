<template>
  <div id="album">
    <a id="back" v-link="{ path: `/category/${this.album.category}` }"><span class="icon-arrow-left"></span> <span class="home-text">{{ 'back' | i18n | toUpperCase }}</span></a>
    <h1 id="album-title">{{album.title}}</h1>

    <album-info :content="album.content"></album-info>
    <photos-list :photos="album.photos"></photos-list>
  </div>
</template>

<script>
  import Album from '../models/Album'
  import Category from '../models/Category'

  import AlbumInfo from '../components/AlbumInfo.vue'
  import PhotosList from '../components/PhotosList.vue'

  export default {
    name: 'AlbumPage',

    data() {
      return {
        album: {}
      }
    },

    ready() {
      Album.loadIfNotInit()
        .then(() => Album.fetch(this.$route.params.key))
        .then(res => res.getCacheData())
        .then(album => {
          this.album = album

          return Category.search('name', album.category)
        })
        .then(([ category ]) => {
          this.$dispatch('update-title', `${this.album.title} - ${category.getCacheData().title}`)
        })
    },

    components: {
      AlbumInfo,
      PhotosList
    }
  }
</script>

<style scoped>
  #album {
    width: 100%;
    display: block;
  }

  #album-title {
    margin: 0;
    display: block;
    padding: 3px 0 3px 1rem;
    border-left: 5px solid #333;

    font-family: "Lantinghei SC", "Lantinghei TC", Arial, serif;
    background: white;
  }

  #back {
    color: #666;
    cursor: pointer;
    padding: 1rem 0 1rem .5rem;
    line-height: 1rem;
    font-family: Arial;
    text-decoration: none;
    display: block;
    background: white;
  }
  #back .icon-arrow-left {
    vertical-align: middle;
  }


  @media only screen and (min-width: 500px) {
    #album {
      width: 85%;
      margin: 0 auto;
    }

    #back {
      width: 63.75vw;
      display: inline-block;
    }

    #album-title {
      width: 63.75vw;
      display: inline-block;
    }
  }

</style>