module.exports = async (ctx, next) => {
  const {nkcModules, data, db, query} = ctx;
  const {page = 0} = query;
  const {targetUser} = data;

  const match = {
    uid: targetUser.uid,
    type: "post",
    deleted: false
  };

  const noteContent = await db.NoteContentModel.find(match, {
    targetId: 1,
    noteId: 1,
    type: 1,
    content: 1,
    uid: 1,
    toc: 1
  }).sort({toc: 1});
  const notesContentObj = {}, notesId = [];
  let postsId = new Set();
  noteContent.map(n => {
    n = n.toObject();
    n.html = nkcModules.nkc_render.experimental_render({c: n.content});
    n.edit = false;
    const {targetId, noteId} = n;
    postsId.add(targetId);
    if(!notesContentObj[noteId]) notesContentObj[noteId] = [];
    notesContentObj[noteId].push(n);
    notesId.push(noteId)
  });
  const notes = await db.NoteModel.find({_id: {$in: notesId}}, {
    content: 1,
    type: 1,
    targetId: 1,
    _id: 1
  });
  const postNotesObj = {};

  notes.map(note => {
    note = note.toObject();
    const {targetId} = note;
    note.edit = "";
    note.newContent = "";
    note.notes = notesContentObj[note._id] || [];
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
  data.paging = paging;
  await next();
};