<template>
  <div class="container">
    <div class="row">
      <div class="col-md-3">
        <sidebar v-ref:sidebar></sidebar>
      </div>
      <div class="col-md-9 pull-right">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
  import Sidebar from './Sidebar.vue'

  export default {
    components: {
      Sidebar
    }
  }
</script>