import router from './router';
import App from './App';
import Breadcrumb from '../lib/vue/Breadcrumb';
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer)
Viewer.setDefaults({
  Options: { 'inline': true, 'button': true, 'navbar': true, 'title': true, 'toolbar': true, 'tooltip': true, 'movable': true, 'zoomable': true, 'rotatable': true, 'scalable': true, 'transition': true, 'fullscreen': true, 'keyboard': true, 'url': 'data-source' }
})
Vue.component('bread-crumb', Breadcrumb);
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
