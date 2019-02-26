/**
 * 提交开店申请
 */
function applyForOpenStore() {
  var data = {};
  nkcAPI("/shop/openStore", "POST", data)
  .then( function(data){
    console.log("已提交申请");
    $("#apply").attr('disabled',true);
  })
  .catch( function(err){
    console.log("申请提交失败")
  })
}

/**
 * 科创账号认证
 */
function accountAuth() {
  alert("账号认证")
}