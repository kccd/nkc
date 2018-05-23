// 匹配kechuang.
/*
const {PostModel} = require('../dataModels');
const reg = /kechuang\./;
const fs = require('fs');
(async () => {
	const limit = 1000;
	let n = 0;
	let result = 0;
	const total = await PostModel.count({});
	while(n <= total) {
		const posts = await PostModel.find().sort({toc: 1}).skip(n).limit(limit);
		for(let post of posts) {
			if(reg.test(post.c)) {
				result++;
				fs.appendFileSync('./pid.txt', post.pid + '\n');
			}
		}
		let p = (n/total)*100;
		if(p > 100) p = 100;
		p = p.toFixed(2);
		console.log(`${p}%  总：${total} 当前：${n} - ${n+limit}  匹配：${result}`);
		n += limit;
	}
})();*/

// 查找有资源但未插入的post
const {PostModel, ResourceModel} = require('../dataModels');
const fs = require('fs');
(async () => {
	const limit = 1000;
	let n = 0;
	let result = 0;
	const total = await ResourceModel.count({references: {$ne: []}});
	while(n <= total) {
		const resources = await ResourceModel.find({references: {$ne: []}}).sort({toc: 1}).skip(n).limit(limit);
		for(let r of resources) {
			if(r.references) {
				for(let pid of r.references) {
					if(pid.includes('fund')) break;
					const post = await PostModel.findOne({pid});
					if(post) {
						if(!post.c.includes(`#{r=${r.rid}}`) && !post.c.includes(`[attachment=${r.rid}]`)) {
							result++;
							fs.appendFileSync('notElementPid.txt', pid+'\n');
						}
					}

				}
			}
		}
		let p = (n/total)*100;
		if(p > 100) p = 100;
		p = p.toFixed(2);
		console.log(`${p}%  总：${total} 当前：${n} - ${n+limit}  匹配：${result}`);
		n += limit;
	}
	console.log('done.');
	if(n >= total) process.exit(1);
})();