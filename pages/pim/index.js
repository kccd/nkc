import router from './router';
import App from './App';
new Vue({
  router,
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdi'
    }
  }),
  render: h => h(App)
}).$mount('#app');