const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const reviewModifierService = require('../../services/review/reviewModifier.service');
const { Operations } = require('../../settings/operations');
const { reviewSources } = require('../../settings/review');
router
  .get('/', OnlyOperation(Operations.nkcManagementNote), async (ctx, next) => {
    const { data, db, query, nkcModules } = ctx;
    const { page } = query;
    const match = {};
    const count = await db.NoteContentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const noteContent = await db.NoteContentModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.noteContent = await db.NoteContentModel.extendNoteContent(
      noteContent,
      {
        extendNote: true,
      },
    );
    data.paging = paging;
    data.nav = 'note';
    ctx.template = 'nkc/note/note.pug';
    await next();
  })
  .post('/', OnlyOperation(Operations.nkcManagementNote), async (ctx, next) => {
    const { body, db, nkcModules, data, state } = ctx;
    const { noteContentId, type, content, remindUser, reason, violation } =
      body;
    const noteContent = await db.NoteContentModel.findOne({
      _id: noteContentId,
    });
    const noteContentStatus = await db.NoteContentModel.getNoteContentStatus();
    const { status, uid } = noteContent;
    const noteUser = await db.UserModel.findOne({ uid });
    let message = {};
    if (!noteContent) {
      ctx.throw(400, `未找到ID为${noteContentId}的笔记`);
    }
    if (type === 'modify') {
      const { checkString } = nkcModules.checkData;
      checkString(content, {
        name: '笔记内容',
        minLength: 1,
        maxLength: 400,
      });
      await noteContent.cloneAndUpdateContent(content);
      noteContent.content = content;
      const nc = await db.NoteContentModel.extendNoteContent(noteContent);
      data.noteContentHTML = nc.html;
    } else if (type === 'disable') {
      if (status === noteContentStatus.deleted) {
        ctx.throw(400, '内容已被用户删除，无法执行此操作');
      }
      if (status === noteContentStatus.disabled) {
        ctx.throw(400, '内容已被屏蔽');
      }
      //更新笔记状态
      await noteContent.updateOne({ status: noteContentStatus.disabled });
      //更新笔记审核记录状态
      // TODO OK：调用审核service上的方法
      await reviewModifierService.modifyReviewLogStatusToDeleted({
        source: reviewSources.note,
        sid: noteContentId,
        handlerId: state.uid,
        handlerReason: reason,
      });
      //如果标记用户违规就给该用户新增违规记录
      if (violation) {
        //新增违规记录
        await db.UsersScoreLogModel.insertLog({
          user: noteUser,
          type: 'score',
          typeIdOfScoreChange: 'violation',
          port: ctx.port,
          delType: 'disabled',
          ip: ctx.address,
          key: 'violationCount',
          description: reason || '笔记出现敏感词并标记违规',
          noteId: noteContentId,
        });
      }

      //选择是否提醒作者
      if (remindUser) {
        message = await db.MessageModel({
          _id: await db.SettingModel.operateSystemID('messages', 1),
          r: uid,
          ty: 'STU',
          c: {
            delType: 'disabled',
            violation: violation ? violation : false,
            type: 'noteDisabled',
            noteId: noteContentId,
            reason,
          },
        });
        await message.save();
        //通过socket通知作者
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
    } else if (type === 'cancelDisable') {
      if (status === 'deleted') {
        ctx.throw(400, '内容已被删除，无法执行此操作');
      }
      if (status !== 'disabled') {
        ctx.throw(400, '内容未被屏蔽，无法执行此操作');
      }
      await noteContent.updateOne({
        disabled: false,
        status: noteContentStatus.normal,
      });
    }
    await next();
  });
module.exports = router;
