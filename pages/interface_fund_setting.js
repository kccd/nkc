var fundObj = {
  name: '科创基金',
  money: {
  	// initial: null,
	  fixed: null,
	  max: null
  },
  description: {},
	auditType: null,
  display: true,
	canApply: true,
	history: false,
	disabled: false,
  censor: {
    certs: [],
	  appointed: []
  },
	expert: {
		certs: [],
		appointed: []
	},
	financialStaff: {
		certs: [],
		appointed: []
	},
	admin: {
		certs: [],
		appointed: []
	},
	voter: {
		certs: [],
		appointed: []
	},
	commentator: {
		certs: [],
		appointed: []
	},
  color: '#7f9eb2',
	image: {},
	applicationMethod: {
		personal: null,
		team: null
	},
	applicant: {
		userLevel: null,
		threadCount: null,
		postCount: null,
		timeToRegister: null,
	},
	member:{},
	thread: {},
	paper: {},
	detailedProject: true,
  timeOfPublicity: 0,
  modifyCount: 3,
	supportCount: 0,
	conflict: {
  	self: false,
		other: false
	}

};

$(function() {
	loadSettings();
	moneyFixed();
	uploadFundImage();
	uploadfundLogoImage();
	color();
});


function loadSettings() {
	// id, 基金名，基金简介、补充说明、条款
	fundObj._id = $('#fundId').val();
	fundObj.name = $('#fundName').val();
	fundObj.description.brief = $('#briefDescription').val();
	fundObj.description.detailed = $('#detailedDescription').val();
	fundObj.description.terms = $('#terms').val();

	fundObj.reminder = {};
	fundObj.reminder.inputProject = $("#inputProject").val();
  fundObj.reminder.inputUserInfo = $("#inputUserInfo").val();
  if(!fundObj.reminder.inputProject || !fundObj.reminder.inputUserInfo) screenTopWarning("所有温馨提示不能为空");

	//背景颜色，banner，logo
	fundObj.color = $('#fundColor').val() || '#7f9eb2';
	var banner = $('#fundImageDisplay').attr('imageId');
	if(banner) {
		fundObj.image.banner = parseInt(banner);
	} else {
		fundObj.image.banner = null;
	}
	var logo = $('#fundLogoImageDisplay').attr('imageId');
	if(logo) {
		fundObj.image.logo = parseInt(logo);
	} else {
		fundObj.image.logo = null;
	}
	/*//初始金额
	var initial = $('#fundInitial').val();
	if(initial) {
		initial = parseInt(initial);
		fundObj.money.initial = initial;
	} else {
		fundObj.money.initial = null;
	}*/

	//固定申请金额、最大申请金额
	var fixedMoney = $('#fundMoney').val();
	if(fixedMoney) {
		fixedMoney = parseInt(fixedMoney);
	} else {
		fixedMoney = null;
	}
	if($('input[name="moneyFixed"]').eq(0).is(':checked')) {
		fundObj.money.fixed = fixedMoney;
		fundObj.money.max = null;
	} else {
		fundObj.money.max = fixedMoney;
		fundObj.money.fixed = null;
	}

	//审核方式选择
	if($('input[name="auditType"]').eq(0).is(':checked')) {
		fundObj.auditType = 'person';
	} else {
		fundObj.auditType = 'system';
	}

	//显示入口
	fundObj.display = $('input[name="display"]').eq(0).is(':checked');

	//是否接受新申请
	fundObj.canApply = $('input[name="canApply"]').eq(0).is(':checked');

	//设置为历史基金
	fundObj.history = $('input[name="history"]').eq(0).is(':checked');

	//完全屏蔽
	fundObj.disabled = $('input[name="disabled"]').eq(0).is(':checked');

	//相关人员权限设置

	//专家
	var expertCertArr = $('input[name="expertCert"]');
	fundObj.expert.certs = [];
	var certInput;
	for(var i = 0; i < expertCertArr.length; i++) {
		certInput = expertCertArr.eq(i);
		if(certInput.is(':checked')) {
			fundObj.expert.certs.push(certInput.attr('cert'));
		}
	}
	fundObj.expert.appointed = stringToArr($('#expertUid').val());

	//财务
	var financialStaffCertArr = $('input[name="financialStaffCert"]');
	fundObj.financialStaff.certs = [];
	for(var i = 0; i < financialStaffCertArr.length; i++) {
		certInput = financialStaffCertArr.eq(i);
		if(certInput.is(':checked')) {
			fundObj.financialStaff.certs.push(certInput.attr('cert'));
		}
	}
	fundObj.financialStaff.appointed = stringToArr($('#financialStaffUid').val());

	//检查员
	var censorCertArr = $('input[name="censorCert"]');
	fundObj.censor.certs = [];
	for(var i = 0; i < censorCertArr.length; i++) {
		certInput = censorCertArr.eq(i);
		if(certInput.is(':checked')) {
			fundObj.censor.certs.push(certInput.attr('cert'));
		}
	}
	fundObj.censor.appointed = stringToArr($('#censorUid').val());

	//管理员
	var adminCertArr = $('input[name="adminCert"]');
	fundObj.admin.certs = [];
	for(var i = 0; i < adminCertArr.length; i++) {
		certInput = adminCertArr.eq(i);
		if(certInput.is(':checked')) {
			fundObj.admin.certs.push(certInput.attr('cert'));
		}
	}
	fundObj.admin.appointed = stringToArr($('#adminUid').val());

	//评论人员
	var commentatorCertArr = $('input[name="commentatorCert"]');
	fundObj.commentator.certs = [];
	for(var i = 0; i < commentatorCertArr.length; i++) {
		certInput = commentatorCertArr.eq(i);
		if(certInput.is(':checked')) {
			fundObj.commentator.certs.push(certInput.attr('cert'));
		}
	}
	fundObj.commentator.appointed = stringToArr($('#commentatorUid').val());

	//投票人员
	var voterCertArr = $('input[name="voterCert"]');
	fundObj.voter.certs = [];
	for(var i = 0; i < voterCertArr.length; i++) {
		certInput = voterCertArr.eq(i);
		if(certInput.is(':checked')) {
			fundObj.voter.certs.push(certInput.attr('cert'));
		}
	}
	fundObj.voter.appointed = stringToArr($('#voterUid').val());

	//申请人资格
	var userLevel = $('#userLevel').val();
	fundObj.applicant.userLevel = userLevel?parseInt(userLevel): 0;
	var threadCount = $('#threadCount').val();
	fundObj.applicant.threadCount = threadCount?parseInt(threadCount): 0;
	var postCount = $('#postCount').val();
	fundObj.applicant.postCount = postCount?parseInt(postCount): 0;
	var timeToRegister = $('#timeToRegister').val();
	fundObj.applicant.timeToRegister = timeToRegister?parseInt(timeToRegister): 0;
	var applicantAuthLevel = $('#applicantAuthLevel').val();
	fundObj.applicant.authLevel = applicantAuthLevel?parseInt(applicantAuthLevel): 1;
	var memberAuthLevel = $('#memberAuthLevel').val();
	fundObj.member.authLevel = memberAuthLevel?parseInt(memberAuthLevel): 1;

	//附带的帖子或论文
	var attachmentsThreads = $('#attachmentsThreads').val();
	fundObj.thread.count = attachmentsThreads?parseInt(attachmentsThreads): 0;
	var attachmentsPapers = $('#attachmentsPapers').val();
	fundObj.paper.count = attachmentsPapers? parseInt(attachmentsPapers): 0;
	fundObj.paper.passed = $('input[name="passed"]').eq(0).is(':checked');


	//其他信息
	//申请方式
	fundObj.applicationMethod.personal = $('input[name="applicationMethod"]').eq(0).is(':checked');
	fundObj.applicationMethod.team = $('input[name="applicationMethod"]').eq(1).is(':checked');
	fundObj.detailedProject = $('input[name="detailedProject"]').eq(0).is(':checked');
	//允许退修次数
	var modifyCount = $('#modifyCount').val();
	fundObj.modifyCount = modifyCount? parseInt(modifyCount): 5;

	//好友支持数
	var supportCount = $('#supportCount').val();
	fundObj.supportCount = supportCount? parseInt(supportCount): 0;

	//示众天数
	var timeOfPublicity = $('#timeOfPublicity').val();
	fundObj.timeOfPublicity = timeOfPublicity? parseInt(timeOfPublicity): 0;

	//年最大申请次数
	var applicationCountLimit = $('#applicationCountLimit').val();
	fundObj.applicationCountLimit = applicationCountLimit? parseInt(applicationCountLimit): 10;

	//互斥
	fundObj.conflict.self = $('input[name="conflict"]').eq(0).is(':checked');
	fundObj.conflict.other = $('input[name="conflict"]').eq(1).is(':checked');

}


