module.exports = async (ctx, next) => {
  const {nkcModules, data, db, query} = ctx;
  const {page = 0, t} = query;
  const {targetUser} = data;
  data.t = t;
  // 查看自己的笔记时，只需要排除自己已删除的笔记
  const match = {
    deleted: false,
    type: "post",
    uid: targetUser.uid,
  };
  let noteContent = await db.NoteContentModel.find(match).sort({toc: 1});
  noteContent = await db.NoteContentModel.extendNoteContent(noteContent);
  const notesContentObj = {}, _notesId = [];
  let postsId = new Set();
  noteContent.map(n => {
    n.html = nkcModules.nkcRender.plainEscape(n.content);
    n.edit = false;
    const {targetId, noteId} = n;
    postsId.add(targetId);
    if(!notesContentObj[noteId]) notesContentObj[noteId] = [];
    notesContentObj[noteId].push(n);
    _notesId.push(noteId);
  });

  const notes = await db.NoteModel.find({latest: true, originId: {$in: _notesId}}, {
    content: 1,
    type: 1,
    originId: 1,
    targetId: 1,
    _id: 1
  });
  const postNotesObj = {};

  notes.map(note => {
    note = note.toObject();
    const {targetId, originId} = note;
    note.edit = "";
    note.newContent = "";
    note.notes = notesContentObj[originId] || [];
    if(!postNotesObj[targetId]) postNotesObj[targetId] = [];
    postNotesObj[targetId].push(note);
  });

  postsId = [...postsId];

  let posts = await db.PostModel.find({pid: {$in: postsId}}, {
    pid: 1,
    tid: 1,
    t: 1,
    cover: 1,
    c: 1,
    abstractCn: 1,
    cv: 1
  });

  const postsObj = {};

  posts.map(post => postsObj[post.pid] = post);

  posts = postsId.map(pid => {
    let post = postsObj[pid];
    if(post.toObject) post = post.toObject();
    post.notes = postNotesObj[pid];
    return post;
  });
  const tidObj = {};

  for(const post of posts) {
    const {tid} = post;
    post.url = await db.PostModel.getUrl(post.pid);
    if(!tidObj[tid]) tidObj[tid] = [];
    tidObj[tid].push(post);
  }

  let threadsId = new Set(posts.map(post => post.tid));
  threadsId = [...threadsId].reverse();
  const paging = nkcModules.apiFunction.paging(page, threadsId.length);
  threadsId = threadsId.slice(paging.start, paging.start + paging.perpage);

  let threads = await db.ThreadModel.find({tid: {$in: threadsId}});

  const threadsObj = {};
  threads.map(t => threadsObj[t.tid] = t);

  data.threads = [];

  for(const tid of threadsId) {
    const t = threadsObj[tid];
    const r = {
      tid: t.tid,
      notes: []
    };
    const posts = tidObj[t.tid];
    let fp;
    for(let i = 0; i < posts.length; i++) {
      const p = posts[i];
      if(p.pid === t.oc) {
        fp = p;
        break;
      }
    }
    r.posts = posts;
    if(!fp) {
      fp = await db.PostModel.findOne({pid: t.oc});
    }
    r.title = fp.t;
    r.cover = fp.cover;
    r.abstract = nkcModules.apiFunction.obtainPureText(fp.abstractCn || fp.c, true, 200);
    data.threads.push(r)
  }

  if(t !== "own") {
    const notesId = [];
    for(const thread of data.threads) {
      for(const note of thread.notes) {
        notesId.push(note.originId);
      }
      for(const post of thread.posts) {
        for(const note of post.notes) {
          notesId.push(note.originId);
        }
      }
    }
    // 查看全部笔记时
    // 需要排除自己已删除的笔记和别人已删除和被屏蔽的笔记
    const ncMatch = {
      type: "post",
      deleted: false,
      noteId: {$in: notesId},
      $or: [
        {
          uid: targetUser.uid
        },
        {
          uid: {$ne: targetUser.uid},
          disabled: false
        }
      ]
    };
    let noteContent = await db.NoteContentModel.find(ncMatch).sort({toc: 1});
    noteContent = await db.NoteContentModel.extendNoteContent(noteContent);
    const ncObj = {};
    noteContent.map(nc => {
      nc.edit = false;
      const {noteId} = nc;
      if(!ncObj[noteId]) ncObj[noteId] = [];
      ncObj[noteId].push(nc);
    });
    for(const thread of data.threads) {
      for(const note of thread.notes) {
        const notes = ncObj[note.originId];
        if(!notes) continue;
        note.notes = notes;
      }
      for(const post of thread.posts) {
        for(const note of post.notes) {
          const notes = ncObj[note.originId];
          if(!notes) continue;
          note.notes = notes;
        }
      }
    }
  }
  data.paging = paging;
  await next();
};