const {DraftModel} = require('../dataModels');
(async () => {
	const usersPersonal = await DraftModel.find({});
	for(let u of usersPersonal) {
     let desType = u.destination.type;
     let desTypeId = u.destination.typeid;
     u.desType = desType;
     u.desTypeId = desTypeId
		console.log(u);
		// if(mobile.indexOf('0086') === 0) {
		// 	u.mobile = mobile.replace(/0086/, '');
			await u.save();
		// }
	}
	console.log('完成！');
})();