function colorSet() {
  var color = $('#fundColor').val() || '#7f9eb2';
  $('#fundColorDisplay').css('background-color', color);
  fundObj.color = color;
}

function color(){
  $('#fundColor').on('input', function () {
    colorSet();
  })
}

// 基金背景图片上传
function uploadFundImage() {
	uploadFile('/fundBanner', '#fundImage', uploadSuccess)
}
function uploadfundLogoImage() {
	uploadFile('/fundLogo', '#fundLogoImage', uploadAvatarImgSuccess)
}

function uploadSuccess(data) {
	var imageId = data.imageId;
	fundObj.image.banner = imageId;
	$('#fundImageDisplay').css({
		'display': 'block'
	}).attr({
		'src': '/fundBanner/'+imageId,
		'imageId': imageId
	})
}

function uploadAvatarImgSuccess(data) {
	var imageId = data.imageId;
	fundObj.image.logo = imageId;
	$('#fundLogoImageDisplay').css({
		'display': 'block'
	}).attr({
		'src': '/fundLogo/'+imageId,
		'imageId': imageId
	})
}

function moneyFixedSet() {
	var arr = $('input[name="moneyFixed"]');
	var placeholder = '固定金额（人民币元，不能有小数点）';
	if(arr.eq(1).is(':checked')) {
		placeholder = '最大申请金额（人民币元，不能有小数点）';
	}
	$('#fundMoney').attr('placeholder', placeholder);
	$('#fundMoneyText').text(placeholder)
}
function moneyFixed() {
	$('input[name="moneyFixed"]').on('click', function() {
		moneyFixedSet();
	});
}


