function initTime() {
	if(!$('.time').length){
		return;
	}
	$('.time').datetimepicker({
		language:  'zh-CN',
		format: 'yyyy-mm-dd hh:ii',
		autoclose: true,
		todayHighlight: 1,
		startView: 2,
		minView: 0,
		forceParse: 0
	});
}
initTime();

// 错误信息提示
function errInfoTips(info, errDomId) {
  var errorInfo = "";
  if(info) {
    errorInfo += info;
  };
  if(errDomId){
    $(errDomId).html(errorInfo);
  }else{
    screenTopWarning(errorInfo);
  }
}

// 清除错误信息提示
function clearErrTips(errDomId){
  $(errDomId).html("");
}

//屏蔽当前活动
function blockCurrentActivity(acid) {
	var post = {
		acid: acid
	}
	nkcAPI("/activity/block", "POST", post)
  .then(function(data) {
    sweetAlert("已屏蔽当前活动！");
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  })
  .catch(function(data) {
    sweetWarning(data.error);
  })
}

// 解除屏蔽当前活动
function unBlockCurrentActivity(acid) {
	var post = {
		acid: acid
	}
	nkcAPI("/activity/unblock", "POST", post)
  .then(function(data) {
    sweetAlert("已解除屏蔽当前活动！");
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  })
  .catch(function(data) {
    sweetWarning(data.error);
  })
}