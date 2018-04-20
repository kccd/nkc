const Router = require('koa-router');
const resumeRouter = new Router();
resumeRouter
	.get('/', async  (ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.personalInfo = userPersonal.personalInfo;
		data.education = userPersonal.education;
		data.industries = userPersonal.industries;
		ctx.template = 'interface_user_settings_resume.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const {address, location, name, birthDate, education, industries, gender} = body;
		const {personalInfo} = userPersonal;
		personalInfo.address = address;
		personalInfo.location = location;
		personalInfo.name = name;
		personalInfo.birthDate = birthDate;
		personalInfo.gender = gender;
		await userPersonal.update({personalInfo, education, industries});
		await next();
	});
module.exports = resumeRouter;