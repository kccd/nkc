var customForm;
if(NKC.modules.customForm) {
  customForm = new NKC.modules.customForm();
}

$("document").ready(function() {
  $("#agreement").change(function() {
    var isChecked = $("#agreement").is(":checked");
    if(isChecked == true) {
      $("#onpost").attr("disabled",false)
    }else{
      $("#onpost").attr("disabled",true)
    }
  })
  var options = JSON.parse($("#contionJSON").text());
  customForm.initResult(options);
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
  var enrollInfo = customForm.outputResultJSON();
  if(enrollInfo.length === 0){
    sweetWarning("必填项不得为空");
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