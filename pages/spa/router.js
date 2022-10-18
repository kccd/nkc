import creationRoutes from './routes/creation';
import userRouter from './routes/user';
const routes = [
  ...creationRoutes,
  ...userRouter,
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
  // 浏览器返回上一个页面时跳转到提交之前的滚动位置
  // scrollBehavior(to, from, savePosition){
  //   if(savePosition){
  //     return savePosition
  //   }else{
  //     return {x:0, y:0};
  //   }
  // },
  mode: 'history',
  routes
});

export default router;
