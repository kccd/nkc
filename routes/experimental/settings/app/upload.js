const PATH = require('path');
const Router = require('koa-router');
const router = new Router();
router
	.get('/', async  (ctx, next) => {
		const {data, db} = ctx;
		data.type = 'upload';
		// const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		// data.homeSettings = homeSettings;
		// data.noticeThreads = [];
		// if(homeSettings.noticeThreadsId && homeSettings.noticeThreadsId.length !== 0) {
		// 	for(const oc of homeSettings.noticeThreadsId) {
		// 		const thread = await db.ThreadModel.findOne({oc});
		// 		if(thread) {
		// 			await thread.extendFirstPost();
		// 			data.noticeThreads.push(thread);
		// 		}
		// 	}
		// }
		ctx.template = 'experimental/settings/app.pug';
		await next();
  })
  .post('/', async (ctx, next) => {
    const imageExt = ['apk', 'ipa'];
    const {data, db, body, settings, tools, fs} = ctx;
    const {file} = body.files;
    const {name, size, path, hash} = file;
    const {appPlatform, appVersion, appDescription, appToc} = body.fields || {};
    const repeatVersion = await db.AppVersionModel.count({appVersion});
    if (repeatVersion) {
      ctx.throw(400, "版本号重复！");
    }
    let appFilePath, appPath;

    const appBasePath = settings.upload.androidSavePath.replace(/app([\/\\].*)/, () => 'app');
    try{
      await fs.access(appBasePath);
    } catch(e) {
      await fs.mkdir(appBasePath);
    }

    try{
      await fs.access(settings.upload.androidSavePath);
    } catch(e) {
      await fs.mkdir(settings.upload.androidSavePath);
      await fs.mkdir(settings.upload.iosSavePath);
    }

    // 根据平台和版本号创建文件夹
    if(appPlatform === 'android') {
      appFilePath = settings.upload.androidSavePath + '/' + hash
    }else{
      appFilePath = settings.upload.iosSavePath + '/' + hash
    }

    try{
      await fs.mkdir(appFilePath);
    } catch (e) {
      // ctx.throw(500, `${e}`);
    }

    // 获取文件，修改文件名，将文件存入对应的文件夹
    let ext = PATH.extname(name);
    if(ext !== '.apk') ctx.throw(400, '不是安装包的格式');
    ext = ext.toLowerCase();
    ext = ext.replace('.', '');
    if(['exe'].includes(ext)) ctx.throw(403, '暂不支持上传该类型的文件');
    appPath = appFilePath + "/" + name;
    console.log(path, appPath);
    await fs.rename(path, appPath);

    // 添加上传记录
    await db.AppVersionModel.update({latest:true,appPlatForm:appPlatform}, {
      $set: {
        latest: false
      }
    });
    let appUpLog = db.AppVersionModel({
      appPlatForm: appPlatform,
      appVersion: appVersion,
      appDescription: appDescription,
      appSize: size,
      hash: hash,
      fileName: name,
      desTypeId: body.desTypeId
    });
    await appUpLog.save();


    await next();
  });
module.exports = router;