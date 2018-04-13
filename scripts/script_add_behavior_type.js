const {UsersBehaviorModel, ForumModel} = require('../../dataModels');
(async () => {
	const limit = 1000;
	let number = 0;
	const query = {
		fid: {
			$ne: null
		}
	};
	const total = await UsersBehaviorModel.count(query);
	do{
		const behaviors = await UsersBehaviorModel.find(query).sort({timeStamp: 1}).skip(number).limit(limit);
		await Promise.all(behaviors.map(async behavior => {
			const forum = await ForumModel.findOne({fid: behavior.fid});
			if(forum){
				await behavior.update({type: forum.class});
			}
		}));
		let display = ((number/total)*100).toFixed(2);
		if(display > 100) display = 100;
		number += limit;
		console.log(`进度：${display}%   总计：${total}   当前：${number} - ${number + 1000}`);
	} while (number < total);
	console.log(`done.`);
})();