function deleteBanner() {
	$('#fundImageDisplay').css('display', 'none').attr('imageId', '');
}

function deleteLogo() {
	$('#fundLogoImageDisplay').css('display', 'none').attr('imageId', '');
}

function stringToArr(str) {
	if(str === '') return [];
	var arr = str.split(',');
	var newArr = [];
	for(var i = 0; i < arr.length; i++) {
		var uid = $.trim(arr[i]);
		if(newArr.indexOf(uid) === -1) {
			newArr.push(uid);
		}
	}
	return newArr;
}

function submit(id) {

	loadSettings();

	//输入判断
	if(fundObj._id === '') return screenTopWarning('基金编号不能为空。');
	if(!fundObj._id.match(/[A-Z]+/g)) return screenTopWarning('基金编号只能由大写字母组成。');
	if(fundObj._id.length > 4) return screenTopWarning('基金编号不能超过四位！');
	if(fundObj.auditType === 'system' && fundObj.admin.appointed.length === 0) {
		return screenTopWarning('系统审核必须指定管理员UID。');
	}
	var url = '/fund/list';
	var method = 'POST';
	if(id !== undefined) {
		url = '/fund/list/'+ id;
		method = 'PATCH';
	}
	nkcAPI(url, method, {fundObj: fundObj})
		.then(function(data){
			var fund = data.fund;
			if(fundObj.disabled) {
				window.location.href = '/fund/list';
			} else if(fundObj.history) {
				window.location.href = '/fund/history';
			} else {
				window.location.href = '/fund/list/'+fund._id.toLowerCase();
			}
		})
		.catch(function(data){
			screenTopWarning(data.error);
		})
}
