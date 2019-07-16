var clipboard = new ClipboardJS('#shareLinkButton', {
  text: function(trigger) {
    return window.location.origin + window.location.pathname;
  }
});

clipboard.on('success', function() {
  screenTopAlert("链接已复制到粘贴板");
});
function shareShowWeChat() {
  $(".weChat-image").toggle();
}

function shareToOther(shareType, type, title, pid, description){
  var host = window.location.host;
  var lk = 'http://'+host+'/default/logo3.png';
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
        var newUrl = 'https://' + host + data.newUrl;
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

