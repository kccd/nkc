/**
 * 提交开店申请
 */
function applyForOpenStore() {
  var data = {};
  nkcAPI("/shop/openStore", "POST", data)
  .then( function(data){
    screenTopAlert("申请已提交，审核需一段时间，请耐心等待");
    $("#apply").text("已提交申请");
    $("#apply").attr('disabled',true);
  })
  .catch( function(data){
    screenTopWarning(data.error || data)
  })
}

/**
 * 科创账号认证
 */
function accountAuth() {
  alert("账号认证")
}