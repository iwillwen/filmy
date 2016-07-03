<template>
  <section id="album-info">
    <p>{{content}}</p>
  </section>
</template>

<script>
  export default {
    props: [ 'content' ]
  }
</script>

<style scoped>
  #album-info {
    width: 100%;
    padding: .5rem .8rem;
    background: white;
  }

  @media only screen and (min-width: 500px) {
    #album-info {
      width: 20.4vw;
      float: right;
    }
  }
</style>