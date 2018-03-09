const {UsersPersonalModel} = require('../../dataModels');
(async () => {
	const usersPersonal = await UsersPersonalModel.find({mobile: {$ne: ''}}).sort({toc: 1});
	await UsersPersonalModel.updateMany({mobile: {$ne: ''}}, {$set: {nationCode: '86'}});
	for(let u of usersPersonal) {
		let mobile = u.mobile;
		console.log(mobile);
		if(mobile.indexOf('0086') === 0) {
			u.mobile = mobile.replace(/0086/, '');
			await u.save();
		}
	}
	console.log('完成！');
})();