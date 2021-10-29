import router from './router';
import App from './App';
import Vue from 'vue';
import Vuetify from './plugins/vuetify';
new Vue({
  router,
  vuetify: Vuetify,
  render: h => h(App)
}).$mount('#app');