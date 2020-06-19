// 此模块在专栏页被引入了两次，复制链接时会出现两次弹窗
// 暂时做一个去重判断
// 模块待改：用的时候进行实例化
var clipboard = new ClipboardJS('#shareLinkButton', {
  text: function(trigger) {
    return window.location.origin + window.location.pathname;
  }
});
if(!window.clipboardLoaded) {
  clipboard.on('success', function() {
    screenTopAlert("链接已复制到粘贴板");
  });
  window.clipboardLoaded = true;
}

function shareShowWeChat() {
  $(".weChat-image").toggle();
}

function shareToOther(shareType, type, title, pid, description, avatar){
  var origin = window.location.origin;
  var lk = origin +'/default/logo3.png';
  if(shareType === "column") {
    lk = origin + "/a/" + avatar
  } else if(shareType === "user") {
    lk = origin + NKC.methods.tools.getUrl('userAvatar', pid)
  }
  var newLink = window.open();
  var str = window.location.origin + window.location.pathname;
  if(str){
    var para = {
      'str': str,
      'type': shareType,
      targetId: pid // 与type类型对应的Id
    };
    nkcAPI('/s', "POST", para)
      .then(function(data) {
        var newUrl = origin + data.newUrl;
        if(type === "qq") {
          newLink.location='http://connect.qq.com/widget/shareqq/index.html?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+description;
        }
        if(type === "qzone") {
          newLink.location='https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+description;
        }
        if(type === "weibo") {
          newLink.location='http://v.t.sina.com.cn/share/share.php?url='+newUrl+'&title='+title+'&pic='+lk;
        }
      })
      .catch(function(data) {
        screenTopWarning(data || data.error);
      })
  }
}

