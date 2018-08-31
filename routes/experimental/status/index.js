const Router = require('koa-router');
const moment = require('moment');
const statusRouter = new Router();
statusRouter
	.get('/', async (ctx, next) => {
		const {db, query, data, nkcModules} = ctx;
		ctx.template = 'experimental/status/index.pug';
		data.type = 'status';
		const {type} = query;
		const x = [];
		const usersData = [];
		const postsData = [];
		const threadsData = [];
		let title;
		const oneDay = 24*60*60*1000;
		if(type === 'today') {
			title = '今日';
			const time = moment().format(`YYYY-MM-DD`);
			for(let i = 0 ; i < 24; i++) {
				x.push(`${i}点 - ${i+1}点`);
				const minTime = new Date(time + ' ' + i + ':00:00');
				const maxTime = new Date(time + ' ' + (i + 1) + ':00:00');
				const usersCount = await db.UserModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const postsCount = await db.PostModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const threadsCount = await db.ThreadModel.count({toc: {$gt: minTime, $lt: maxTime}});
				usersData.push(usersCount);
				postsData.push(postsCount - threadsCount);
				threadsData.push(threadsCount);
			}
		} else if(type === 'month') {
			title = '本月';
			const time = new Date();
			const year = time.getFullYear();
			const month = time.getMonth() + 1;
			const dayCount = nkcModules.apiFunction.dayCountOfOneMonth(year, month);
			for(let i = 1; i <= dayCount; i++) {
				x.push(`${i}号`);
				const minTime = new Date(year + '-' + month + '-' + i + ' 00:00:00');
				let maxTime;
				if(i === dayCount) {
					if(month === 12) {
						maxTime = new Date((year+1) + '-' + '01-01 :00:00');
					} else {
						maxTime = new Date(year + '-' + (month + 1) + '-' + '01 00:00:00');
					}
				} else {
					maxTime = new Date(year + '-' + month + '-' +(i+1)+ ' 00:00:00');
				}
				const usersCount = await db.UserModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const postsCount = await db.PostModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const threadsCount = await db.ThreadModel.count({toc: {$gt: minTime, $lt: maxTime}});
				usersData.push(usersCount);
				postsData.push(postsCount - threadsCount);
				threadsData.push(threadsCount);
			}
		} else if(type === 'year') {
			title = '今年';
			const time = new Date();
			const year = time.getFullYear();
			const dayCount = nkcModules.apiFunction.dayCountOfOneYear(year);
			for(let i = 0; i < dayCount; i++) {
				let minTime = new Date(year + `-01-01 00:00:00`).getTime();
				minTime += i*oneDay;
				x.push(new Date(minTime).toLocaleDateString());
				const maxTime = minTime + oneDay;
				const usersCount = await db.UserModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const postsCount = await db.PostModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const threadsCount = await db.ThreadModel.count({toc: {$gt: minTime, $lt: maxTime}});
				usersData.push(usersCount);
				postsData.push(postsCount - threadsCount);
				threadsData.push(threadsCount);
			}
		} else if(type === 'all') {
			title = '全部';
			const firstUser = await db.UserModel.findOne().sort({toc: 1});
			const lastUser = await db.UserModel.findOne().sort({toc: -1});
			const firstPost = await db.PostModel.findOne().sort({toc: 1});
			const lastPost = await db.PostModel.findOne().sort({toc: -1});
			let firstTime, lastTime;
			if(firstUser.toc < firstPost.toc) {
				firstTime = firstUser.toc;
			} else {
				firstTime = firstPost.toc;
			}
			if(lastUser.toc < lastPost.toc) {
				lastTime = lastPost.toc;
			} else {
				lastTime = lastUser.toc;
			}

			firstTime = firstTime.getTime();
			lastTime = lastTime.getTime();

			/*let n = 0;
			while(firstTime < lastTime) {
				n++;
				console.log(n);
				const minTime = firstTime;
				const maxTime = firstTime + oneDay;
				x.push(new Date(minTime).toLocaleDateString());
				const usersCount = await db.UserModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const postsCount = await db.PostModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const threadsCount = await db.ThreadModel.count({toc: {$gt: minTime, $lt: maxTime}});
				usersData.push(usersCount);
				postsData.push(postsCount - threadsCount);
				threadsData.push(threadsCount);
				firstTime += oneDay;
			}*/

			const firstYear = new Date(firstTime).getFullYear();
			const lastYear = new Date(lastTime).getFullYear();
			const yearCount = lastYear - firstYear + 1;
			for(let i = 0; i <yearCount; i++) {
				x.push(`${firstYear + i}年`);
				const minTime = new Date(`${firstYear+i}-01-01 00:00:00`);
				const maxTime = new Date(`${firstYear+i+1}-01-01 00:00:00`);
				const usersCount = await db.UserModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const postsCount = await db.PostModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const threadsCount = await db.ThreadModel.count({toc: {$gt: minTime, $lt: maxTime}});
				usersData.push(usersCount);
				postsData.push(postsCount - threadsCount);
				threadsData.push(threadsCount);
			}

		} else if(type === 'custom') {
			let {time1,time2} = query;
			if(!time1 || !time2) ctx.throw(400, '时间区间有误');
			let firstTime = new Date(`${time1}-1 00:00:00`).getTime();
			let lastTime = new Date(`${time2}-1 00:00:00`).getTime();
			while(firstTime < lastTime) {
				const minTime = firstTime;
				const maxTime = firstTime + oneDay;
				x.push(new Date(minTime).toLocaleDateString());
				const usersCount = await db.UserModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const postsCount = await db.PostModel.count({toc: {$gt: minTime, $lt: maxTime}});
				const threadsCount = await db.ThreadModel.count({toc: {$gt: minTime, $lt: maxTime}});
				usersData.push(usersCount);
				postsData.push(postsCount - threadsCount);
				threadsData.push(threadsCount);
				firstTime += oneDay;
			}
		}
		data.results = {
			usersData,
			postsData,
			threadsData,
			x,
			title
		};

		if(!type) {
			data.onlineUsers = [];
			let onlineUsersCount = 0;
			const sockets = global.NKC.sockets;
			for(let i in sockets) {
				if(sockets.hasOwnProperty(i)) onlineUsersCount++;
			}
			data.onlineUsersCount = onlineUsersCount;
			const onlineUsers = await db.UserModel.find({online: true}).limit(5000);
			for(const onlineUser of onlineUsers) {
				const targetSocket = sockets[onlineUser.uid];
				if(!targetSocket) {
					await onlineUser.update({online: false});
					delete sockets[onlineUser.uid];
				} else {
					data.onlineUsers.push({
						uid: onlineUser.uid,
						username: onlineUser.username
					});
				}
			}
		}
		await next();
	});
module.exports = statusRouter;