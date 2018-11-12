$("document").ready(function() {
  $("#agreement").change(function() {
    var isChecked = $("#agreement").is(":checked");
    if(isChecked == true) {
      $("#onpost").attr("disabled",false)
    }else{
      $("#onpost").attr("disabled",true)
    }
  })
})

// 切换至报名
function changeToApply() {
  $("#description").css("display", "none");
  $("#apply").css("display", "");
}

// 切换至详情
function changeToDescription() {
  $("#apply").css("display", "none");
  $("#description").css("display", "");
}

// 提交报名
function onpost(acid) {
  var realName = $("#realName").val().trim();
  var mobile = $("#mobile").val().trim();
  var kcName = $("#kcName").val().trim() || "";
  var email = $("#email").val().trim() || "";
  var agreeService = $("#agreement").is(":checked");
  var mobileReg = /^[1][3,4,5,7,8][0-9]{9}$/;
  var emailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
  clearErrTips("#realNameErr");
  clearErrTips("#mobileErr");
  clearErrTips("#emailErr");
  if(realName == ""){
    return errInfoTips("请填写真实姓名","#realNameErr");
  }
  if(mobile == "" || !mobileReg.test(mobile)){
    return errInfoTips("请填写11位手机号", "#mobileErr");
  }
  if(email){
    if(email == "" || !emailReg.test(email)){
      return errInfoTips("请填写正确的邮箱格式")
    }
  }
  var wxNum = $("#wxNum").val().trim() || "";
  var qqNum = $("#qqNum").val().trim() || "";
  var age = $("#age").val().trim() || "";
  var education = $("#education").val().trim() || "";
  var wordUnit = $("#wordUnit").val().trim() || "";

  var post = {
    acid: acid,
    realName: realName,
    kcName: kcName,
    mobile: mobile,
    email: email,
    wxNum: wxNum,
    qqNum: qqNum,
    age: age,
    education: education,
    wordUnit: wordUnit
  }
  nkcAPI("/activity/single/"+acid, "POST", {post:post})
  .then(function(data) {
    screenTopAlert("报名成功！");
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  })
  .catch(function(data) {
    screenTopWarning(data.error);
  })
}

// 发表评论
function submitComment(acid) {
  var commentContent = $("#commentContent").val().trim();
  if(commentContent == ""){
    return screenTopWarning("请填写内容后再发表评论")
  }
  var post = {
    commentContent: commentContent,
    acid: acid
  }
  nkcAPI("/activity/post/"+acid, "POST", {post:post})
  .then(function(data) {
    screenTopAlert("发表成功！");
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  })
  .catch(function(data) {
    screenTopWarning(data.error);
  })
}

// 取消报名
function cancelApply(acid) {
	if(confirm('确认放弃报名？') === false) return;
  var url = '/activity/single/'+acid;
  var method = "DELETE";
  var alertInfo = "已取消报名";
  nkcAPI(url, method, {})
    .then(function(){
      screenTopAlert(alertInfo);
      setTimeout(function(){
        window.location.reload();
      }, 1000);
    })
    .catch(function(data){
      screenTopWarning(data.error)
    })
}