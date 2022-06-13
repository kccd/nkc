import {getSocket} from "../lib/js/socket";
import Share from '../lib/vue/Share';

const socket = getSocket();

function disabledThreadPost (pid){
  NKC.methods.disabledPosts(pid);
}
$(".dropdown-menu.stop-propagation").on("click",function (e) {
  e.stopPropagation();
});
//- var preview = new Preview({
//-     imgWrap: 'wrap' // 指定该容器里的图片点击预览
//- })
var UserInfo;
$(document).ready(function() {
  if(NKC.modules.UserInfo) UserInfo = new NKC.modules.UserInfo();
  NKC.methods.markDom($(".highlight-dom>.highlight"));
  NKC.methods.scrollToDom($(".highlight-dom"));
})

function getPostAuthor(pid) {
  UserInfo.open({
    type: "showUserByPid",
    pid: pid
  });
}
var data = NKC.methods.getDataById("data");

$(function () {

  NKC.oneAfter("mathJaxRendered", function(_data, next) {
    if (data.notes && data.notes.length) {
      for (var i = 0; i < data.notes.length; i++) {
        var n = data.notes[i];
        new NKC.modules.NKCHL({
          type: n.type,
          targetId: n.targetId,
          notes: n.notes
        });
      }
    }
  })
  NKC.methods.highlightBlockBySelector("[data-tag='nkcsource'][data-type='pre']");

  NKC.methods.showPostComment(data.pid, data.page, {highlightCommentId: data.highlight});

  if(NKC.configs.uid && socket) {
    window.bulletComments = new NKC.modules.BulletComments({
      offsetTop: NKC.configs.isApp ? 20 : 60
    });
    if (socket.connected) {
      joinPostRoom();
    } else {
      socket.on('connect', joinPostRoom)
    }
    socket.on('commentMessage', function (data) {
      if (NKC.configs.uid !== data.comment.uid) {
        bulletComments.add(data.comment);
      }
      NKC.methods.insertComment(
        data.parentCommentId,
        data.parentPostId,
        data.html
      );
    });
  }
});

function joinPostRoom() {
  socket.emit('joinRoom', {
    type: 'post',
    data: {
      postId: data.firstPostId
    }
  });
}

if (NKC.configs.platform === 'reactNative') {
  window._userSelect = true;
}

const postShareElement = document.getElementById('postShare');
if(postShareElement) {
  const app = new Vue({
    el: postShareElement,
    components: {
      share: Share
    }
  })
}


Object.assign(window, {
  joinPostRoom,
  getPostAuthor,
  disabledThreadPost
})
