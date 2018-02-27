const {ThreadModel, PostModel} = require('../../dataModels');
let arr = [];
const fn = async () => {
	const threads = await ThreadModel.find({fid: {$ne: 'recycle'}}, {tid: 1, _id: 0, oc: 1}).sort({toc: -1});
	for(let i = 0; i < threads.length; i++) {
		const thread = threads[i];
		const count = await PostModel.count({tid: thread.tid, disabled: {$ne: true}});
		console.log(`第${i}篇帖子， tid: ${thread.tid}`);
		if(count === 0 && thread.oc) {
			await ThreadModel.update({tid: thread.tid}, {fid: 'recycle', disabled: true});
			await PostModel.updateMany({tid: thread.tid}, {fid: 'recycle'});
			await PostModel.update({pid: thread.oc}, {disabled: false});
			arr.push(thread.tid);
		}
	}
	console.log('已修复的帖子：');
	console.log(arr);
};

fn();
