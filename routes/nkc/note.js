const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page} = query;
    const match = {
    };
    const count = await db.NoteContentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const noteContent = await db.NoteContentModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.noteContent = await db.NoteContentModel.extendNoteContent(noteContent, {
      extendNote: true
    });
    data.paging = paging;
    data.nav = "note";
    ctx.template = "nkc/note/note.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, db, nkcModules, data,state} = ctx;
    const {noteContentId, type, content,remindUser,reason,violation } = body;
    const noteContent = await db.NoteContentModel.findOne({_id: noteContentId});
    const {status,uid} =noteContent
    const noteUser = await db.UserModel.findOne({uid})
    let message ={}
    if(!noteContent) ctx.throw(400, `未找到ID为${noteContentId}的笔记`);
    if(type === "modify") {
      const {checkString} = nkcModules.checkData;
      checkString(content, {
        name: "笔记内容",
        minLength: 1,
        maxLength: 400
      });
      await noteContent.cloneAndUpdateContent(content);
      noteContent.content = content;
      const nc = await db.NoteContentModel.extendNoteContent(noteContent);
      data.noteContentHTML = nc.html;
    }
    else if(type === "disable" && status === 'deleted'){
      ctx.throw(400,`用户已经删除`)
    }
    else if(type === "disable" && status === 'disabled'){
      ctx.throw(400,`已经屏蔽用户`)
    }
    else if(type === "cancelDisable"&& status === 'normal' ) {
      ctx.throw(400,`已经取消屏蔽用户`)
    }
    else if(type === "disable"&& status!== 'deleted') {
      //更新笔记状态
      await noteContent.updateOne({disabled: true,status:'disabled'});
      //更新笔记审核记录状态
      await db.ReviewModel.updateOne({sid:noteContentId,source:'note'},{
        $set:{
          handlerId:state.uid,
          reason:reason?reason:'出现了敏感词'
        }
      })
      //如果标记用户违规就给该用户新增违规记录
      if(violation){
        //新增违规记录
        await db.UsersScoreLogModel.insertLog({
          user:noteUser ,
          type: 'score',
          typeIdOfScoreChange: "violation",
          port: ctx.port,
          delType: 'disabled',
          ip: ctx.address,
          key: 'violationCount',
          description: reason || '笔记出现敏感词并标记违规',
          noteId: noteContentId,
        })
      }
      
      //选择是否提醒作者
      if(remindUser){
        message =await db.MessageModel({
          _id: await db.SettingModel.operateSystemID("messages",1),
          r: uid,
          ty: 'STU',
          c:{
            delType: 'disabled',
            violation: violation?violation:false,
            type: 'noteDisabled',
            noteId: noteContentId,
            reason,
          }
        })
        await message.save();
        //通过socket通知作者
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
    }
    else if(type === "cancelDisable" && status !== 'deleted' ) {
      await noteContent.updateOne({disabled: false,status:'normal'});
    }
    await next();
  });
module.exports = router;
