import Vue from 'vue'
import VueRouter from 'vue-router'
import i18n from '../libs/i18n'
import 'sweetalert'

Vue.filter('i18n', i18n)

// Promisify sweetalert
const swalp = (...args) => {
  return new Promise(resolve => {
    swal(...args, (...argv) => resolve(...argv))
  })
}

import Admin from '../components/admin/Admin.vue'

// Routes
import DashboardRoute from '../router-components/admin/Dashboard.vue'
import SettingsRoute from '../router-components/admin/Settings.vue'
import CategoriesRoute from '../router-components/admin/Categories.vue'
import CategoryRoute from '../router-components/admin/Category.vue'
import AlbumsRoute from '../router-components/admin/Albums.vue'
import AlbumRoute from '../router-components/admin/Album.vue'

// Qiniu Cloud Storage Bucket Instance
import filmyBucket from '../models/qiniu-bucket'

// Routing the router
Vue.use(VueRouter)

const router = new VueRouter()

router.map({
  '/': {
    component: {
      ready() {
        router.go('/dashboard')
      }
    }
  },

  '/dashboard': {
    name: 'dashboard',
    component: DashboardRoute
  },

  '/settings': {
    name: 'settings',
    component: SettingsRoute
  },

  '/categories': {
    name: 'categories',
    component: CategoriesRoute
  },

  '/categories/:name': {
    name: 'category',
    component: CategoryRoute
  },

  '/albums': {
    name: 'albums',
    component: AlbumsRoute
  },

  '/albums/:key': {
    name: 'album',
    component: AlbumRoute
  }
})

// Confirm the admin password
swalp({
  title: i18n('input password'),
  type: 'input',
  inputType: 'password',
  showCancelButton: true,
  closeOnConfirm: false,
  animation: "slide-from-top",
  showLoaderOnConfirm: true
})
  // Check the password
  .then(password => filmyBucket.fetchPutToken(password))
  .then(() => {
    swal({
      type: 'success',
      title: i18n('welcome back'),
      timer: 1500,
      showConfirmButton: false
    })
    router.start(Admin, '#admin')
  })
  .catch(() => {
    swalp({
      title: i18n('password wrong'),
      type: 'error'
    })
  })