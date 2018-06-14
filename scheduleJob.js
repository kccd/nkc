const {scheduleJob} = require('node-schedule');
const moment = require('moment');
const {spawn} = require('child_process');
const settings = require('./settings');
const backup = require('./settings/backup');
const fs = require('fs');
const path = require('path');
const {database, elastic, user} = settings;
const {client} = elastic;

const {PostModel, ThreadModel, UserModel, ActiveUserModel} = require('./dataModels');

const jobs = {};
jobs.updateActiveUsers = cronStr => {
  scheduleJob(cronStr, async () => {
    console.log('now updating the activeusers collection...'.blue);
    const aWeekAgo = Date.now() - 604800000;
    await ActiveUserModel.deleteMany();
    const data = await PostModel.aggregate([
      {$project: {_id: 0,pid: 1, toc: 1, uid: 1, tid: 1}},
      {$match: {toc: {$gt: new Date(aWeekAgo)}}},
      {$group: {_id: '$uid', posts: {$push: '$$ROOT'}}}
    ]);
    for(let d of data){
      let threadCount = 0, postCount = 0;
      const targetUser = await UserModel.findOnly({uid: d._id});
      if(targetUser.certs.includes('banned')) continue;
      for (let post of d.posts) {
        const thread = await ThreadModel.findOne({tid: post.tid, oc: post.pid});
        if(thread) {
        	if(thread.fid !== 'recycle' && !thread.recycleMark) threadCount++;
        } else {
        	const post = await PostModel.findOne({pid, disabled: false});
        	if(post) postCount++;
        }
      }
      const vitality = user.vitalityArithmetic(threadCount, postCount, targetUser.xsf);
      const newActiveUser = new ActiveUserModel({
        lWThreadCount: threadCount,
        lWPostCount: postCount,
        uid: targetUser.uid,
        vitality
      });
      await newActiveUser.save();
    }
  })
};

jobs.backupDatabase = () => {
	scheduleJob(backup.cronStr, async () => {
		fs.appendFile(`${path.resolve(__dirname)}/backup.log`, `\n\n${moment().format('YYYY-MM-DD HH:mm:ss')} 开始备份数据...\n`, (err) => {
			if(err) {
				console.log(err);
			}
		});
		console.log(`\n\n${moment().format('YYYY-MM-DD HH:mm:ss')} 开始备份数据...\n`);
		let data = '', error = '';
		const process = spawn(
			'mongodump.exe',
			[
				'--gzip',
				'--db',
				backup.database,
				'--out',
				`${backup.out}${moment().format('YYYYMMDDHHmmss')}`,
			]
		);
		process.stdout.on('data', (d) => {
			d = d.toString();
			console.log(d);
			data += (d+'\n');
		});
		process.stderr.on('data', (d) => {
			d = d.toString();
			console.log(d);
			error += (d+'\n');
		});
		process.on('close', (code) => {
			let info = '';
			if (code === 0) {
				info = `${moment().format('YYYY-MM-DD HH:mm:ss')} 备份完成`;
			} else {
				info = `${moment().format('YYYY-MM-DD HH:mm:ss')} 备份失败\n${error}`;
			}
			console.log(info);
			fs.appendFile(`${path.resolve(__dirname)}/backup.log`, info, (err) => {
				if(err) {
					console.log(err);
				}
			})
		});
	});
};

jobs.updateForums = cronStr => {
	const {ForumModel} = require('./dataModels');
	scheduleJob(cronStr, async () => {
		const t = Date.now();
		console.log('now updating the forums ...'.blue);
		const forums = await ForumModel.find({});
		for(let forum of forums) {
			await forum.updateForumMessage();
		}
		console.log('done', Date.now()-t+'ms');
	})
};

jobs.truncateUsersLoginToday = cronStr => {

};
jobs.indexToES = cronStr => {

};

module.exports = jobs;
