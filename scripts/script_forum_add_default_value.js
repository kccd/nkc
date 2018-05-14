const {SmsModel, PostModel, ForumModel, UsersSubscribeModel, ThreadModel} = require('../dataModels');


(async () => {

	console.log('设置默认信息');
	const forums = await ForumModel.find({});
	await Promise.all(forums.map(async forum => {
		await forum.updateForumMessage();
		const us = await UsersSubscribeModel.find({subscribeForums: forum.fid});
		forum.followersId = us.map(u => u.uid);
		await forum.save();
	}));
	console.log('done.');


	const err = [];
	console.log('处理post上的fid');
	const count = await PostModel.count({});
	let number = 0;
	const limit = 1000;
	while(number <= count) {
		const posts = await PostModel.find({}).sort({toc: 1}).skip(number).limit(limit);
		number += limit;
		await Promise.all(posts.map(async p => {
			const thread = await ThreadModel.findOne({tid: p.tid});
			if(thread && thread.fid !== p.fid){
				await p.update({fid: thread.fid});
				err.push(p.pid);
			}
		}));
		let n = (number/count)*100;
		if(n > 100) n = 100;
		console.log(`${n.toFixed(2)}% 总：${count} 当前：${number}-${number+limit} err: ${err.length}`);
	}

	console.log(`err:`);
	console.log(err);

	console.log('done.');
})();


/*

const {PostModel, ForumModel, UsersSubscribeModel, ThreadModel} = require('../dataModels');
(async () => {

	console.log('处理post上的fid');
	const count = await ThreadModel.count({});
	let number = 0;
	const limit = 1000;
	const err = [];
	while(number <= count) {
		const threads = await ThreadModel.find({}).sort({toc: 1}).skip(number).limit(limit);
		number += limit;
		await Promise.all(threads.map(async t => {
			const post = await PostModel.findOnly({pid: t.oc});
			if(post.fid !== t.fid) {
				await post.update({fid: t.fid});
				err.push(post.pid);
			}
		}));
		let n = (number/count).toFixed(2);
		if(n > 100) n = 100;
		console.log(`${n*100}% 总：${count} 当前：${number}-${number+1000} err: ${err.length}`);
	}

	const forums = await ForumModel.find({});
	await Promise.all(forums.map(async forum => {
		await forum.updateForumMessage();
		const us = await UsersSubscribeModel.find({subscribeForums: forum.fid});
		forum.followersId = us.map(u => u.uid);
		await forum.save();
	}));
	console.log('done.');

	console.log(err);
})();*/
