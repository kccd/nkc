var upLoadFile;

// 初始化编辑器
var ue = UE.getEditor("editor", NKC.configs.ueditor.activityConfigs);

$.getJSON('../location.json',function(data){
	for (var i = 0; i < data.length; i++) {
		var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
		data[i] = area;
	}
	$('.bs-chinese-region').chineseRegion('source',data);
	$('#location').val($('#location').attr('data'));
});

$('#inputFile').on('change', function() {
	var file = $('#inputFile')[0].files[0];
	if(file) {
		upLoadFile = file;
	}
	// var reader = new FileReader();
	// reader.onload = function() {
  //   var url = reader.result;
  //   insertToImage(url);
	// };
  // reader.readAsDataURL(upLoadFile);
  savePoster();
});


var customForm;
if(NKC.modules.customForm) {
  customForm = new NKC.modules.customForm();
}
$(document).ready(function() {
  customForm.init();
})

function insertToImage(url) {
  var imgDom = '<img id="poster" style="width:100%;" srcs="" src="'+url+'">';
  $("#exampleImg").html(imgDom);
}

// 发布活动申请
function submitRelease() {
  // 检查标题
  var titleDom = $('#activityTitle').val().trim();
  clearErrTips("#titleErr");
  if(!titleDom || titleDom.length == 0){
    errInfoTips("请填写活动标题","#titleErr");
    return;
  };

  // 检查时间
  var enrollStartTime = $("#enrollStartTime").val(); // 报名开始时间
  var enrollEndTime = $("#enrollEndTime").val(); // 报名结束时间
  var holdStartTime = $("#holdStartTime").val(); // 活动开始时间
  var holdEndTime = $("#holdEndTime").val(); // 活动结束时间
  // if(!timeStampCheck("#enrollStartTime","#enrollStartTimeErr")){
  //   return;
  // }
  if(!timeStampCheck("#enrollEndTime","#enrollEndTimeErr")){
    return;
  }
  if(!deadlineCheck(enrollStartTime,enrollEndTime,"#enrollEndTimeErr")){
    return;
  }
  // if(!timeStampCheck("#holdStartTime","#holdStartTimeErr")){
  //   return;
  // }
  if(!timeStampCheck("#holdEndTime","#holdEndTimeErr")){
    return;
  }
  if(!deadlineCheck(holdStartTime, holdEndTime ,"#holdEndTimeErr")){
    return;
  }

  // 检查地址
  var locationArea = $('#location').val();
  clearErrTips("#locationErr");
  if(!locationArea) return errInfoTips("请选择地区", "#locationErr");

  var address = $('#address').val();
  clearErrTips('#addressErr');
  if(!address) return errInfoTips("请填写详细地址", "#addressErr");
  address = locationArea + address;

  // 检查海报
  clearErrTips("#posterErr");
  var posterSrc = $("#poster").attr("srcs");
  if(posterSrc.length == 0){
    return errInfoTips("请上传一张海报","#posterErr");
  }

  // 检查主办方
  var sponsor = $("#sponsor").val();
  clearErrTips("#sponsorErr");
  if(!sponsor.length) return errInfoTips("请填写主办方名称", "#sponsorErr");

  // 联系电话
  var contactNum = $("#contactNum").val().trim();
  clearErrTips("#contactNumErr");
  if(contactNum == ""){
    return errInfoTips("请填写联系电话", "#contactNumErr")
  }

  // 检查人数
  var activityPartNum = $("#activityPartNum").val();
  clearErrTips("#activityPartNumErr");
  var reg = /^\+?[1-9][0-9]*$/;
  if(activityPartNum != "0" && !reg.test(activityPartNum)){
    return errInfoTips("请填写正确数字","#activityPartNumErr")
  }

  // 检查报名人数条件
  var continueTofull = $("#continueTofull").is(":checked");

  // 获取报名条件
  var conditions = customForm.outputJSON();
  for(var c =0;c<conditions.length;c++) {
    if(conditions[c].infoName.length === 0) {
      return errInfoTips("表单名称不可为空！")
    }
    if(conditions[c].errorInfo && conditions[c].errorInfo.length > 0) {
      return errInfoTips(conditions[c].errorInfo)
    }
  }
  // 检查活动详情
  var description = ue.getContent();
  description = common.URLifyHTML(description);


  var post = {
    activityType: "release",
    activityTitle: titleDom,
    limitNum: activityPartNum,
    enrollStartTime: new Date(enrollStartTime).toJSON(),
    enrollEndTime: new Date(enrollEndTime).toJSON(),
    holdStartTime: new Date(holdStartTime).toJSON(),
    holdEndTime: new Date(holdEndTime).toJSON(),
    address: address,
    sponsor: sponsor,
    contactNum: contactNum,
    posterId: posterSrc,
    description: description,
    conditions: conditions,
    continueTofull: continueTofull
  }

  geid('save').disabled = true;
  nkcAPI('/activity/release', "POST" ,{post:post})
  .then(function(data) {
    // window.location.href = "/activity/list";
    openToNewLocation("/activity");
  })
  .catch(function(data){
    screenTopWarning(data || data.error);
    geid('save').disabled = false
  })
}


// 时间校验
function timeStampCheck(stampId, stampErrDomId){
  clearErrTips(stampErrDomId);
  var stampDom = $(stampId).val();
  var errInfo = "";
  if(!stampDom) {
    errInfo += "请选择时间";
    errInfoTips(errInfo, stampErrDomId);
    return false;
  };
  var nowStamp = new Date().getTime(); // 当前时间戳
  var aimStamp = new Date(stampDom).getTime(); // 目标时间戳
  if(parseInt(nowStamp) > parseInt(aimStamp)){
    errInfo += "不得早于当前时间";
    errInfoTips(errInfo, stampErrDomId);
    return false;
  }
  return true;
}

// 截止时间检查
function deadlineCheck(start, end, endDom) {
  var stratTime = new Date(start).getTime();
  var endTime = new Date(end).getTime();
  if(parseInt(endTime) <= parseInt(stratTime)){
    errInfoTips("结束时间不得早于或等于开始时间",endDom);
    return false;
  }
  return true;
}


// 上传海报
function postPoster() {

}


// 选择默认海报
function choosePoster() {

}

function savePoster() {
  var formData = new FormData();
  formData.append('file', upLoadFile);
	$.ajax({
		url: '/poster',
		method: 'POST',
		cache: false,
		data: formData,
		headers: {
			'FROM': 'nkcAPI'
		},
		dataType: 'json',
		contentType: false,
		processData: false,
	})
		.done(function(data) {
      var imgDom = '<img style="width:100%" id="poster" srcs="'+data.picname+'" src="/poster/'+data.picname+'">';
      $("#exampleImg").html(imgDom);
			screenTopAlert('海报上传成功');
		})
		.fail(function(data) {
      sweetError(JSON.parse(data.responseText));
		})
}

// 添加一行表单
function addOneForm() {
  var htmlstr = '<div class="form-inline"><input class="form-control" id="infoName" type="text" value="" placeholder="名称">&nbsp;<input class="form-control" id="infoDesc" type="text" value="" placeholder="提示信息">&nbsp;<button class="btn btn-default" onclick="delOneForm(this)"><i class="fa fa-trash"></i></button></div>';
  $("#conditions").append(htmlstr)
}

// 删除本行
function delOneForm(para) {
  $(para).parent().remove();
}