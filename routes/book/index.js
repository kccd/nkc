const router = require('koa-router')();
router
  .get('/:bid', async (ctx, next) => {
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
  });
module.exports = router;