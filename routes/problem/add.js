const Router = require('koa-router');
const addRouter = new Router();
addRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'problem/add.pug';
		const {data, query, db} = ctx;
		const {c, cid} = query;
		const typeId = Number(cid);
		if(typeId) {
      const problemsType = await db.ProblemsTypeModel.findOne({_id: typeId});
      if(problemsType) data.problemsType = problemsType;
    }
		data.c = c;
		data.referrer = ctx.get('referrer');
		await ctx.db.ProblemModel.ensureSubmitPermission({ip: ctx.address});
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, nkcModules} = ctx;
		await db.ProblemModel.ensureSubmitPermission({ip: ctx.address});
		const {fields, files} = body;
		const {
			title,
			content,
			referrer,
			nationCode,
			phoneNumber,
			email,
			qq
		} = fields;
		const images = files.files;
		const {checkString} = nkcModules.checkData;
		checkString(title, {
			name: '标题',
			minLength: 1,
			maxLength: 100,
		});
		checkString(content, {
			name: '详细内容',
			minLength: 1,
			maxLength: 5000,
		});
		checkString(referrer, {
			name: '页面链接',
			minLength: 0,
			maxLength: 1000,
		});
		checkString(phoneNumber, {
			name: '手机号',
			minLength: 0,
			maxLength: 100,
		});
		if(phoneNumber.length > 0 && !nationCode.length) {
			ctx.throw(400, `国际区号不能为空`);
		}
		checkString(email, {
			name: '邮箱',
			minLength: 0,
			maxLength: 100,
		});
		if(email.length > 0) {
			nkcModules.checkData.checkEmail(email);
		}
		checkString(qq, {
			name: 'QQ',
			minLength: 0,
			maxLength: 20
		});
		const {user} = data;
		const _id = await db.SettingModel.operateSystemID('problems', 1);
		const obj = {
      _id,
      t: title,
      c: content,
      QQ: qq,
      email,
			referrer,
			nationCode,
			phoneNumber,
      ip: ctx.address,
      port: ctx.port
    };
		if(user) {
		  obj.uid = user.uid;
    }
		const newProblem = db.ProblemModel(obj);
		if(user) {
			await db.KcbsRecordModel.insertSystemRecord('reportIssue', user, ctx);
		}
		await newProblem.save();
		if(images && images.length > 0) {
			await db.AttachmentModel.saveProblemImages(_id, images);
		}
		await next();
	});
module.exports = addRouter;
