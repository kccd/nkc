var yesClass = 'greenColor glyphicon glyphicon-ok-circle';
var noClass = 'redFontColor glyphicon glyphicon-remove-circle';

var fundObj = {
  name: '科创基金',
  money: 0,
  description: '',
	explain: '',
  display: true,
  censor: {
    certs: []
  },
  color: '#7f9eb2',
  preconditions: {
    authentication: {
      idCard: false,
      idCardPhoto: false,
      lifePhoto: false,
      handheldIdCardPhoto: false
    },
    attachments: {
      threadCount: 0,
      paper: {
        count: 0,
        passed: true
      }
    },
    userLevel: 0,
    threadCount: 0,
    postCount: 0,
    timeToRegister: 0,
    supportCount: 0
  },
  timeOfPublicity: 0,
  reviseCount: 3
};
var preconditions = fundObj.preconditions;
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
      preconditions.authentication[authenticationArr.eq(i).attr('name')] = true;
    } else {
      preconditions.authentication[authenticationArr.eq(i).attr('name')] = false;
    }
  }
}

function passedPaperSet() {
  preconditions.attachments.paper.passed = $('#passed').is(':checked');
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
  $('#fundColor').on('blur', function () {
    colorSet();
  })
}


function submit(id) {
  if(!checkMoney()) return window.location.href = '#fundMoney';
  fundObj.money = $('#fundMoney').val();
  if($('#userLevel').val() > 0) preconditions.userLevel = $('#userLevel').val();
  if($('#threadCount').val() > 0) preconditions.threadCount = $('#threadCount').val();
  if($('#postCount').val() > 0) preconditions.postCount = $('#postCount').val();
  if($('#timeToRegister').val() > 0) preconditions.timeToRegister = $('#timeToRegister').val();
  if($('#supportCount').val() > 0) preconditions.supportCount = $('#supportCount').val();
  if($('#attachmentsThreads').val() > 0) preconditions.attachments.threadCount = $('#attachmentsThreads').val();
  if($('#attachmentsPapers').val() > 0) preconditions.attachments.paper.count = $('#attachmentsPapers').val();
  if($('#timeOfPublicity').val() > 0) fundObj.timeOfPublicity = $('#timeOfPublicity').val();
  if($('#reviseCount').val() > 0) fundObj.reviseCount = $('#reviseCount').val();
  fundObj.description = $('#fundDescription').val();
  fundObj.explain = $('#fundExplain').val();
  fundObj._id = $('#fundId').val();
  if(fundObj._id === '') return jwarning('基金编号不能为空！');
  if(!fundObj._id.match(/[A-Z]+/g)) return jwarning('基金编号只能由大写字母组成！');
  if($('#fundName').val()) fundObj.name = $('#fundName').val();
  var url = '/fund/list';
  var method = 'POST';
  if(id !== undefined) {
    url = '/fund/list/'+ id;
    method = 'PATCH';
  }
  nkcAPI(url, method, {fundObj})
    .then(function(data){
	    var inputFile = $('#fundImage').get(0);
	    var file;
	    if(inputFile.files.length > 0){
		    file = inputFile.files[0];
	    }else {
		    return jwarning('未选择背景图片');
	    }
	    var formData = new FormData();
	    formData.append('file', file);
	    jalert('背景图片上传中...');
	    postUpload('/fundBGI/'+data.fund._id, formData, function(){window.location.href='/fund/m'});
    })
    .catch(function(err){
      jwarning(err);
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
