import router from './router';
import App from './App';
import Breadcrumb from '../lib/vue/Breadcrumb';
import Viewer from 'v-viewer';
Vue.use(Viewer);
Vue.component('bread-crumb', Breadcrumb);
Viewer.setDefaults({
  toolbar: false,
  navbar: false,
  transition: true,
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

