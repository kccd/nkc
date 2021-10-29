import VueRouter from 'vue-router';
import Home from './routes/Home';
import Target from './routes/Target';
const routes = [
  {name: 'home', path: '/', component: Home},
  {name: 'target', path: '/target', component: Target}
];

export default new VueRouter({
  routes
});