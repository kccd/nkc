const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();
const homeTopRouter = require('./homeTop');
const adRouter = require("./ad");
const toppedRouter = require('./topped');
const closeRouter = require('./close');
const subscribeRouter = require("./subscribe");
const Path = require("path");

threadRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		const {user} = data;
		const {from, keywords, self, type, title, pid, applicationFormId} = query;
		// 通用接口，用于查询自己的文章
		if(type === "selfThreads") {
      const {page=0, columnId, pid} = query;
      let threads = [];
      if(pid) {
        threads = await db.ThreadModel.find({oc: pid});
      } else {
        const q = {
          uid: user.uid,
          disabled: false,
          recycleMark: {$ne: true},
          reviewed: true
        };
        const count = await db.ThreadModel.count(q);
        const paging = nkcModules.apiFunction.paging(page, count);
        data.paging = paging;
        threads = await db.ThreadModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      }
      threads = await db.ThreadModel.extendThreads(threads, {
        htmlToText: true
      });
      if(columnId) {
        data.threads = [];
        const threadsId = threads.map(t => t.oc);
        const contributes = await db.ColumnContributeModel.find({columnId, pid: {$in: threadsId}, passed: null}, {pid: 1});
        let columnPosts = await db.ColumnPostModel.find({columnId, pid: {$in: threadsId}}, {pid: 1});
        const pid = (contributes.map(c => c.pid)).concat(columnPosts.map(c => c.pid));
        for(const thread of threads) {
          if(pid.includes(thread.oc)) continue;
          data.threads.push(thread);
        }
      } else {
        data.threads = threads;
      }
    } else if(type === "applicationFormSearch") {
      const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId});
      const users = await applicationForm.extendMembers();
      const usersId = users.map(u => u.uid);
      usersId.push(user.uid);

      let posts = [];
      if(pid) {
        const post = await db.PostModel.findOne({pid, uid: {$in: usersId}, disabled: false, recycleMark: false, reviewed: true});
        if(post) posts.push(post);
      }
      if(title) {
        const q = {
          t: new RegExp(`${title}`, "gi"),
          uid: {$in: usersId},
          disabled: false, reviewed: true
        };
        if(pid) {
          q.pid = {$ne: pid};
        }
        const ps = await db.PostModel.find(q).sort({toc: -1});
        posts = posts.concat(ps);
      }

      data.posts = [];
      for(const post of posts) {
        const thread = await db.ThreadModel.findOne({oc: post.pid});
        if(thread) {
          thread.firstPost = post;
          data.posts.push(thread.toObject());
        }
      }
    } else if(type === "myPosts") {
      const threads = await db.ThreadModel.find({
        uid: user.uid, disabled: false, recycleMark: false, reviewed: true
      }).sort({toc: -1}).limit(20);
      data.posts = [];
      for(const thread of threads) {
        const post = await db.PostModel.findOne({pid: thread.oc});
        if(post) {
          thread.firstPost = post;
          data.posts.push(thread.toObject());
        }
      }
    } else if(from === "applicationForm") {
      const outPostObj = (post) => {
        return {
          toc: post.toc.toLocaleString(),
          tid: post.tid,
          username: post.user.username,
          uid: post.uid,
          t: post.t,
          pid: post.pid
        }
      };
      const perpage = (page, length) => {
        const perpage = 20;
        const start = perpage*page;
        return {
          page,
          start,
          perpage,
          pageCount: Math.ceil(length/perpage)
        }
      };
      const page = query.page? parseInt(query.page): 0;
      data.paging = {page: 0, pageCount: 1, perpage: 8};
      const threads = [];
      let targetThreads = [];
      if(self === 'true') {
        const length = await db.ThreadModel.count({uid: user.uid, disabled: false});
        const paging= perpage(page, length);
        targetThreads = await db.ThreadModel.find({uid: user.uid, disabled: false}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
        data.paging = paging;
      } else {
        const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId});
        const users = await applicationForm.extendMembers();
        const usersId = users.map(u => u.uid);
        usersId.push(user.uid);
        const post = await db.PostModel.findOne({pid: keywords, uid: {$in: usersId}, disabled: false});
        if(post !== null) {
          await post.extendThread();
          if(post.pid === post.thread.oc) {
            await post.extendUser();
            threads.push(outPostObj(post));
          }
        }
        const targetUser = await db.UserModel.findOne({usernameLowerCase: keywords.toLowerCase()});
        if(targetUser !== null && usersId.includes(targetUser.uid)) {
          const length = await db.ThreadModel.count({uid: targetUser.uid, disabled: false});
          const paging = perpage(page, length);
          targetThreads = await db.ThreadModel.find({uid: targetUser.uid, disabled: false}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
          data.paging = paging;
        }
      }
      for(let t of targetThreads) {
        const post = await t.extendFirstPost();
        await post.extendUser();
        threads.push(outPostObj(post))
      }
      data.threads = threads;
    }
    await next();
	})
	.get('/:tid', async (ctx, next) => {
    const {data, params, db, query, nkcModules, state} = ctx;
		let {token, paraId} = query;
		let {page = 0, pid, last_page, highlight, step, t} = query;
    let {tid} = params;
    const extendPostOptions = {
      uid: data.user?data.user.uid: '',
      visitor: data.user, // 用于渲染页面时比对学术分隐藏
    };
    // 适配旧链接，去掉tid尾部非数字的部分
    try{
      const arr = tid.match(/^[0-9]+/);
      if(arr && arr.length) tid = arr[0];
    } catch(err) {}
    // 高亮的postID
		data.highlight = highlight;
    // 【待改】加载投诉类型，可改为点击投诉，弹出弹窗时再从服务器拿取数据
		data.complaintTypes = ctx.state.language.complaintTypes;
		// 加载文章，如果文章不存在，此处会抛出404
    const thread = await db.ThreadModel.findOnly({tid});
    // 拓展文章所属专业
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
		// 验证权限 - new
		// 如果是分享出去的连接，含有token，则允许直接访问
    // 【待改】判断用户是否是通过分享链接阅读文章，如果是则越过权限
		if(!token){
      await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
		}else{
			let share = await db.ShareModel.findOne({"token":token});
			if(!share) ctx.throw(403, "无效的token");
			// if(share.tokenLife === "invalid") ctx.throw(403, "链接已失效");
			if(share.tokenLife === "invalid"){
				await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
			}
			// 获取分享限制时间
			let allShareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
			if(!allShareLimit){
				allShareLimit = new db.ShareLimitModel({});
				await allShareLimit.save();
			}
			let shareLimitTime;
      for(const forum of forums) {
        const timeLimit = Number(forum.shareLimitTime);
        if(shareLimitTime === undefined || shareLimitTime > timeLimit) {
          shareLimitTime = timeLimit;
        }
      }
			if(shareLimitTime === undefined) {
        shareLimitTime = allShareLimit.shareLimitTime;
      }
			let shareTimeStamp = parseInt(new Date(share.toc).getTime());
			let nowTimeStamp = parseInt(new Date().getTime());
			if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimitTime){
				await db.ShareModel.update({"token": token}, {$set: {tokenLife: "invalid"}});
				await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
			}
			if(share.shareUrl.indexOf(ctx.path) === -1) ctx.throw(403, "无效的token")
    }
    // 获取当前用户有权查看文章的专业ID
    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user);
		// 获取当前文章所在的专业（不含用户无权访问的专业）
    const mainForums = forums.filter(forum => thread.mainForumsId.includes(forum.fid));
    // 文章的专业导航
    data.forumsNav = [];
    for(const f of thread.mainForumsId) {
      const nav = await db.ForumModel.getForumNav(f);
      if(nav.length) data.forumsNav.push(nav);
    }
    // 判断用户是否具有专家权限
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      // 若用户为某个父级专业的专家，则用户具有专家权限
      for(const f of mainForums) {
        isModerator = await f.isModerator(data.user?data.user.uid: '');
        if(isModerator) break;
      }
    }
		data.isModerator = isModerator;

    // 文章处于待审核的状态
    // 若当前用户不是专家、不是作者，则在此抛出403
    if(!thread.reviewed) {
      if(!data.user || (!isModerator && data.user.uid !== thread.uid)) ctx.throw(403, "文章还未通过审核，暂无法阅读");
    }

		// 文章处于已被退回的状态
		if(thread.recycleMark) {
		  // 用户不具有专家权限
			if(!isModerator) {
				// 访问用户没有查看被退回文章的权限，且不是自己发表的文章则抛出403
				if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
					if(!data.user || thread.uid !== data.user.uid) ctx.throw(403, '文章已被退回修改，暂无法阅读。');
				}
			}
			// 获取文章被退回的原因
			const threadLogOne = await db.DelPostLogModel.findOne({"threadId":tid,"postType":"thread","delType":"toDraft","modifyType":false}).sort({toc: -1});
			thread.reason = threadLogOne.reason || '';
		}

		// 加载文章的首条POST并拓展（包含文章文本内容）
    let firstPost = await db.PostModel.findOne({pid: thread.oc});
		if(!firstPost) ctx.throw(500, `文章数据错误，oc:${thread.oc}`);
    firstPost = await db.PostModel.extendPost(firstPost, extendPostOptions);
		thread.firstPost = firstPost;
		// 设置匿名标志，前端页面会根据此标志，判断是否默认勾选匿名发表勾选框
    data.anonymous = firstPost.anonymous;

    // 查询文章的回复
		const match = {
			tid,
      type: "post",
      parentPostsId: {
			  $size: 0
      }
		};
		// 只看作者
		if(t === "author") {
		  data.t = t;
      match.anonymous = !!data.anonymous;
      match.uid = thread.uid

    }
		const $and = [];
		// 若没有查看被屏蔽的post的权限，判断用户是否为该专业的专家，专家可查看
		// 判断是否为该专业的专家
		// 如果是该专业的专家，加载所有的post；如果不是，则判断有没有相应权限。
		if(!isModerator) {
			if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
				const $or = [
					{
						disabled: false
					},
					{
						disabled: true,
						toDraft: {$ne: true}
					}
				];
				// 用户能查看自己被退回的回复
				if(data.user) {
					$or.push({
						disabled: true,
						toDraft: true,
						uid: data.user.uid
					});
				}
				$and.push({$or})
			}
			if(!data.userOperationsId.includes('displayDisabledPosts')) {
				const $or = [
					{
						disabled: false
					},
					{
						disabled: true,
						toDraft: {$ne: false}
					}
				];
				$and.push({$or});
			}
			if($and.length !== 0) match.$and = $and;
		}
		if(data.user) {
		  if(!isModerator) {
        match.$or = [
          {
            reviewed: true
          },
          {
            reviewed: false,
            uid: data.user.uid
          }
        ]
      }
    } else {
		  match.reviewed = true;
    }
    // 获取分页设置
    const {pageSettings} = state;
    // 获取当前文章下回复的总数目
    const count = await db.PostModel.count(match);
		const paging_ = nkcModules.apiFunction.paging(page, count, pageSettings.threadPostList);
		const {pageCount} = paging_;

		//【待改】删除退休超时的post
		const postAll = await db.PostModel.find({tid:tid,toDraft:true});
		for(let postSin of postAll){
			let onLog = await db.DelPostLogModel.findOne({delType: 'toDraft', postType: 'post', postId: postSin.pid, modifyType: false, toc: {$lt: Date.now()-3*24*60*60*1000}})
			if(onLog){
				await postSin.update({"toDraft":false, reviewed: true});
				const tUser = await db.UserModel.findOne({uid: onLog.delUserId});
				data.post = await db.PostModel.findOne({pid: onLog.postId});
				if(tUser && data.post) {
				  ctx.state._scoreOperationForumsId = data.post.mainForumsId;
          await db.KcbsRecordModel.insertSystemRecord('postBlocked', tUser, ctx);
        }
			}
		}
		await db.DelPostLogModel.updateMany({delType: 'toDraft', postType: 'post', threadId: tid, modifyType: false, toc: {$lt: Date.now()-3*24*60*60*1000}}, {$set: {delType: 'toRecycle'}});


		// 高亮楼层
		if(pid && step === undefined) {
      const url = await db.PostModel.getUrl(pid);
			ctx.status = 303;
      return ctx.redirect(url);
		}
		// 访问最后一页
		if(last_page) {
			page = pageCount -1;
		}

    // 设置标志 表示用户是否有权限置顶文章
    if(
      ctx.permission("topAllPost") ||
      (data.user && data.user.uid === thread.uid && await db.PostModel.ensureToppingPermission(data.user.uid))
    ) {
      data.topPost = true;
    }

		// 获取文章下当前页的所有回复
    // 计算页数
		const paging = nkcModules.apiFunction.paging(page, count, pageSettings.threadPostList);
		data.paging = paging;
		// 加载回复
		const posts = await db.PostModel.find(match).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
		// 拓展回复信息
    data.posts = await db.PostModel.extendPosts(posts, extendPostOptions);
    // 获取置顶文章
    if(paging.page === 0 && thread.toppedPostsId && thread.toppedPostsId.length) {
      match.pid = {$in: thread.toppedPostsId};
      let toppedPosts = await db.PostModel.find(match);
      toppedPosts = await db.PostModel.extendPosts(toppedPosts, {
        uid: data.user? data.user.uid: "",
        visitor: data.user,
        url: true
      });
      const toppedPostsObj = {};
      toppedPosts.map(p => {
        toppedPostsObj[p.pid] = p;
      });
      data.toppedPosts = [];
      for(const toppedPostId of thread.toppedPostsId) {
        const p = toppedPostsObj[toppedPostId];
        if(p) data.toppedPosts.push(p);
      }
    }
    // 判断 如果文章为匿名发表，则清除作者信息
    if(thread.firstPost.anonymous) {
      thread.uid = "";
      thread.firstPost.uid = "";
      thread.firstPost.uidlm = "";
    }
    // 设置标志 表明当前用户是否为文章作者
    thread.firstPost.ownPost = data.user && data.user.uid === thread.uid;
		// 【待改】给被退回的post加上标记
		const toDraftPosts = await db.DelPostLogModel.find({modifyType: false, postType: 'post', delType: 'toDraft', threadId: tid}, {postId: 1, reason: 1});
		const toDraftPostsId = toDraftPosts.map(post => post.postId);
		data.posts.map(async post => {
			const index = toDraftPostsId.indexOf(post.pid);
			if(index !== -1) {
				post.todraft = true;
				post.reason = toDraftPosts[index].reason;
			}
		});
		// data.posts = posts;
		// console.log(data.posts)
		// 加载文章所在专业位置，移动文章的选择框
		// data.forumList = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
		// data.parentForums = await forum.extendParentForum();
		// data.forumsThreadTypes = await db.ThreadTypeModel.find().sort({order: 1});
		// data.selectedArr = breadcrumbForums.map(f => f.fid);
		// data.selectedArr.push(forum.fid);
		data.cat = thread.cid;
		// 若当前用户已登录，则加载用户已发表的文章
		if(data.user) {
		  data.usersThreads = await data.user.getUsersThreads();
			if(state.userColumn) {
			  data.addedToColumn = (await db.ColumnPostModel.count({columnId: state.userColumn._id, type: "thread", tid: thread.tid})) > 0;
      }
			if(thread.uid === data.user.uid) {
			  // 标记未读的回复提醒为已读状态
        await db.MessageModel.clearMessageSTU({
          type: "thread",
          oc: thread.oc,
          uid: thread.uid
        });
        // 专栏判断
        data.authorColumn = await db.UserModel.getUserColumn(thread.uid);
        if(data.authorColumn) {
          // 判断是否已经加入专栏
          const columnPost = await db.ColumnPostModel.findOne({tid: thread.tid, columnId: data.authorColumn._id, type: "thread"});
          data.addedToColumn = !!columnPost;
        }
      }
		}

		// 判断文章是否匿名 加载作者的其他文章
		if(!data.anonymous) {
      data.targetUser = await thread.extendUser();
      await data.targetUser.extendGrade();
      await db.UserModel.extendUserInfo(data.targetUser);
      data.targetColumn = await db.UserModel.getUserColumn(data.targetUser.uid);
      if(data.targetColumn) {
        data.columnPost = await db.ColumnPostModel.findOne({columnId: data.targetColumn._id, type: "thread", pid: thread.oc});
      }
      const q = {
        uid: data.targetUser.uid,
        reviewed: true,
        mainForumsId: { $in: fidOfCanGetThreads},
        recycleMark: {$ne: true}
      };
      let targetUserThreads = await db.ThreadModel.find(q).sort({toc: -1}).limit(10);
      data.targetUserThreads = await db.ThreadModel.extendThreads(targetUserThreads, {
        forum: true,
        firstPostUser: true,
        lastPost: false,
        excludeAnonymousPost: true
      });
    } else {
      thread.uid = "";
    }
		// 文章访问量加1
		await thread.update({$inc: {hits: 1}});

		data.thread = thread;
		data.forums = forums;

		data.replyTarget = `t/${tid}`;
		// const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		// data.ads = homeSettings.c.ads;
		ctx.template = 'thread/index.pug';

		// 【待改】如果当前文章为商品贴
		if(thread.type === "product") {
			const products = await db.ShopGoodsModel.find({tid:thread.tid, oc:thread.firstPost.pid})
			let productArr = await db.ShopGoodsModel.extendProductsInfo(products);
			data.product = productArr[0];
			// 判断是否使用会员价
			let vipNum = 100;
			if(data.product.vipDiscount) {
				data.vipDiscount = true;
				for(let v=0;v<data.product.vipDisGroup.length;v++) {
					if(data.user && data.user.authLevel == data.product.vipDisGroup[v].vipLevel) {
						vipNum = data.product.vipDisGroup[v].vipNum;
					}
				}
				data.vipDisNum = vipNum;
			}else{
				data.vipDiscount = false;
				data.vipDisNum = vipNum;
			}
			// 选定规格
			let paId = 0;
			for(let a=0;a<data.product.productParams.length;a++){
				if(paraId == data.product.productParams[a]._id){
					paId = a;
				}
			}
			data.paId = paId;
      data.paraId = paraId;
      if(data.user) {
        data.shopInfo = {
          cartProductCount: await db.ShopCartModel.getProductCount(data.user)
        }
      }
      // 获取用户地址信息
      let userAddress = "";
      if(data.user && thread.type === "product"){
        let ipInfo = await nkcModules.apiFunction.getIpAddress(ctx.address);
        const {status, province, city} = ipInfo;
        if(status && status == "1"){
          userAddress = province + " " + city;
        }
      }
      data.userAddress = userAddress;

		} else if(thread.type === "fund") { // 基金文章
		  const user = data.user;
      let applicationForm = await db.FundApplicationFormModel.findOne({tid: thread.tid});
      if(!applicationForm) {
        applicationForm = await db.FundApplicationFormModel.findOne({_id: _id});
        if(!applicationForm) ctx.throw(400, '未找到指定申请表。');
      }
      await applicationForm.extendFund();
      const {fund, budgetMoney} = applicationForm;
      if(fund.history && ctx.method !== 'GET') {
        ctx.throw(400, '申请表所在基金已被设置为历史基金，申请表只供浏览。');
      }
      await applicationForm.extendMembers();
      await applicationForm.extendApplicant().then(u => u.extendLifePhotos());
      applicationForm.project = thread.firstPost;
      await applicationForm.extendThreads();
      await applicationForm.extendForum();
      if(fund.money.fixed) {
        applicationForm.money = fund.money.fixed;
        applicationForm.factMoney = fund.money.fixed;
      } else {
        let money = 0;
        let factMoney = 0;
        if(budgetMoney !== null && budgetMoney.length !== 0 && typeof budgetMoney !== 'string'){
          for (let b of applicationForm.budgetMoney) {
            money += (b.count*b.money);
            factMoney += b.fact;
          }
        }
        applicationForm.money = money;
        applicationForm.factMoney = factMoney;
      }
      data.applicationForm = applicationForm;
      data.fund = applicationForm.fund;

      if(applicationForm.disabled && !applicationForm.fund.ensureOperatorPermission('admin', user)) ctx.throw(403,'抱歉！该申请表已被屏蔽。');
      const {applicant, members} = applicationForm;
      const membersId = members.map(m => m.uid);
      // 未提交时仅自己和全部组员可见
      if(!applicationForm.fund.ensureOperatorPermission('admin', user) && applicationForm.status.submitted !== true && user.uid !== applicant.uid && !membersId.includes(user.uid)) ctx.throw(403,'权限不足');
      await applicationForm.extendSupporters();
      await applicationForm.extendObjectors();
      await applicationForm.extendReportThreads();
      const auditComments = {};
      if(!applicationForm.status.projectPassed) {
        auditComments.userInfoAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'userInfoAudit', disabled: false}).sort({toc: -1});
        auditComments.projectAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'projectAudit', disabled: false}).sort({toc: -1});
        auditComments.moneyAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'moneyAudit', disabled: false}).sort({toc: -1});
      }
      if(!applicationForm.status.adminSupport) {
        auditComments.adminAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'adminAudit', disabled: false}).sort({toc: -1});
      }
      if(applicationForm.status.completed === false) {
        auditComments.completedAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'completedAudit', disabled: false}).sort({toc: -1});
      }
      if(applicationForm.useless === 'giveUp') {
        data.report = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'report', disabled: false}).sort({toc: -1});
      }
      const q_ = {
        type: {$in: ['report', 'completedReport', 'system', 'completedAudit', 'adminAudit', 'userInfoAudit', 'projectAudit', 'moneyAudit', 'remittance']},
        applicationFormId: applicationForm._id
      };
      if(!applicationForm.fund.ensureOperatorPermission('admin', user)) {
        q_.disabled = false;
      }
      data.reports = await db.FundDocumentModel.find(q_).sort({toc: 1});
      await Promise.all(data.reports.map(async r => {
        await r.extendUser();
        await r.extendResources();
      }));
      data.auditComments = auditComments;
      let hasPermission = false;
      if(user) {
        // hasPermission = fund.ensureOperatorPermission('admin', user) || fund.ensureOperatorPermission('expert', user) || fund.ensureOperatorPermission('censor', user);
        hasPermission = fund.ensureOperatorPermission('admin', user) || fund.ensureOperatorPermission('censor', user);
      }
      //拦截申请表敏感信息
      if(!user || (applicationForm && !data.userOperationsId.includes('displayFundApplicationFormSecretInfo') && applicationForm.uid !== user.uid && !hasPermission)) {
        const {applicant, members} = applicationForm;
        applicant.mobile = null;
        applicant.idCardNumber = null;
        applicationForm.account.paymentType = null;
        applicationForm.account.number = null;
        for(let m of members) {
          m.mobile = null;
          m.idCardNumber = null;
        }
      }
    }

		// 【待改】加载鼓励、学术分
    data.creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
		if(data.user) {
      const vote = await db.PostsVoteModel.findOne({uid: data.user.uid, pid: thread.oc});
      thread.firstPost.usersVote = vote?vote.type: '';
      // data.kcbSettings = await db.SettingModel.getSettings("kcb");
      data.digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
      data.creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
      data.creditSettings = await db.SettingModel.getCreditSettings();
      data.xsfSettings = await db.SettingModel.getSettings("xsf");
      data.redEnvelopeSettings = await db.SettingModel.getSettings("redEnvelope");
    }
		// 设置标志 是否关注，是否收藏
		data.collected = false;
		data.subscribed = false;
		if(data.user) {
			const collection = await db.SubscribeModel.findOne({uid: data.user.uid, tid, type: "collection"});
			if(collection) {
				data.collected = true;
			}
			const sub = await db.SubscribeModel.findOne({
        type: "thread",
        tid,
        uid: data.user.uid
      });
			if(sub) data.subscribed = true;
			// 设置标志 是否可以发表匿名回复
			data.sendAnonymousPost = await db.UserModel.havePermissionToSendAnonymousPost("postToThread", data.user.uid, thread.mainForumsId);

		}

		data.homeSettings = await db.SettingModel.getSettings("home");
		const {fixed, movable} = data.homeSettings.recommendThreads;
		const ads = fixed.manuallySelectedThreads.concat(
		  fixed.automaticallySelectedThreads,
      movable.manuallySelectedThreads,
      movable.automaticallySelectedThreads
    );
		data.homeAd = ads.map(a => a.tid).includes(tid);
		data.homeTopped = data.homeSettings.toppedThreadsId.includes(tid);
		if(thread.type === "product" && ctx.permission("pushGoodsToHome")) {
		  data.goodsHomeTopped = data.homeSettings.shopGoodsId.includes(data.product.productId);
    }


		// 相似文章
    data.sameThreads = [];
    let fids = thread.mainForumsId.concat(thread.minorForumsId);
    fids = fids.filter(id => fidOfCanGetThreads.includes(id));
    if(fids.length !== 0) {
      const sameThreads = await db.ThreadModel.aggregate([
				{
					$match: {
					  reviewed: true,
						mainForumsId: fids,
						digest: true,
						recycleMark: {$ne: true}
					}
				},
				{
					$sample: {
						size: 10
					}
				}
			]);
			data.sameThreads = await db.ThreadModel.extendThreads(sameThreads, {
			  lastPost: false,
        forum: true,
        firstPostUser: true
      });
    }

		// 关注的用户
    data.postSettings = await db.SettingModel.getSettings('post');
		if(data.user) {
			if(!data.user.volumeA) {
				// 加载考试设置
				// data.examSettings = (await db.SettingModel.findOnly({_id: 'exam'})).c;
				const today = nkcModules.apiFunction.today();
        const todayThreadCount = await db.ThreadModel.count({toc: {$gt: today}, uid: data.user.uid});
        let todayPostCount = await db.PostModel.count({toc: {$gt: today}, uid: data.user.uid});
        data.userPostCountToday = todayPostCount - todayThreadCount;
      }
      data.hasPermissionToHidePost = await db.PostModel.ensureHidePostPermission(data.thread, data.user)
      data.blacklistUsersId = await db.BlacklistModel.getBlacklistUsersId(data.user.uid);
		}

    // 加载附件数目
    if(
      ctx.permission("getPostResources") &&
      await db.PostModel.ensureAttachmentPermission(data.user?data.user.uid: "")
    ) {
      const allPosts = await db.PostModel.find({tid: data.thread.tid}, {pid: 1});
      const pid = allPosts.map(p => p.pid);
      data.attachmentsCount = await db.ResourceModel.count({mediaType: "mediaAttachment", references: {$in: pid}});
    }
    const hidePostSettings = await db.SettingModel.getSettings("hidePost");
    // 加载笔记信息
    if(ctx.permission("viewNote")) {
      const notePosts = [{
        pid: data.thread.oc,
        cv: data.thread.firstPost.cv
      }];
      data.posts.map(post => {
        notePosts.push({
          pid: post.pid,
          cv: post.cv
        });
      });
      data.notes = await db.NoteModel.getNotesByPosts(notePosts);
    }

    // 黑名单判断
    if(data.thread.uid && data.user) {
      data.blacklistInfo =
        await db.BlacklistModel.getBlacklistInfo(
          data.thread.uid,
          data.user.uid,
          ctx.permission('canSendToEveryOne')
        );
    }

    // 帖子设置
    data.threadSettings = await db.SettingModel.getSettings("thread");
    data.postHeight = hidePostSettings.postHeight;
		data.pid = pid;
		data.step = step;
		await next();
	})
	.post('/:tid', async (ctx, next) => {
		const {
			data, nkcModules, params, db, body, state, address: ip
		} = ctx;
    const {user} = data;

		try{
      await db.UserModel.checkUserBaseInfo(user, true);
    } catch(err) {
      ctx.throw(403, `因为缺少必要的账户信息，无法完成该操作。具体信息：${err.message}`);
    }

    const {post, postType} = body;

    // 根据发表设置，判断用户是否有权限发表文章
    // 1. 身份认证等级
    // 2. 考试
    // 3. 角色
    // 4. 等级
    const postSettings = await db.SettingModel.findOnly({_id: 'post'});
    const {authLevelMin, exam} = postSettings.c.postToThread;
    const {volumeA, volumeB, notPass} = exam;
    const {status, countLimit, unlimited} = notPass;
    const today = nkcModules.apiFunction.today();
    const todayThreadCount = await db.ThreadModel.count({toc: {$gt: today}, uid: user.uid});
    let todayPostCount = await db.PostModel.count({toc: {$gt: today}, uid: user.uid});
    todayPostCount = todayPostCount - todayThreadCount;
    if(authLevelMin > user.authLevel) ctx.throw(403,`身份认证等级未达要求，发表回复/评论至少需要完成身份认证 ${authLevelMin}`);
    if((!volumeB || !user.volumeB) && (!volumeA || !user.volumeA)) { // a, b考试未开启或用户未通过
      if(!status) ctx.throw(403, '权限不足，请提升账号等级');
      if(!unlimited && countLimit <= todayPostCount) ctx.throw(403, '今日发表回复/评论次数已用完，请参加考试提升等级，或者明天再试。');
    }

    // 发表回复时间、条数限制
    const {postToThreadCountLimit, postToThreadTimeLimit} = await user.getPostLimit();
    if(todayPostCount >= postToThreadCountLimit) ctx.throw(400, `您当前的账号等级每天最多只能发表${postToThreadCountLimit}条回复/评论，请明天再试。`);
    const latestThread = await db.ThreadModel.findOne({uid: user.uid}).sort({toc: -1});
    const q = {
      uid: user.uid,
      toc: {$gt: (Date.now() - postToThreadTimeLimit * 60 * 1000)}
    };
    if(latestThread) {
      q.tid = {$ne: latestThread.tid}
    }
    const latestPost = await db.PostModel.findOne(q);
    if(latestPost) ctx.throw(400, `您当前的账号等级限定发表回复/评论间隔时间不能小于${postToThreadTimeLimit}分钟，请稍后再试。`);

		const {tid} = params;
    const thread = await db.ThreadModel.findOnly({tid});
    const updateCount = await db.ForumModel.updateCount;
    await updateCount([thread], false);
		await thread.extendFirstPost();
		if(thread.closed) ctx.throw(400, '主题已关闭，暂不能发表回复/评论');

    if(!ctx.permission('canSendToEveryOne')) {
      let inBlacklist;
      if(postType === 'comment') {
        const pp = await db.PostModel.findOnly({pid: post.parentPostId});
        inBlacklist = await db.BlacklistModel.inBlacklist(pp.uid, user.uid);
      } else {
        inBlacklist = await db.BlacklistModel.inBlacklist(thread.uid, user.uid);
      }
      if(inBlacklist) ctx.throw(403, `你在对方的黑名单中，对方可能不希望与你交流。`);
    }

		data.thread = thread;
		await thread.extendForums(['mainForums', 'minorForums']);
		data.forum = thread.forum;
		// 权限判断
		// await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    await db.ForumModel.checkWritePostPermission(data.user.uid, thread.mainForumsId);

		const {columnCategoriesId = [], anonymous = false, did} = post;
		if(post.c.length < 6) ctx.throw(400, '内容太短，至少6个字节');
		if(postType === "comment" && post.c.length > 2000) {
      ctx.throw(400, "评论内容不能超过1000字符");
    }

		// 判断前台有没有提交匿名标志，未提交则默认false
    if(anonymous && !await db.UserModel.havePermissionToSendAnonymousPost("postToThread", user.uid, thread.mainForumsId)) {
      ctx.throw(400, "你没有权限或文章所在专业不允许发表匿名内容");
    }

		const _post = await thread.newPost(post, user, ctx.address);

    // 判断该用户的回复是否需要审核，如果不需要审核则标记回复状态为：已审核
    const needReview = await db.UserModel.contentNeedReview(user.uid, "post");
    if(!needReview) {
      await db.PostModel.updateOne({pid: _post.pid}, {$set: {reviewed: true}});
    } else {
      // await db.MessageModel.sendReviewMessage(_post.pid);
    }

    data.post = _post;
		data.targetUser = await thread.extendUser();

    data.blacklistUsersId = await db.BlacklistModel.getBlacklistUsersId(data.user.uid);

		// 转发到专栏
    if(columnCategoriesId.length > 0 && state.userColumn) {
      await db.ColumnPostModel.addColumnPosts(state.userColumn, columnCategoriesId, [data.thread.oc]);
    }

    // 发表匿名内容
    await db.PostModel.updateOne({pid: _post.pid}, {$set: {anonymous}});

		// 生成记录
		const obj = {
			user,
			type: 'score',
			key: 'postCount',
			typeIdOfScoreChange: 'postToThread',
			tid: post.tid,
			pid: post.pid,
			ip: ctx.address,
			port: ctx.port
		};
		await db.UsersScoreLogModel.insertLog(obj);
		obj.type = 'kcb';
		ctx.state._scoreOperationForumsId = data.thread.mainForumsId;
		await db.KcbsRecordModel.insertSystemRecord('postToThread', user, ctx);
		// await db.UsersScoreLogModel.insertLog(obj);

		if(!_post.hasQuote && thread.uid !== user.uid && postType !== "comment") {
      const messageId = await db.SettingModel.operateSystemID('messages', 1);
      const message = db.MessageModel({
        _id: messageId,
        r: thread.uid,
        ty: 'STU',
        c: {
          type: 'replyThread',
          targetPid: _post.pid,
          pid: thread.oc
        }
      });
      await message.save();

      await ctx.redis.pubMessage(message);
		}
		await thread.update({$inc: [{count: 1}, {hits: 1}]});
		const type = ctx.request.accepts('json', 'html');
    await thread.updateThreadMessage();
    const newThread = await db.ThreadModel.findOnly({tid});
    await updateCount([newThread], true);
		// 发表评论 组装评论dom 返回给前端实时显示
		if(postType === "comment") {
      const extendPostOptions = {
        uid: data.user?data.user.uid: '',
        visitor: data.user, // 用于渲染页面时比对学术分隐藏
      };
      let comment = await db.PostModel.findOnly({pid: data.post.pid});
      comment = (await db.PostModel.extendPosts([comment], extendPostOptions))[0];
      if(comment.parentPostId) {
        comment.parentPost = await db.PostModel.findOnly({pid: comment.parentPostId});
        if(comment.parentPost.uid !== data.user.uid) {
          const message = db.MessageModel({
            _id: await db.SettingModel.operateSystemID("messages", 1),
            r: comment.parentPost.uid,
            ty: "STU",
            ip: ctx.address,
            port: ctx.port,
            c: {
              type: "comment",
              pid: comment.pid
            }
          });
          await message.save();
          await ctx.redis.pubMessage(message);
        }
        data.level1Comment = comment.parentPost.parentPostId === "";
        comment.parentPost = (await db.PostModel.extendPosts([comment.parentPost], extendPostOptions))[0];
      }
      // 修改post时间限制
      data.modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimit(data.user);
      data.comment = comment;
      const template = Path.resolve("./pages/thread/comment.pug");
      data.html = nkcModules.render(template, data, ctx.state);
    }

		if(type === 'html') {
			ctx.status = 303;
			return ctx.redirect(`/t/${tid}`)
		}
    // data.redirect = `/t/${thread.tid}?&pid=${_post.pid}`;
    data.redirect = await db.PostModel.getUrl(_post.pid, true);
		// 如果是编辑的草稿，则删除草稿
    if(did) {
      await db.DraftModel.removeDraftById(did, data.user.uid);
    }

		// 回复自动关注文章
    const subQuery = {
      type: "thread",
      tid,
      uid: data.user.uid
    };
    await db.SubscribeModel.insertSubscribe("replay", data.user.uid, tid);
    //-global.NKC.io.of('/thread').NKC.postToThread(data.post);
		await next();
  })
	//.use('/:tid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:tid/ad', adRouter.routes(), adRouter.allowedMethods())
	.use('/:tid/hometop', homeTopRouter.routes(), homeTopRouter.allowedMethods())
	.use('/:tid/topped', toppedRouter.routes(), toppedRouter.allowedMethods())
	.use('/:tid/close', closeRouter.routes(), closeRouter.allowedMethods())
  .use("/:tid/subscribe", subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;
