//  [img]http://bbs.kechuang.org/attachment/photo/Mon_1110/1103_c2041318596766c57aa545ead1a76.jpg[/img]

const {SettingModel, PostModel, ResourceModel} = require('../dataModels');
const reg = /\[img].+?\/attachment\/(photo\/.+?)\[\/img]/g;
// const reg = /src=['"].+?\/attachment\/(photo\/.+?['"])/g;


const fs = require('fs');
fs.writeFileSync('./photoPath.txt', '');
fs.writeFileSync('./noHaveFile.txt', '');

const limit = 1000;
let n = 0;
let result = 0;




const fn1 = async (post) => {
	let {c, pid, uid, toc} = post;
	const data = c.match(reg) || [];
	result += data.length;
	for(let url of data) {
		let path = url.replace(reg, (content, v1) => {
			return v1;
		});
		path = `pw/` + path;
		fs.appendFileSync('./photoPath.txt', `toc: ${toc.toLocaleString()},   pid: ${pid},   path: ${path} \n`);
		let rid;
		const resource = await ResourceModel.findOne({path});
		if(resource) {
			rid = resource.rid;
			if(!resource.references.includes(pid)) {
				await resource.update({$addToSet: {references: pid}});
			}
		} else {
			rid = await SettingModel.operateSystemID('resources', 1);
			let size = 0;
			try {
				size = fs.statSync('../resources/upload/' + path).size;
			} catch(err) {
				fs.appendFileSync('./noHaveFile.txt', `pid: ${pid},  path: ${path} \n`);
			}
			const nameArr = path.split('/');
			const name = nameArr[nameArr.length-1];
			const extArr = name.split('.');
			let ext = extArr[extArr.length-1];
			if(ext) ext = ext.toLowerCase();
			const newResource = ResourceModel({
				rid,
				oname: name,
				ext,
				uid,
				path,
				references: [pid],
				size
			});
			await newResource.save();
		}
		c = c.replace(url, `#{r=${rid}}`)
	}
	await post.update({c});
};



(async () => {
	const q = {toc: {$gt: new Date('Wed Sep 22 2010 00:00:00 GMT+0800 (中国标准时间)')}};
	// const q = {toc: {$gt: new Date('Wed Sep 22 2010 00:00:00 GMT+0800 (中国标准时间)')}, c: reg};
	//q = {pid: 't37031'};
	// const q = {c: reg, pid: 't37038'};
	const total = await PostModel.count(q);
	while(n <= total) {
		const posts = await PostModel.find(q).sort({toc: 1}).skip(n).limit(limit);
		for(let post of posts) {
			await fn1(post);
		}
		let p = (n/total)*100;
		if(p > 100) p = 100;
		p = p.toFixed(2);
		console.log(`${p}%  总：${total} 当前：${n} - ${n+limit}  匹配：${result}`);
		n += limit;
	}
	console.log('done.');
	process.exit(1);
})();