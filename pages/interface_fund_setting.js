var yesClass = 'greenColor glyphicon glyphicon-ok-circle';
var noClass = 'redFontColor glyphicon glyphicon-remove-circle';

var fundObj = {
  name: '科创基金',
  money: {
  	initial: null,
	  fixed: null,
	  max: null
  },
  description: {},
  display: true,
  censor: {
    certs: [],
	  appointed: []
  },
  color: '#7f9eb2',
	image: null,
	applicationMethod: {
		individual: null,
		group: null
	},
	member: {
		idCard: false,
		idCardPhotos: false,
		lifePhotos: false,
		handheldIdCardPhoto: false
	},
	applicant: {
		idCard: false,
		idCardPhotos: false,
		lifePhotos: false,
		handheldIdCardPhoto: false,
		userLevel: 0,
		threadCount: 0,
		postCount: 0,
		timeToRegister: 0,
	},
	thread: {},
	paper: {},
  timeOfPublicity: 0,
  reviseCount: 3,
	supportCount: 0,
	conflict: {
  	self: false,
		other: false
	}

};

$(function(){
  UserAuthenticationSet();
  fundDisplaySet();
  censorSet();
  passedPaperSet();
  colorSet();
  censor();
  // fundName();
  fundMoney();
  fundDisplay();
  fundCensor();
  censorCheckBox();
  UserAuthentication();
  passedPaper();
  color();
	uploadFundImage();
	moneyFixed();
	moneyFixedSet();
	applicationMethod();
	applicationMethodSet();
	memberSet();
	member();
	conflict();
	conflictSet();
});

function done(id){
  $(id).removeClass().addClass(yesClass).text('');
}
function fail(id, text) {
  $(id).removeClass().addClass(noClass).text(text);
}

// 审查方式
function censorSet() {
  if($('input[name="censor"]').eq(0).is(':checked')) {
    $('#certsCheckBox label').removeClass('disabled');
    $('#certsCheckBox input').attr('disabled', false);
    fundCensor('read');
  } else {
    $('#certsCheckBox label').addClass('disabled');
    $('#certsCheckBox input').attr('disabled', true);
    fundCensor('clear');
  }
}
function censor() {
  $('.censor').on('click', function(){
    censorSet();
  });
}

function censorCheckBox() {
  $('input[name="cert"]').on('click', function() {
    fundCensor('read');
  });
}

/*function fundName() {
  $('#fundName').on('blur', function() {
    var nameLength = $('#fundName').val().length;
    if(nameLength !== 0 && nameLength < 4 || nameLength > 8){
      fail('#fundNameInfo', ' 4-8个汉字');
    }else {
      done('#fundNameInfo');
    }
  })
}*/
function fundMoney() {
   $('#fundMoney').on('blur', function() {
     checkMoney();
   })
}

function checkMoney() {
  var money = $('#fundMoney').val();
  if(money === '' || money <= 0){
    $('#fundMoneyInfo').removeClass().addClass(noClass).text(' 金额必须大于0');
    return false;
  }else {
    $('#fundMoneyInfo').removeClass().addClass(yesClass).text('');
    return true;
  }
}

function fundDisplay() {
  $('input[name="display"]').on('click', function() {
    fundDisplaySet();
  })
}

function fundDisplaySet() {
  if($('input[name="display"]').eq(0).is(':checked')) {
    fundObj.display = true;
  } else {
    fundObj.display = false;
  }
}

function fundCensor(options) {
  if(options === 'read'){
    fundObj.censor.certs = [];
    if($('input[name="censor"]').eq(0).is(':checked')) {
      var certArr = $('input[name="cert"]');
      var length = certArr.length;
      for (var i = 0; i < length; i++){
        if(certArr.eq(i).is(':checked')) fundObj.censor.certs.push(certArr.eq(i).attr('cert'));
      }
    }
  }
  if(options === 'clear') {
    fundObj.censor.certs = [];
    fundObj.censor.appointed = [];
	  $('#fundCensorAppointed').val('');
    var certArr = $('input[name="cert"]');
    var length = certArr.length;
    for (var i = 0; i < length; i++){
      certArr.eq(i).attr('checked', false);
    }
  }
}

function UserAuthentication() {
  $('.authentication').on('click', function() {
    UserAuthenticationSet();
  });
}
function UserAuthenticationSet() {
  var authenticationArr = $('.authentication');
  var length = authenticationArr.length;
  for(var i = 0; i < length; i++){
    if(authenticationArr.eq(i).is(':checked')) {
      fundObj.applicant[authenticationArr.eq(i).attr('name')] = true;
    } else {
      fundObj.applicant[authenticationArr.eq(i).attr('name')] = false;
    }
  }
}

function passedPaperSet() {
  fundObj.paper.passed = $('#passed').is(':checked');
}

function passedPaper(){
  $('input[name="passed"]').on('click', function() {
    passedPaperSet();
  });
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
	uploadFile('/fundBGI', '#fundImage', uploadSuccess)
}

function uploadSuccess(data) {
	var imageId = data.imageId;
	fundObj.image = imageId;
	$('#fundImageDisplay').css({
		'display': 'block'
	}).attr('src', '/fundBGI_small/'+imageId)

}

