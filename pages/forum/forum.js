var SubscribeTypes;
var forumInfo = NKC.methods.getDataById('forumInfo');
$(function() {
  if(!window.SubscribeTypes && NKC.modules.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  var dom = $("#navbar_custom_dom");
  var leftDom = $("#leftDom");
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
  var threadUrlSwitch = $('#threadUrlSwitch');
  if(threadUrlSwitch.length) {
    var threadUrlSwitchStatus = getThreadUrlSwitchStatus();
    modifyThreadUrl(threadUrlSwitchStatus);
    threadUrlSwitch.on("click", function() {
      var s = $(this).prop('checked');
      modifyThreadUrl(s);
    });
  }
  if(NKC.configs.uid) {
    connectForumRoom();
  }
});

var threadUrlSwitchKey = 'forum_thread_a_target';

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

function showSameForums() {
  $(".sameForums").slideToggle();
}


function openEditSite() {
  var fid = NKC.methods.getDataById("forumInfo").fid;
  var url = window.location.origin + "/editor?type=forum&id=" + fid;

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
* 连接上专业房间
* */
function connectForumRoom() {
  socket.on('forumMessage', function(data) {

    var html = data.html;
    var tid = data.tid;
    var threadList = $('div.normal-thread-list');
    var targetThread = threadList.find('div[data-tid="'+tid+'"]');
    var targetThreadCounter = threadList.find('div[data-tid="'+tid+'"] span.thread-panel-counter');

    var newPostCount = 0;

    // 获取当前未读数
    if(targetThreadCounter.length) {
      newPostCount = Number(targetThreadCounter.attr('data-count'));
    }

    if(forumInfo.page === 0) {
      // 处于专业首页 更新时先移除旧元素再在列表头部插入新元素
      targetThread.remove();
      targetThread = $(html);
      threadList.prepend(targetThread);
    } else {
      if(!targetThread) return;
      targetThreadCounter.remove();
    }

    newPostCount ++;

    var counter = $("<span class='thread-panel-counter' data-count='"+newPostCount+"' title='"+newPostCount+"条更新'>"+newPostCount+"</span>");
    targetThread.prepend(counter);

    floatUserPanel.initPanel();
    floatForumPanel.initPanel();
  });
}
