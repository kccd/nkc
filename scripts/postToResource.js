const {PostModel, ResourceModel} = require('../dataModels');
const fs = require('fs');
const r1 = /#\{r=([0-9]+)}/g;
const r2 = /\[attachment=([0-9]+)]/g;
const r3 = /src=['"]\/r\/([0-9]+)['"]/g;

const limit = 1000;
let n = 0;
let result = 0;
fs.writeFileSync('./postToResource.txt', '');

fs.writeFileSync('./notResourcePid.txt', '');


(async () => {
	const total = await PostModel.count();
	while(n <= total) {
		const posts = await PostModel.find().sort({toc: 1}).skip(n).limit(limit);
		for(let post of posts) {
			const {l, c, pid} = post;
			if(l === 'html') {
				c.replace(r3, async (content, rid) => {
					const resource = await ResourceModel.findOne({rid});
					if(resource) {
						if(!resource.references.includes(pid)){
							await resource.update({$addToSet: {references: pid}});
							fs.appendFileSync('./postToResource.txt', `pid: ${pid}, rid: ${rid}, toc: ${post.toc.toLocaleString()} \n`);
							result++;
						}
					} else {
						fs.appendFileSync('./notResourcePid.txt', `pid: ${pid}, rid: ${rid} \n`)
					}
				})
			} else {
				c.replace(r1, async (content, rid) => {
					const resource = await ResourceModel.findOne({rid});
					if(resource) {
						if(!resource.references.includes(pid)){
							await resource.update({$addToSet: {references: pid}});
							fs.appendFileSync('./postToResource.txt', `pid: ${pid}, rid: ${rid}, toc: ${post.toc.toLocaleString()} \n`);
							result++;
						}
					} else {
						fs.appendFileSync('./notResourcePid.txt', `pid: ${pid}, rid: ${rid} \n`)
					}
				});
				c.replace(r2, async (content, rid) => {
					const resource = await ResourceModel.findOne({rid});
					if(resource) {
						if(!resource.references.includes(pid)){
							await resource.update({$addToSet: {references: pid}});
							fs.appendFileSync('./postToResource.txt', `pid: ${pid}, rid: ${rid}, toc: ${post.toc.toLocaleString()} \n`);
							result++;
						}
					} else {
						fs.appendFileSync('./notResourcePid.txt', `pid: ${pid}, rid: ${rid} \n`)
					}
				})
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