import Home from './routes/Home';
const routes = [
  {name: 'home', path: '/', component: Home},
];

export default new VueRouter({
  routes
});