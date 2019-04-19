function saveAuth() {
  // 获取等级
  var authLevel = Number($("#authLevel").val());
  nkcAPI('/e/settings/shop/auth', "POST", {authLevel})
  .then(function(data){
    screenTopAlert("保存成功")
  })
  .catch(function() {
    screenTopWarning(data.error || data);
  })
}

function addBanUid() {
  var sign = window.prompt("请输入封禁商品上架功能的用户uid");
  if(!sign) {
    screenTopWarning("什么也没有输入");
  }else{
    nkcAPI('/e/settings/shop/auth', "POST", {sign: sign})
    .then(function(data){
      screenTopAlert("保存成功");
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
  }
}

function delBanUid(uid) {
  var suredel = window.confirm("确定解禁该用户？");
  if(suredel) {
    nkcAPI('/e/settings/shop/auth/delban', "PATCH", {uid: uid})
    .then(function(data){
      screenTopAlert("解禁成功");
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
  }
}