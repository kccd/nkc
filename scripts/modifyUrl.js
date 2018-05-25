const reg1 = /href=['"].*?kechuang.*?['"]/g;
const reg2 = /\[url]http:\/\/bbs.kechuang.org\/read\/([0-9]+)\/([0-9]*)\[\/url]/g;
const reg3 = /\[url].*?kechuang.*?\[\/url]/g;

const fs = require('fs');

fs.writeFileSync('./url.txt', '');

const {PostModel} = require('../dataModels');

(async () => {
	let n = 0, result = 0;

	const limit = 1000;

	const q = {c: reg3};

	const total = await PostModel.count(q);

	while(n <= total) {

		const posts = await PostModel.find(q).sort({toc: 1}).skip(n).limit(limit);
		for(const post of posts) {
			const {c, l, toc} = post;
			const newContent = c.replace(reg3, (content, v1, v2) => {
				result ++;
				console.log(content);
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${content} \n`);
				// return `https://www.kechuang.org/t/${v1}${v2?'?page='+v2: ''}`;
			});
			/*if(post.c !== newContent) {
				console.log(post.c);
				console.log(newContent);
			}*/
		}
		let p = (n/total)*100;
		if(p > 100) p = 100;
		p = p.toFixed(2);
		console.log(`${p}%  总：${total} 当前：${n + limit}  匹配：${result}`);
		n += limit;
	}

})();