//基金金额 定额/不定额
function moneyFixedSet() {
	var arr = $('input[name="moneyFixed"]');
	var money = $('#fundMoney').val();
	if(money) {
		money = parseFloat(money);
	} else {
		money = null;
	}
	var placeholder = '固定金额';
	if(arr.eq(0).is(':checked')) {
		fundObj.money.max = null;
		fundObj.money.fixed = money;
	} else {
		placeholder = '最大申请金额';
		fundObj.money.max = money;
		fundObj.money.fixed = null;
	}
	$('#fundMoney').attr('placeholder', placeholder);
	$('#fundMoneyText').text(placeholder)
}
function moneyFixed() {
	$('input[name="moneyFixed"]').on('click', function() {
		moneyFixedSet();
	});
}

function applicationMethodSet() {
	var arr = $('input[name="applicationMethod"]');
	if(arr.eq(0).is(':checked')) {
		fundObj.applicationMethod.individual = true;
	}else {
		fundObj.applicationMethod.individual = false;
	}
	if(arr.eq(1).is(':checked')) {
		fundObj.applicationMethod.group = true;
	} else {
		fundObj.applicationMethod.group = false;
	}
}

function applicationMethod() {
	$('input[name="applicationMethod"]').on('click', function() {
		applicationMethodSet();
	})
}

function memberSet() {
	var arr = $('.members');
	for(var i = 0; i < arr.length; i++) {
		var element = arr.eq(i);
		var name = element.attr('name');
		if(element.is(':checked')) {
			fundObj.member[name] = true;
		} else {
			fundObj.member[name] = false;
		}
	}
}

function member() {
	$('.members').on('click', function() {
		memberSet();
	})
}

function conflict() {
	$('input[name="conflict"]').on('click', function () {
		conflictSet();
	})
}

function conflictSet() {
	var arr = $('input[name="conflict"]');
	if(arr.eq(0).is(':checked')) {
		fundObj.conflict.self = true;
	} else {
		fundObj.conflict.self = false;
	}
	if(arr.eq(1).is(':checked')) {
		fundObj.conflict.other = true;
	} else {
		fundObj.conflict.other = false;
	}
}

function submit(id) {
	moneyFixedSet();
	if (!fundObj.image) {
		var imageId = $('#fundImageDisplay').attr('imageId');
		if(imageId) {
			fundObj.image = parseInt(imageId);
		}
	}
  if(!checkMoney()) return window.location.href = '#fundMoney';
  if($('#userLevel').val() > 0) fundObj.applicant.userLevel = $('#userLevel').val();
  if($('#threadCount').val() > 0) fundObj.applicant.threadCount = $('#threadCount').val();
  if($('#postCount').val() > 0) fundObj.applicant.postCount = $('#postCount').val();
  if($('#timeToRegister').val() > 0) fundObj.applicant.timeToRegister = $('#timeToRegister').val();
  if($('#supportCount').val() > 0) fundObj.supportCount = $('#supportCount').val();
  if($('#attachmentsThreads').val() > 0) fundObj.thread.count = $('#attachmentsThreads').val();
  if($('#attachmentsPapers').val() > 0) fundObj.paper.count = $('#attachmentsPapers').val();
  if($('#timeOfPublicity').val() > 0) fundObj.timeOfPublicity = $('#timeOfPublicity').val();
  if($('#reviseCount').val() > 0) fundObj.reviseCount = $('#reviseCount').val();
  fundObj.censor.appointed = $('#fundCensorAppointed').val();
  fundObj.description.brief = $('#briefDescription').val();
  fundObj.description.detailed = $('#detailedDescription').val();
  fundObj._id = $('#fundId').val();
  if(fundObj._id === '') return screenTopWarning('基金编号不能为空！');
  if(!fundObj._id.match(/[A-Z]+/g)) return screenTopWarning('基金编号只能由大写字母组成！');
  if(fundObj._id.length > 4) return screenTopWarning('基金编号不能超过四位！');
  if($('#fundName').val()) fundObj.name = $('#fundName').val();
  var initial = $('#initial').val();
  if(initial) {
  	initial = parseFloat(initial);
  } else {
  	initial = 0;
  }
	fundObj.money.initial = initial;
  var url = '/fund/list';
  var method = 'POST';
  if(id !== undefined) {
    url = '/fund/list/'+ id;
    method = 'PATCH';
  }
  nkcAPI(url, method, {fundObj: fundObj})
    .then(function(){
	    window.location.href = '/fund/m';
    })
    .catch(function(data){
      screenTopWarning(data.error);
    })
}
/*

function userLevel() {
  $('#userLevel').on('blur', function() {
    var userLevel = $('#userLevel');
    if(userLevel.val() < 0) {
      fail('#userLevelInfo', ' 用户等级不能为负！');
    } else {
      done('#userLevelInfo');
    }
  })
}

function threadCont() {
  $('#threadCount').on('blur', function() {
    var threadCount = $('#threadCount');
    if(threadCount.val() < 0) {
      fail('#threadCountInfo', ' 用户不能为负！');
    } else {
      done('#threadCountInfo');
    }
  })
}*/
