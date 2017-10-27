var shortMessage = (function(){
  var me = {}

  me.boxuser = geid('username');
  me.boxcontent=geid('content');
  me.btnsend = geid('send');

  me.send = function(){
    var username = me.boxuser.value.trim()
    if(username=='')return screenTopWarning('请输入收信用户名')

    var content = me.boxcontent.value.trim()
    if(content=='')return screenTopWarning('请输入消息内容')

    me.btnsend.disabled = true;
    return nkcAPI('sendShortMessageByUsername',{username:username,c:content})
    .then(function(res){
      location.reload()
    })
    .catch(function(err){
      jwarning(err);
      me.btnsend.disabled = false;
    })
  }

  me.init = function(){
    console.log('interface_messages.js init...');

    me.btnsend.addEventListener('click',me.send);
  }

  return me;
})();

shortMessage.init();

function setReceiver(name){
  shortMessage.boxuser.value=name;
  shortMessage.boxcontent.focus();
}

if(shortMessage.boxuser.value!=''){
  shortMessage.boxcontent.focus();
}
