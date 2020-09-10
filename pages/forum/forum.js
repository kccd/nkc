var SubscribeTypes;
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
