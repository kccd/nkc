const {indexUser, updateUser, indexPost, updatePost} = require('../settings/elastic');
const {UserModel, PostModel} = require('../dataModels');
const time = Date.now();

const restoreUsers = async () => {
	const total = await UserModel.count({});
	const n = 200;
	let m = 0;
	for(let i = 0; 1 >= 0; i++) {
		let p = (m/total)*100;
		p = p.toFixed(2);
		if (p > 100) p = 100;
		console.log(`已完成：${p}%    总：${total}, 第：${m} - ${m+n}`);
		const users = await UserModel.find({}).sort({toc: -1}).skip(m).limit(n);
		await Promise.all(users.map(async user => {
			try {
				await updateUser(user);
			} catch(err) {
				await indexUser(user);
			}
		}));
		if(m >= total) {
			console.log('users done');
			break;
		}
		m = m+n;
	}
};

const restorePosts = async () => {
	const total = await PostModel.count({});
	const n = 200;
	let m = 0;
	for(let i = 0; 1 >= 0; i++) {
		let p = (m/total)*100;
		p = p.toFixed(2);
		if (p > 100) p = 100;
		console.log(`已完成：${p}%    总：${total}, 第：${m} - ${m+n}`);

		const posts = await PostModel.find({}).sort({toc: -1}).skip(m).limit(n);
		await Promise.all(posts.map(async post => {
			try {
				await updatePost(post);
			} catch(err) {
				await indexPost(post);
			}
		}));
		if(m >= total) {
			console.log('posts done');
			break;
		}
		m = m+n;
	}
};

(async () => {
	try {
		await restoreUsers();
		await restorePosts();
	} catch (err) {
		console.log(err);
	}
	console.log(`耗时：${Date.now() - time}ms`);
})();