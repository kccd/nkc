let SubscribeTypes;
const forumInfo = NKC.methods.getDataById('forumInfo');
const {fid, page, digest, sort} = forumInfo;

$(function() {
  if(!window.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  const dom = $("#navbar_custom_dom");
  const leftDom = $("#leftDom");
  dom.html(leftDom.html());
  if(NKC.configs.lid) {
    window.Library = new NKC.modules.Library({
      lid: NKC.configs.lid,
      folderId: NKC.configs.folderId,
      tLid: NKC.configs.tLid,
      closed: NKC.configs.closed,
      uploadResourcesId: NKC.configs.uploadResourcesId?NKC.configs.uploadResourcesId.split("-"):[]
    });
  }
  const threadUrlSwitch = $('#threadUrlSwitch');
  if(threadUrlSwitch.length) {
    const threadUrlSwitchStatus = getThreadUrlSwitchStatus();
    modifyThreadUrl(threadUrlSwitchStatus);
    threadUrlSwitch.on("click", function() {
      const s = $(this).prop('checked');
      modifyThreadUrl(s);
    });
  }
  if(NKC.configs.uid) {
    connectForumRoom();
  }
});

const threadUrlSwitchKey = 'forum_thread_a_target';

function modifyThreadUrl(status) {
  var target = status? '_blank': '_self';
  $('.thread-panel-url').attr('target', target);
  $('#threadUrlSwitch').prop('checked', !!status);
  setThreadUrlSwitchStatus(status);
}
/*
* @return {Boolean}
* */
function getThreadUrlSwitchStatus() {
  return localStorage.getItem(threadUrlSwitchKey) === 'true';
}

function setThreadUrlSwitchStatus(status) {
  localStorage.setItem(threadUrlSwitchKey, status);
}

window.openEditSite = function() {
  const url = window.location.origin + "/editor?type=forum&id=" + fid;

  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit("openEditorPage", {
      url: url
    })
  } else if(NKC.configs.platform === 'apiCloud') {
    api.openWin({
      name: url,
      url: 'widget://html/common/editorInfo.html',
      pageParam: {
        realUrl: url,
        shareType: "common"
      }
    })
  } else {
    NKC.methods.visitUrl(url, true);
  }
}

/*
* 连入房间
* */
function joinRoom() {
  socket.emit('joinRoom', {
    type: 'forum',
    data: {
      forumId: fid
    }
  });
}

/*
* 连接上专业房间
* */
function connectForumRoom() {
  socket.on('connect', function() {
    joinRoom();
  });
  socket.on('forumMessage', function(data) {
    const {html, tid, contentType} = data;
    const threadList = $('div.normal-thread-list');
    let targetThread = threadList.find('div[data-tid="'+tid+'"]');
    const targetThreadCounter = threadList.find('div[data-tid="'+tid+'"] span.thread-panel-counter');
    let newPostCount = 0;
    // 获取当前未读数
    if(targetThreadCounter.length) {
      newPostCount = Number(targetThreadCounter.attr('data-count'));
    }
    if(
      page === 0 && // 处于专业首页
      digest === data.digest &&
      (contentType === 'thread' || sort === 'tlm') // 发表文章或发表回复且按回复排序
    ) {
      // 处于专业首页 更新时先移除旧元素再在列表头部插入新元素
      targetThread.remove();
      targetThread = $(html);
      threadList.prepend(targetThread);
    } else {
      if(!targetThread) return;
      targetThreadCounter.remove();
    }

    newPostCount ++;

    const counter = $("<span class='thread-panel-counter' data-count='"+newPostCount+"' title='"+newPostCount+"条更新'>"+newPostCount+"</span>");
    targetThread.prepend(counter);

    floatUserPanel.initPanel();
    floatForumPanel.initPanel();
  });
  if(socket.connected) {
    joinRoom();
  }
}
