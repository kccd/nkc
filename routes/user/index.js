const Router = require('koa-router');
const subscribeRouter = require('./subscribe');
const collectionsRouter = require('./collections');
const activitiesRouter = require('./activities');
const billRouter = require('./bills');
const productionRouter = require('./production');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {username, uid} = query;
    const targetUsers = [];
    if(username !== undefined) {
    	const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    	if(user) targetUsers.push(user);
    }
    if(uid !== undefined) {
    	const user = await db.UserModel.findOne({uid});
    	if(user) targetUsers.push(user);
    }
    data.targetUsers = targetUsers;
    await next();
  })
	//个人名片
  .get('/:uid', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {user} = data;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		const usersSubscribe = await db.UsersSubscribeModel.findOnly({uid});
		data.targetUser = targetUser;
		data.userSubscribe = usersSubscribe;
		ctx.template = 'interface_user.pug';
    await next();
  })
  .get('/:uid/ban', async (ctx, next) => {
  	const {data, db, params} = ctx;
  	const {uid} = params;
  	const targetUser = await db.UserModel.findOnly({uid});
  	const {certs} = targetUser;
  	if(certs.includes('banned')) {
  		ctx.throw(400, '该用户已经被封禁，请刷新。');
	  }
	  if(certs.indexOf('moderator') >= 0 ||
		  certs.indexOf('editor') >= 0 ||
		  certs.indexOf('dev') >= 0 ||
		  certs.indexOf('scholar') >= 0 ||
		  targetUser.xsf > 0){
			if(data.userLevel < 6) {
				ctx.throw(403, '为什么？你为何要封禁此用户？你是怎么了？');
			}
	  }
	  await targetUser.update({$addToSet: {certs: 'banned'}});
  	await next();
    /*let {uid} = ctx.params;
    let {db} = ctx;
    let targetUser = await db.UserModel.findOnly({uid: uid});
    let certs = targetUser.certs;
    if(certs.indexOf('banned') > -1) ctx.throw(400, '该用户在你操作之前已经被封禁了，请刷新');
    if(
      certs.indexOf('moderator') >= 0 ||
      certs.indexOf('editor') >= 0 ||
      certs.indexOf('dev') >= 0 ||
      certs.indexOf('scholar') >= 0 ||
      targetUser.xsf > 0
    ){
    	if()
      ctx.throw(400, '为什么？你为何要封禁此用户？你是怎么了？');
    }
    await db.UserModel.replaceOne({uid: targetUser.uid}, {$addToSet: {certs: 'banned'}});
    ctx.data.message = `封禁用户成功`;
    await next();*/
  })
  .put('/:uid/ban', async (ctx, next) => {
  	const {db, params} = ctx;
  	const {uid} = params;
  	const targetUser = await db.UserModel.findOnly({uid});
  	if(!targetUser.certs.includes('banned')) {
			ctx.throw(400, '该用户未被封禁，请刷新。');
	  }
	  await targetUser.update({$pull: {certs: 'banned'}});
  	await next();
    /*let {uid} = ctx.params;
    let {db} = ctx;
    let targetUser = await db.UserModel.findOnly({uid: uid});
    let certs = targetUser.certs;
    if(certs.indexOf('banned') === -1) ctx.throw(400, '该用户未被封禁，请刷新');
    await db.UserModel.replaceOne({uid: targetUser.uid}, {$pull: {certs: 'banned'}});
    ctx.data.message = `解封用户成功`;
    await next();*/
  })
  .post('/:uid/pop', async (ctx, next) => {
    const uid = ctx.params.uid;
    ctx.data.message = `推送/取消热门 用户: ${uid}`;
    await next();
  })
  .use('/:uid/subscribe', subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:uid/collections', collectionsRouter.routes(), collectionsRouter.allowedMethods())
	.use('/:uid/bills', billRouter.routes(), billRouter.allowedMethods())
	.use('/:uid/production', productionRouter.routes(), productionRouter.allowedMethods())
  .use('/:uid/activities', activitiesRouter.routes(), activitiesRouter.allowedMethods());
module.exports = userRouter;