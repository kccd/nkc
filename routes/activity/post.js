const Router = require('koa-router');
const postRouter = new Router();
postRouter
	// .get('/', async (ctx, next) => {
  //   const {data, db, params, query} = ctx;
  //   const {user} = data;
  //   console.log(user)
  //   const {acid} = params;
  //   const activity = await db.ActivityModel.findOnly({acid:acid});
  //   let c;
  //   if(activity){
  //     c = activity.description;
  //   }
  //   const post = {
  //     c:c,
  //     l:'html'
  //   }
  //   activity.description = ctx.nkcModules.nkc_render.experimental_render(post);
  //   if(user){
  //     activity.user = await activity.extendUser();
  //     activity.userPersonal = await activity.extendUserPersonal();
  //   }
  //   data.activity = activity;
	// 	ctx.template = 'activity/activitySingle.pug';
	// 	await next();
  // })
  .post('/:acid', async (ctx, next) => {
    const {data, db, query, body, params} = ctx;
    const {user} = data;
    const {ActivityModel, ActivityPostModel, UsersModel} = db;
    const {post} = body;
    const {acid} = post;
    if(!user){
      ctx.throw(400, "请前往注册");
    }
    if(user){
      post.uid = user.uid;
    }
    console.log(post)
    const activityPost = new ActivityPostModel(post);
    await activityPost.save();
    await next();
  })
module.exports = postRouter;