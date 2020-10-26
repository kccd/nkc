const getRoomName = require('../socket/util/getRoomName');
const PATH = require('path');
const db = require('../dataModels');
const func = {};

func.sendConsoleMessage = (data) => {
  const roomName = getRoomName('console');
  global.NKC.io.to(roomName).emit('consoleMessage', data);
};

func.sendMessage = () => {
  const roomName = getRoomName('message');
};

func.sendForumMessage = async (data) => {
  const render = require('./render');
  const {tid, state, pid} = data;
  let thread = await db.ThreadModel.findOne({tid});
  if(!thread) return;
  thread = (await db.ThreadModel.extendThreads([thread], {
    htmlToText: true,
    count: 200,
  }))[0];
  const template = PATH.resolve(__dirname, `../pages/publicModules/thread_panel/thread_panel.pug`);
  for(const fid of thread.mainForumsId) {
    const forum = await db.ForumModel.findOne({fid});
    if(!forum) continue;
    const html = render(template, {singleThread: thread}, {...state, threadListStyle: forum.threadListStyle});
    const roomName = getRoomName('forum', fid);
    global.NKC.io.to(roomName).emit('forumMessage', {
      html,
      pid,
      tid,
    });
  }
};

func.sendThreadMessage = () => {
  const roomName = getRoomName('thread');
};


module.exports = func;
