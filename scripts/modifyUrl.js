const reg1 = /href=['"].*?kechuang.*?['"]/g;
const reg2 = /http:\/\/bbs\.kechuang\.org\/read\/([0-9]+)\/([0-9]*)/g;
const reg3 = /.*?kechuang.*?/g;
const reg4 = /\[url]http[s]{0,1}:\/\/bbs\.kechuang\.org\/read\.php\?tid[-=][0-9]+.*?\[\/url]/g; // http(s)://bbs.kechuang.org/read.php?tid=12345&fpage=1&page=2
const reg5 = /\[url]http[s]{0,1}:\/\/bbs\.kechuang\.org\/read\/[0-9]+.*?\[\/url]/g; // http(s)://bbs.kechuang.org/read/1234/2#23    tid/page#fpage
const reg6 = /\[url]http[s]{0,1}:\/\/bbs\.kechuang\.org\/read-kc-tid-[0-9]+.*?\[\/url]/g; // http(s)://bbs.kechuang.org/read-kc-tid-1234
const reg7 = /\[url]http[s]{0,1}:\/\/bbs\.kechuang\.org\/thread-kc-fid-[0-9]+.*?\[\/url]/g;

const reg8 = /\[http[s]{0,1}:\/\/bbs\.kechuang\.org.*?]/g;

const reg9 = /\(http[s]{0,1}:\/\/bbs\.kechuang\.org.*?\)/g;

const fs = require('fs');

fs.writeFileSync('./url.txt', '');

const {PostModel, ThreadModel} = require('../dataModels');

(async () => {

	let n = 0, result = 0;

	const limit = 1000;

	const q = {};
	// const q = {c: reg7};

	const total = await PostModel.count(q);

	while(n <= total) {

		const posts = await PostModel.find(q).sort({toc: 1}).skip(n).limit(limit);

		for(const post of posts) {
			let {c, l, toc} = post;

			// http(s)://bbs.kechuang.org/read.php?tid=12345&fpage=1&page=2
			let arr = c.match(reg4);
			arr = arr || [];
			for(let url of arr) {
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${url}   `);

				const tid = url.match(/tid[-=]([0-9]+)/)[1];

				//let page = url.match(/&page=([0-9]+)/);

				//if(page) page = page[1];


				fs.appendFileSync('./url.txt', `tid: ${tid} \n`);

				result++;

				c = c.replace(url, () => {
					return `[url]https://www.kechuang.org/t/${tid}[/url]`;
				});
			}

			// http(s)://bbs.kechuang.org/read/1234/2#23    tid/page#fpage
			arr = c.match(reg5);
			arr = arr || [];
			for(const url of arr) {
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${url}   `);
				result++;

				const tid = url.match(/read\/([0-9]+)/)[1];
				let page = url.match(/read\/[0-9]+\/([0-9]+)/);
				page = page?parseInt(page[1]-1):'';
				fs.appendFileSync('./url.txt', `tid: ${tid}${page? ', page: '+page:''} \n`);

				c = c.replace(url, () => {
					return `[url]https://www.kechuang.org/t/${tid}${page?'&page='+page: ''}[/url]`;
				})
			}

			// http(s)://bbs.kechuang.org/read-kc-tid-1234
			arr = c.match(reg6);
			arr = arr || [];

			for(const url of arr) {
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${url}   `);
				result++;

				const tid = url.match(/read-kc-tid-([0-9]+)/)[1];

				fs.appendFileSync('./url.txt', `tid: ${tid} \n`);

				c = c.replace(url, () => {
					return `[url]https://www.kechuang.org/t/${tid}[/url]`;
				})
			}

			// http(s)://bbs.kechuang.org/thread-kc-fid-1234
			arr = c.match(reg7);
			arr = arr || [];

			for(const url of arr) {
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${url}   `);
				result++;

				const fid = url.match(/thread-kc-fid-([0-9]+)/)[1];

				fs.appendFileSync('./url.txt', `fid: ${fid} \n`);

				c = c.replace(url, () => {
					return `[url]https://www.kechuang.org/f/${fid}[/url]`;
				})
			}
			arr = c.match(reg8);
			arr = arr || [];

			for(const url of arr) {
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${url}   \n`);
				result++;

				c = c.replace(/http[s]{0,1}:\/\/bbs\.kechuang\.org/, `https://www.kechuang.org`)
			}

			arr = c.match(reg9);
			arr = arr || [];

			for(const url of arr) {
				fs.appendFileSync('./url.txt', `toc: ${toc.toLocaleString()},   pid: ${post.pid},   element: ${url}   \n`);
				result++;

				c = c.replace(/http[s]{0,1}:\/\/bbs\.kechuang\.org/, `https://www.kechuang.org`)
			}


			await post.update({c});
		}

		n += limit;
		let p = (n/total)*100;
		if(p > 100) p = 100;
		p = p.toFixed(2);
		console.log(`${p}%  总：${total} 当前：${n + limit}  匹配：${result}`);

	}
	console.log('done.');
	process.exit(1);
})();