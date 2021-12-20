import router from './router';
import App from './App';
import Breadcrumb from '../lib/vue/Breadcrumb';
Vue.component('bread-crumb', Breadcrumb);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
