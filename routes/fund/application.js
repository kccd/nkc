const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
	.use('/:_id', async (ctx, next) => {
		const {data, db} = ctx;
		const {_id} = ctx.params;
		const applicationForm = await db.FundApplicationFormModel.findOnly({_id});
		await applicationForm.extendMembers();
		const fund = await applicationForm.extendFund();
		data.applicationForm = applicationForm;
		data.fund = fund;
		await next();
	})
  .get('/:_id/settings', async (ctx, next) => {
  	const {data, db} = ctx;
  	const {user, applicationForm, fund} = data;
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_apply.pug';
  	await next();
  })
	.patch('/:_id', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {selectedUsers, account, userMessages, inputStatus} = body;
		const {user} = data;
		const {_id} = params;
		const applicationForm = await db.FundApplicationFormModel.findOnly({_id});
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		let updateObj;
		if(inputStatus === 1) {
			for(let u of selectedUsers) {
				const user = await db.UserModel.findOnly({username: u.username, uid: u.uid});
				const newApplicationUser = db.FundApplicationUserModel({
					uid: user.uid,
					username: user.username,
					applicationId: _id
				});
				await newApplicationUser.save();
			}
			/*const members = await Promise.all(selectedUsers.map(async u => {
				const user = await db.UserModel.findOnly({username: u.username, uid: u.uid});
				const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
				const {name, idCardNumber, photos} = userPersonal.privateInformation;
				const {idCardA, idCardB, handheldIdCard, certs} = photos;
				const member = {
					uid: u.uid,
					username: u.username
				};
				if (name && idCardNumber) {
					member.name = name;
					member.idCardNumber = idCardNumber;
				}
				const info = {};
				info.idCardA = idCardA || undefined;
				info.idCardB = idCardB || undefined;
				info.handheldIdCard = handheldIdCard || undefined;
				info.certs = certs || undefined;
				member.info = info;
				return member;
			}));*/
			updateObj = {
				'status.chooseType': true
			}
		}
		if(inputStatus === 2) {
			const newUserMessages = applicationForm.userMessages;
			for (let key in userMessages) {
				newUserMessages[key] = userMessages[key];
			}
			updateObj = {
				account,
				newUserMessages,
				'status.inputUserMessages': true
			}
		}
		await applicationForm.update(updateObj);
		await next();
	});
module.exports = applicationRouter;
