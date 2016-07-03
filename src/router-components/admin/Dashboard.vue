<template>
  <div id="dashboard">
    <div class="page-header">
      <h1>{{'dashboard' | i18n}}</h1>
    </div>

    <div class="row">
      <div class="col-md-4 dashboard-number">
        <h1>{{numbers.categories}}</h1>
        <p>{{'number of categories' | i18n}}</p>
      </div>
      <div class="col-md-4 dashboard-number">
        <h1>{{numbers.albums}}</h1>
        <p>{{'number of albums' | i18n}}</p>
      </div>
      <div class="col-md-4 dashboard-number">
        <h1>{{numbers.photos}}</h1>
        <p>{{'number of photos' | i18n}}</p>
      </div>
    </div>

    <h3>{{'rates of categories' | i18n}}</h3>

    <div class="progress">
      <div v-for="category in categories" class="progress-bar progress-bar-{{pickBarColor()}}" :style="{ width: category.rate * 100 + '%' }"></div>
    </div>
    <div class="progress-labels">
      <div v-for="category in categories" v-if="category.rate > 0" class="progress-label" :style="{ width: category.rate * 100 + '%' }">{{category.title}}</div>
    </div>
  </div>
</template>

<script>
  import Category from '../../models/Category'
  import Album from '../../models/Album'

  export default {
    data() {
      return {
        numbers: {
          categories: 0,
          albums: 0,
          photos: 0
        },
        categories: []
      }
    },

    ready() {
      Promise.all([
        Category.loadIfNotInit()
          .then(() => Category.dump()),
        Album.loadIfNotInit()
          .then(() => Album.dump())
      ])
        .then(([ categories, albums ]) => {
          this.numbers.categories = categories.length
          this.numbers.albums = albums.length
          this.numbers.photos = albums
            .map(album => album.photos.length)
            .reduce((a, b) => a + b)

          for (const category of categories) {
            category.rate = albums
              .filter(album => album.category === category.name)
              .length / albums.length
          }

          this.categories = categories

          this.$route.router.app.$refs.sidebar.update(
            categories.length, albums.length
          )
        })
    },

    methods: {
      pickBarColor: (function() {
        let last = null
        const colors = [ 'success', 'primary', 'info', 'warning', 'danger' ]

        return function pickOne() {
          const color = colors[Math.round(Math.random() * (colors.length - 1))]

          if (color === last) {
            return pickOne()
          } else {
            last = color
            return color
          }
        }
      })()
    }
  }
</script>

<style scoped>
  .dashboard-number {
    text-align: center;
    padding: 5px 0;
    border-right: 1px solid #CCC;
  }
  .dashboard-number:last-child {
    border-right: none;
  }

  .dashboard-number h1 {
    font-size: 5rem;
  }
  .dashboard-number p {
    font-size: 1.7rem;
  }
  .progress-labels {
    margin-top: -15px;
  }
  .progress-label {
    display: inline-block;
    float: left;
    font-size: 1.8rem;
    line-height: 1.9rem;
    text-align: center;
  }
</style>