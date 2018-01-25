const Router = require('koa-router');
const meRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
meRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {type} = query;
		const page = query.page? parseInt(query.page): 0;
		ctx.template = 'interface_fund_me.pug';
		data.me = true;
		data.type = type;
		let q = {
			'status.disabled': false,
			'status.revoked': false,
			'status.exceededModifyCount': false,
			'status.submit': true
		};
		if(type === 'applying') { // 正在申请的
			q['status.adminSupport'] = {$ne: true};
		} else if (type === 'invalid') { // 无效的
			q = {
				$or: [
					{'status.disabled': true},
					{'status.revoked': true},
					{'status.exceededModifyCount': true},
				]
			}
		} else if (type === 'uncommitted') { // 未提交的
			q['status.submit'] = {$ne: true};
		} else if (type === undefined) { // 已完成的
			q['status.completed'] = true;
		}
		q.uid = user.uid;
		const length = await db.FundApplicationFormModel.count(q);
		const paging = apiFn.paging(page, length);
		const applicationForms = await db.FundApplicationFormModel.find(q).skip(paging.start).limit(paging.perpage);
		await Promise.all(applicationForms.map(async a => {
			await a.extendMembers();
			await a.extendApplicant();
			await a.extendFund();
		}));
		data.applicationForms = applicationForms;
		if (type === 'invitation') { //团队申请邀请
			const applicationUsers = await db.FundApplicationUserModel.find({uid: user.uid}).sort({toc: -1});
			const applicationForms = [];
			await Promise.all(applicationUsers.map(async u => {
				const applicationForm = await db.FundApplicationFormModel.findOnly({_id: u.applicationFormId});
				const {submit, disabled, exceededModifyCount} = applicationForm.status;
				if (applicationForm.uid !== user.uid && submit !== true && disabled !== true && exceededModifyCount !== true) {
					await applicationForm.extendFund();
					await applicationForm.extendApplicant();
					await applicationForm.extendMembers();
					applicationForms.push(applicationForm);
				}
			}));
			const length = applicationForms.length;
			const paging = apiFn.paging(page, length);
			const {start, perpage} = paging;
			data.applicationForms = applicationForms.slice(start, start + perpage);
		}
		await next();
	});
module.exports = meRouter;