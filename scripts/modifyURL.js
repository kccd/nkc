const {PostModel} = require('../dataModels');


(async () => {
	const total = await PostModel.count();
	const limit = 1000;
	let n = 0;
	let result = 0;
	while(n <= total) {
		const posts = await PostModel.find().sort({toc: 1}).skip(n).limit(limit);
		for(let post of posts) {
			
		}
	}









})();