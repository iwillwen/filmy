<template>
  <div id="landing">
    <div id="landing-background" :style="backgroundStyle"></div>
    <div id="landing-content">
      <h1 id="landing-title" v-if="config.title">{{config.title}}</h1>
      <p id="landing-desc">{{{ config.description || '' | cr2br }}}</p>
    </div>
    <a class="scroll-down icon-arrow-left"></a>
  </div>
</template>

<script>
  export default {
    props: [ 'config' ],

    computed: {
      // Background Image
      backgroundStyle() {
        return { backgroundImage: `url('${this.config.background}')` }
      }
    },

    filters: {
      cr2br(str) {
        return str.replace(/\n/g, '<br />')
      }
    }
  }
</script>

<style scoped>
  #landing {
    width: 100vw;
    height: 100vh;
    background: #333;
    display: block;
    margin-bottom: 10px;

    -webkit-animation-duration: 0.5s;
    animation-duration: 0.5s;
  }

  #landing-title {
    display: block;
    border-left: 5px solid white;
    padding-left: 8px;
    padding-top: 5px;
    padding-bottom: 5px;
    font-family: "Lantinghei SC", "Lantinghei TC", "Merriweather", "Open Sans", sans-serif;
    font-size: 3rem;
    font-weight: normal;
  }

  #landing-desc {
    display: block;
    text-align: left;
    font-family: "Lantinghei SC", "Lantinghei TC", "Merriweather", "Open Sans", sans-serif;
    font-size: 18px;
    line-height: 1.3rem;
  }

  #landing-background {
    position: relative;
    width: 100vw;
    height: 100vh;
    top: 0;
    opacity: 0.6;
    background-size: cover;
    background-position: 50% 50%;
  }

  #landing-content {
    color: white;
    margin-left: 55.8vw;
    margin-top: -44.2vh;
    top: 0;
    width: 35%;
    position: relative;
  }

  @media only screen and (max-width: 900px) {
    #landing-content {
      margin-top: -55.2vh;
    }

    #landing-title {
      font-size: 2rem;
      margin-top: -46.2vh;
    }
    .scroll-down {
      bottom: 0;
    }
  }
  
  @media only screen and (max-width: 500px) {
    #landing-content {
      width: 75%;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }

    #landing-title {
      font-size: 1.8rem;
    }
  }

  .scroll-down {
    display: block;
    position: absolute;
    z-index: 100;
    bottom: 10vh;
    left: 50%;
    margin-left: -16px;
    width: 34px;
    height: 34px;
    font-size: 34px;
    text-align: center;
    text-decoration: none;
    color: rgba(255,255,255,0.7);
    -webkit-transform: rotate(-90deg);
    -ms-transform: rotate(-90deg);
    transform: rotate(-90deg);
  }

  .scroll-down:hover {
    color: #fff;
    -webkit-animation: none;
    animation: none;
  }
</style>