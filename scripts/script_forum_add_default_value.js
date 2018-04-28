const {ForumModel} = require('../dataModels');
(async () => {
	const forums = await ForumModel.find({});
	await Promise.all(forums.map(async forum => {
		await forum.save();
	}));
	console.log('done.');
})();