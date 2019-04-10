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