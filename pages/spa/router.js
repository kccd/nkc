import creationRoutes from './routes/creation';

const routes = [
  ...creationRoutes
];


// 防止路由重复点击报错

const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
