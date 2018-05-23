const {PostModel, ResourceModel} = require('../dataModels');
const fs = require('fs');
const moment = require('moment');
fs.writeFileSync('./resourceToPost.txt', '');


const extArr = ['jpg', 'png', 'jpeg', 'bmp', 'svg', 'gif'];
(async () => {
	const limit = 1000;
	let n = 0;
	let result = 0;
	const total = await ResourceModel.count({references: {$ne: []}});
	while(n <= total) {
		const resources = await ResourceModel.find({references: {$ne: []}}).sort({toc: 1}).skip(n).limit(limit);
		for(let r of resources) {
			if(r.references) {
				const rid = r.rid;
				for(let pid of r.references) {
					if(pid.includes('fund')) break;
					const post = await PostModel.findOne({pid});
					if(post && post.toc.getTime() < (new Date('2016-6-6 0:0:0')).getTime()) {
						if(post.l === 'html') {
							if(!post.c.includes(`/r/${rid}`)) {
								let content;
								if(extArr.includes(r.ext.toLowerCase())) {
									content = post.c + `<p><img src="/r/${rid}"><br/></p>`;
								} else {
									content = post.c + `<p><a href="/r/${rid}"><img src="/default/default_thumbnail.png">${r.oname}</a></p>`
								}
								await post.update({c: content});
								result++;
								fs.appendFileSync('./resourceToPost.txt', `rid: ${rid}, pid: ${post.pid}, l: ${post.l}, toc: ${post.toc.toLocaleString()} \n`);
							}
						} else {
							if(!post.c.includes(`#{r=${r.rid}}`) && !post.c.includes(`[attachment=${r.rid}]`)) {
								const content = post.c + `#{r=${rid}}\n`;
								await post.update({c: content});
								result++;
								fs.appendFileSync('./resourceToPost.txt', `rid: ${rid}, pid: ${post.pid}, l: ${post.l}, toc: ${post.toc.toLocaleString()} \n`);
							}
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