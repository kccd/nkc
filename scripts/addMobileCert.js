const {UserModel, UsersPersonalModel} = require('../dataModels');
(async () => {
	const limit = 1000;
	let n = 0;
	const total = await UsersPersonalModel.count();
	while(n <= total) {
		const usersPersonal = await UsersPersonalModel.find().sort({toc: -1}).skip(n).limit(limit);
		for(let userPersonal of usersPersonal) {
			if(userPersonal.mobile && userPersonal.nationCode) {
				const user = await UserModel.findOnly({uid: userPersonal.uid});
				if(!user.certs.includes('mobile')) {
					await user.update({$addToSet: {certs: 'mobile'}});
					console.log(`uid: ${user.uid}   mobile: ${userPersonal.mobile}`);
				}
			}
		}
		let p = (n/total)*100;
		if(p > 100) {
			p = 100;
		}
		p = p.toFixed(1);
		console.log(`${p}%  总：${total}  当前：${n} - ${n + limit}`);
		n += limit;
	}
	console.log('done.');
	process.exit(1);
})();