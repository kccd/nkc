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
function changeToApply(para) {
  var formShow = $(para).attr("formShow");
  if(formShow === "hide") {
    $("#applyButton").text("取消报名");
    $("#apply").css("display", "");
    $(para).attr("formShow", "show")
  }else{
    $("#applyButton").text("我要报名");
    $("#apply").css("display", "none");
    $(para).attr("formShow", "hide")
  }
}

// 切换至详情
function changeToDescription() {
  $("#apply").css("display", "none");
  $("#description").css("display", "");
}

// 提交报名
function onpost(acid) {
  // var realName = $("#realName").val().trim();
  // var mobile = $("#mobile").val().trim();
  // var kcName = $("#kcName").val().trim() || "";
  // var email = $("#email").val().trim() || "";
  // var agreeService = $("#agreement").is(":checked");
  // var mobileReg = /^[1][3,4,5,7,8][0-9]{9}$/;
  // var emailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
  // clearErrTips("#realNameErr");
  // clearErrTips("#mobileErr");
  // clearErrTips("#emailErr");
  // if(realName == ""){
  //   return errInfoTips("请填写真实姓名","#realNameErr");
  // }
  // if(mobile == "" || !mobileReg.test(mobile)){
  //   return errInfoTips("请填写11位手机号", "#mobileErr");
  // }
  // if(email){
  //   if(email == "" || !emailReg.test(email)){
  //     return errInfoTips("请填写正确的邮箱格式")
  //   }
  // }
  // var wxNum = $("#wxNum").val().trim() || "";
  // var qqNum = $("#qqNum").val().trim() || "";
  // var age = $("#age").val().trim() || "";
  // var education = $("#education").val().trim() || "";
  // var wordUnit = $("#wordUnit").val().trim() || "";
  var enrollInfo = [];
  var isStop = false;
  $("#apply").find(".form-group").each(function() {
    var enrolls = {};
    enrolls.key = $(this).find("#enrollKey").text().trim();
    if($(this).find("#enrollValue").attr("type") == "text"){
      enrolls.value = $(this).find("#enrollValue").val().trim();
      if(enrolls.value == ""){
        sweetWarning("请填写"+enrolls.key);
        isStop = true;
        return false;
      }
    }
    enrollInfo.push(enrolls)
  })
  if(isStop){
    return;
  }
  var post = {
    acid: acid,
    enrollInfo: enrollInfo
  }
  nkcAPI("/activity/single/"+acid, "POST", {post:post})
  .then(function(data) {
    sweetAlert("报名成功！");
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  })
  .catch(function(data) {
    sweetWarning(data.error);
  })
}

// 发表评论
function submitComment(acid) {
  var commentContent = $("#commentContent").val().trim();
  if(commentContent == ""){
    return sweetWarning("请填写内容后再发表评论")
  }
  var post = {
    commentContent: commentContent,
    acid: acid
  }
  nkcAPI("/activity/post/"+acid, "POST", {post:post})
  .then(function(data) {
    sweetAlert("发表成功！");
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  })
  .catch(function(data) {
    sweetWarning(data.error);
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
      sweetAlert(alertInfo);
      setTimeout(function(){
        window.location.reload();
      }, 1000);
    })
    .catch(function(data){
      sweetWarning(data.error)
    })
}