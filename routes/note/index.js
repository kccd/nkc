const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, query, nkcModules} = ctx;
    const {
      content, offset, length, type, targetId
    } = query;
    nkcModules.checkData.checkString(content, {
      name: "划词内容",
      minLength: 1
    });
    data.note = {
      type,
      targetId,
      content,
      node: {
        offset: Number(offset),
        content,
        length: Number(length)
      },
      notes: []
    };
    ctx.template = "note/note.pug";
    await next();
  })
  .use("/:_id", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {_id} = params;
    const note = await db.NoteModel.findOne({
      _id,
    });
    if(!note) ctx.throw(404, `未找到ID为${_id}的笔记`);
    data.note = note;
    await next();
  })
  .get("/:_id", async (ctx, next) => {
    const {data, db} = ctx;
    const {note} = data;
    const options = {};
    if(!ctx.permission("managementNote")) {
      options.disabled = false;
      options.deleted = false;
    }
    data.managementNote = ctx.permission('managementNote');
    data.note = await db.NoteModel.extendNote(note, options);
    ctx.template = "note/note.pug";
    await next();
  })
  .use("/:_id/c/:cid", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {cid} = params;
    const {user, note} = data;
    const noteContent = await db.NoteContentModel.findOne({_id: cid});
    if(!noteContent) ctx.throw(400, `笔记不存在，cid: ${noteContent._id}`);
    if(note.originId !== noteContent.noteId) ctx.throw(400, `划词选区与笔记内容无法对应`);
    if(user.uid !== noteContent.uid) ctx.throw(403, "权限不足");
    if(noteContent.disabled) ctx.throw(400, "笔记已被屏蔽");
    if(noteContent.deleted) ctx.throw(400, "笔记已被删除");
    data.noteContent = noteContent;
    await next();
  })
  .put("/:_id/c/:cid", async (ctx, next) => {
    // 修改笔记内容
    const {data, body, nkcModules, db} = ctx;
    const {noteContent} = data;
    const {checkString} = nkcModules.checkData;
    const {content} = body;
    const {enabled}= await db.SettingModel.getSettings('note') //获取是否开启敏感词检测状态
    checkString(content, {
      name: "笔记内容",
      minLength: 1,
      maxLength: 1000
    });
    const test = await noteContent.cloneAndUpdateContent(content);
    noteContent.content = content;
    const nc = await db.NoteContentModel.extendNoteContent(noteContent);
    data.noteContentHTML = nc.html;
    await next();
  })
  .del("/:_id/c/:cid", async (ctx, next) => {
    // 用户删除
    const {data} = ctx;
    const {noteContent} = data;
    await noteContent.updateOne({deleted: true});
    await next();
  })
  .post("/", async (ctx, next) => {
    // 选区不存在：新建选区、存储笔记内容
    // 选区存在：存储笔记内容
    const {db, body, data, nkcModules} = ctx;
    const {checkString, checkNumber} = nkcModules.checkData;
    const {_id, targetId, content, type, node,} = body;
    const {user} = data;
    const {enabled}= await db.SettingModel.getSettings('note') //获取是否开启敏感词检测状态
    checkString(content, {
      name: "笔记内容",
      minLength: 1,
      maxLength: 1000
    });
    //检测是否开启笔记敏感词检测
    let appear =false; //是否出现了敏感词
    if(enabled){
      const {keyWordGroup}= await db.SettingModel.getSettings('note')//笔记勾选敏感词组id
      const  result= await  db.ReviewModel.matchKeywordsByGroupsId(content,keyWordGroup)//敏感词检测
      if(result.length!==0){
         appear =true
      }
    }
    
    let cv = null;
    if(type === "post") {
      const post = await db.PostModel.findOnly({pid: targetId}, {cv: 1});
      cv = post.cv;
    } else if(type === 'document') {
      cv = null; // document 不同于 post，版本号不由自身的 cv 字段控制
    } else {
      ctx.throw(400, "未知划词类型");
    }
    const time = Date.now();

    let note;
    if(_id) {
      note = await db.NoteModel.findOne({_id});
      if(!note) ctx.throw(400, `笔记ID错误，请重试。id:${_id}`);
    } else if(node) {
      const {offset, length, content} = node;
      checkString(content, {
        name: "划词内容",
        minLength: 1
      });
      checkNumber(offset, {
        name: "划词偏移量",
        min: 0
      });
      checkNumber(length, {
        name: "划词长度",
        min: 1
      });
      note = await db.NoteModel.findOne({
        cv,
        targetId,
        type,
        "node.offset": offset,
        "node.length": length
      });
    }

    if(!note) {
      // 新建
      let quoteContent = node.content;
      const _id = await db.SettingModel.operateSystemID("notes", 1);
      note = db.NoteModel({
        _id,
        originId: _id,
        latest: true,
        uid: user.uid,
        type,
        content: quoteContent,
        cv,
        targetId,
        node
      });
      await note.save();
    }
    const obj = {
      _id: await db.SettingModel.operateSystemID("noteContent", 1),
      toc: time,
      uid: user.uid,
      content,
      type,
      targetId,
      noteId: note.originId,
      status: appear ? 'unknown':'normal'
    }
    const noteContent = await db.NoteContentModel(obj);
    await noteContent.save();   //保存笔记内容
    //出现了敏感词，就创建审核记录
    if(appear){
      db.ReviewModel.newReview(
        {
          type:'sensitiveWord',
          sid:noteContent._id,
          uid:noteContent.uid,
          reason:'出现了敏感词',
          handlerId:'',
          source:'note'
        })
    }
    data.noteContent = await db.NoteContentModel.extendNoteContent(noteContent);
    data.noteContent.edit = false;
    const options = {};
    if(!ctx.permission("managementNote")) {
      options.disabled = false;
      options.deleted = false;
    }
    data.note = await db.NoteModel.extendNote(note, options);
    data.managementNote = ctx.permission('managementNote');
    await next();
  });
module.exports = router;
