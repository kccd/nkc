const {UsersSubscribeModel, ForumModel} = require('../../dataModels');
(async () => {
	const total = await UsersSubscribeModel.count();
	let errCount = 0, number = 0; errDataCount = 0;
	const limit = 1000;
	while (number <= total) {
		const UsersSubscribe = await UsersSubscribeModel.find({}).sort({toc: -1}).skip(number).limit(limit);
		await Promise.all(UsersSubscribe.map(async u => {
			let foundErr = false;
			const {subscribeForums} = u;
			let newFidArr = [];
			for(let fid of subscribeForums) {
				const fidArr = fid.split(',');
				if(fidArr.length !== 1) {
					foundErr = true;
					errDataCount ++;
				}
				newFidArr = newFidArr.concat(fidArr);
			}
			if(foundErr) {
				errCount ++;
			}
			const fidArr = [];
			await Promise.all(newFidArr.map(async fid => {
				const forum = await ForumModel.findOne({fid});
				if(forum && !fidArr.includes(fid)) {
					fidArr.push(fid);
				}
			}));
			await u.update({subscribeForums: fidArr});
		}));
		let display = ((number/total)*100).toFixed(2);
		if(display > 100) display = 100;
		if(number + limit >= total) display = 100;
		console.log(`${display}%   总：${total}   当前：${number} - ${number + 1000}   错误人数：${errCount}   错误数据量：${errDataCount}`);
		number += limit;
	}
	console.log('done.');
})();

/*{
	"_id" : ObjectId("5a5502bb2d59cd3d084e6de7"),
	"uid" : "70129",
	"subscribers" : [],
	"subscribeUsers" : [],
	"subscribeForums" : [
	"134,32,164,106,81,21",
	""
],
	"__v" : 0
}*/