<template>
  <section id="album-photos">
    <img v-for="photo in photos" :data-src="photo" alt="" class="album-photo lazyload">
  </section>
</template>

<script>
  import 'lazysizes/lazysizes.min'

  export default {
    props: [ 'photos' ]
  }
</script>

<style scoped>
  #album-photos {
    width: 100%;
    background: white;
  }

  .album-photo {
    width: 100%;
    margin-top: .8rem;
  }

  @media only screen and (min-width: 500px) {
    #album-photos {
      width: 63.75vw;
    }
  }
</style>