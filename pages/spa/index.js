import router from './router';
import Vue from 'vue';
import App from './App';
import store from './store';
import Breadcrumb from '../lib/vue/Breadcrumb';
import Viewer from 'v-viewer';
Vue.use(Viewer);
Vue.component('bread-crumb', Breadcrumb);
Viewer.setDefaults({
  toolbar: false,
  navbar: false,
  transition: true,
});
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
