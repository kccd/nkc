const Router = require('koa-router');
const resumeRouter = new Router();
const moment = require('moment');
resumeRouter
	.get('/', async  (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.personalInfo = userPersonal.personalInfo;
    data.accounts = userPersonal.accounts;
    data.lifePhotos = await userPersonal.extendLifePhotos();
    data.privacy = userPersonal.privacy;
    data.certsPhotos = await userPersonal.extendCertsPhotos();
		data.education = userPersonal.education;
		data.industries = userPersonal.industries;
		for(let e of data.education) {
			if(e.timeB) {
				e.timeB = moment(e.timeB).format('YYYY-MM-DD');
			}
		}
		for(let i of data.industries) {
			if(i.timeB) {
				i.timeB = moment(i.timeB).format('YYYY-MM-DD');
			}
			if(i.timeE) {
				i.timeE = moment(i.timeE).format('YYYY-MM-DD');
			}
		}
		const forums = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
		const forumsObj = [];
		for(let f of forums) {
			let level = 2;
			if(f.parentsId.length === 0) {
				level = 1;
			}
			forumsObj.push({
				id: f.fid,
				name: f.displayName,
				parentsId: f.parentsId,
				level
			})
		}
		data.forumsObj = forumsObj;
		data.privacy = userPersonal.privacy;
		ctx.template = 'interface_user_settings_resume.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const {address, location, name, birthDate, education, industries, gender, privacy} = body;
		const {personalInfo} = userPersonal;
		personalInfo.address = address;
		personalInfo.location = location;
		personalInfo.name = name;
		personalInfo.birthDate = birthDate?new Date(birthDate+' 00:00:00'):'';
		personalInfo.gender = gender;
		for(let e of education) {
			if(e.timeB) {
				e.timeB = new Date(e.timeB+' 00:00:00');
			}
		}
		for(let i of industries) {
			if(i.timeB) {
				i.timeB = new Date(i.timeB+' 00:00:00');
			}
			if(i.timeE) {
				i.timeE = new Date(i.timeE+' 00:00:00');
			}
		}
		await userPersonal.update({personalInfo, education, industries, privacy});
		await next();
	});
module.exports = resumeRouter;