const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
    //获取图书
    const {query, params, data, db, nkcModules, state} = ctx;
    const {bid} = params;
    const {aid} = query;
    const book = await db.BookModel.getBookByBid(bid);
    await book.checkReadBookPermission(state.uid);
    data.book = await book.getBaseInfo();
    data.list = await book.getList();
    if(aid) {
      data.bookContent = await book.getContentById({
        aid,
        uid: state.uid
      });
      data.bookContentEditor = nkcModules.tools.getUrl('editBookArticle', book._id, data.bookContent.aid);
      ctx.remoteTemplate = `book/bookContent.pug`;
    } else {
      ctx.remoteTemplate = `book/book.pug`;
    }
    await next();
  })
  .get('/:bid/member/invitation', async (ctx, next) => {
    const {params, data, db, state, nkcModules} = ctx;
    const {bid} = params;
    const {getUrl} = nkcModules.tools;
    const book = await db.BookModel.findOnly({_id: bid});
    const members = await book.getAllMembers();
    let member;
    for(const m of members) {
      if(m.uid !== state.uid) continue;
      member = m;
    }
    let invitationStatus;
    if(!member) {
      invitationStatus = 'none';
    } else if (member.status === 'pending'){
      invitationStatus = 'useful';
    } else {
      invitationStatus = member.status;
    }
    if(invitationStatus === 'useful') {
      data.bookData = {
        bid: book._id,
        name: book.name,
        bookUrl: getUrl(`book`, book._id),
      };
      const founder = await book.getFounder();
      data.inviter = {
        uid: book.uid,
        username: founder.username,
        userHome: getUrl('userHome', founder.uid),
        avatarUrl: getUrl('userAvatar', founder.avatar)
      };
    }
    data.bookId = bid;
    data.invitationStatus = invitationStatus;
    ctx.remoteTemplate = 'book/invitation/invitation.pug';
    await next();
  })
  .post('/:bid/member/invitation', async (ctx, next) => {
    const {params, db, body, state} = ctx;
    const {bid} = params;
    const {agree} = body;
    const book = await db.BookModel.findOnly({_id: bid});
    const members = await book.getAllMembers();
    let member;
    for(const m of members) {
      if(m.uid !== state.uid) continue;
      member = m;
    }
    if(!member) {
      ctx.throw(400, `邀请链接已失效`);
    } else if(member.status === 'rejected') {
      ctx.throw(400, `您已拒绝当前邀请`);
    } else if(member.status === 'resolved') {
      ctx.throw(400, `您已接收当前邀请`);
    }
    await db.BookModel.updateOne({
      _id: bid,
      members: {
        $elemMatch: {
          _id: state.uid
        }
      }
    }, {
      $set: {
        'members.$.status': agree? 'resolved': 'rejected'
      }
    });
    await next();
  })
  .get('/:bid/options', async (ctx, next) => {
    //获取评论菜单权限
    const {db , data, params, state, nkcModules, permission, query} = ctx;
    const {bid} = params;
    const {user} = data;
    const {uid} = state;
    const {cid} = query;
    const book = await db.BookModel.findOnly({_id: bid});
    const comment = await db.CommentModel.findOnly({_id: cid});
    const document = await db.DocumentModel.findOnly({did: comment.did, type: 'stable'});
    if(!comment || !document) return ctx.throw(401, '未找到评论， 请刷新后重试！');
    const isComment = document.source === 'comment'
    const optionStatus = {
      anonymous: null,
      anonymousUser: null,
      disabled: null,
      complaint: null,
      reviewed: null,
      editor: null,
      ipInfo: null,
      violation: null,
      blacklist: null,
    };
    if(user) {
      if(isComment) {
        //审核权限
        if(permission('review')) {
          optionStatus.reviewed = document.status
        }
        //用户具有自己的评论的编辑权限
        if(uid === comment.uid) {
          optionStatus.editor = true;
        }
        //退修禁用权限
        optionStatus.disabled = (
          (ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft'))
        )? true: null;
        //投诉权限
        optionStatus.complaint = permission('complaintPost')?true:null;
        //查看IP
        optionStatus.ipInfo = ctx.permission('ipinfo')? document.ip : null;
        // 未匿名
        if(!document.anonymous) {
          // 黑名单
          optionStatus.blacklist = await db.BlacklistModel.checkUser(user.uid, comment.uid);
          // 违规记录
          optionStatus.violation = ctx.permission('violationRecord')? true: null;
          data.commentUserId = comment.uid;
        }
      }
    }
    data.options = optionStatus;
    data.toc = document.toc;
    await next();
  })
module.exports = router;
