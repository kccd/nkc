/*
const {LogModel} = require("../../dataModels");
const excludePath = ['.js', '.css', '.svg', '.png', '.jpg', '.woff2'];
const colors = require('colors');
(async () => {
	const total = await LogModel.count({});
	let number = 0, limit = 1000;
	let remove = 0; deleted = 0;
	while(1){
		const logs = await LogModel.find({}).sort({reqTime: 1}).skip(number).limit(limit);
		await Promise.all(logs.map(async log => {
			const lastPath = log.path.split('/').pop();
			for(let path of excludePath) {
				if(lastPath.includes(path)) {
					deleted++;
					remove += deleted;
					await log.remove();
					console.log(` ${remove} `.bgBlue+ ' ' + ` remove:${log.path} `.bgGreen);
				}
			}
		}));
		if(number >= total) break;
		number = number + limit - deleted;
		deleted = 0;
	}
	console.log(`delete ${remove} data.`);
	console.log('done.');

})();*/

const {LogModel} = require("../../dataModels");
const excludePath = [/\.js/, /\.css/, /\.svg/, /\.png/, /\.jpg/, /\.woff2/, /\.woff/, /\.eot/];
const colors = require('colors');
(async () => {
	let remove = 0; limit = 1000;
	const q = {
		path: {$in: excludePath}
	};
	const total = await LogModel.count(q);
	while(1){
		const logs = await LogModel.find(q).limit(limit);
		await Promise.all(logs.map(async log => {
			console.log(log.path);
			await log.remove();
		}));
		let display = ((remove*100)/total).toFixed(2);
		if(display > 100) display = 100;
		console.log(`${remove}/${total} ${display}%`);
		if(remove >= total) break;
		remove += limit;
	}
	console.log('done.');
})();