function initTime() {
	$('.time').datetimepicker({
		language:  'zh-CN',
		format: 'yyyy-mm-dd',
		autoclose: 1,
		todayHighlight: 1,
		startView: 4,
		minView: 2,
		forceParse: 0
	});
}
var privacy = {
	name: 0,
	gender: 0,
	birthDate: 0,
	location: 0,
	address: 0,
	education: 0,
	industry: 0
};

$.getJSON('/location.json',function(data){
	for (var i = 0; i < data.length; i++) {
		var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
		data[i] = area;
	}
	$('.bs-chinese-region').chineseRegion('source',data);
	$('#location').val($('#location').attr('data'));
});

var eduName = [
	{
		id: 10,
		name: '小学'
	},
	{
		id: 20,
		name: '初中'
	},
	{
		id: 30,
		name: '高中'
	},
	{
		id: 40,
		name: '中专'
	},
	{
		id: 50,
		name: '大专'
	},
	{
		id: 60,
		name: '本科'
	},
	{
		id: 70,
		name: '硕士'
	},
	{
		id: 80,
		name: '博士'
	}
];

var data = JSON.parse($('#data').text());

var education = data.education;
var industries= data.industries;
var indName = data.forumsObj;
var accounts = data.accounts;
function educationRender(arr) {
	var div = $('<div></div>');
	for(var i = 0; i < arr.length; i++) {
		var educationList = addEduElement(arr[i], i);
		div.append(educationList);
	}
	return div;
}

function industriesRender(arr) {
	var div = $('<div></div>');
	for(var i = 0; i < arr.length; i++) {
		var industriesList = addIndElement(arr[i], i);
		div.append(industriesList);
	}
	return div;
}

function addEduElement(obj, i) {
	var educationList = $('<div class="education-list"></div>');
	var form = $('<div class="form-inline"></div>');
	var select = $('<select class="form-control" id="eduName'+i+'" onchange="changeSelect('+i+', this.value)"></select> ');
	for(var j = 0; j < eduName.length; j++) {
		var selected = '';
		if(obj.degree === eduName[j].id) {
			selected = 'selected';
		}
		var option = $('<option '+selected+'>'+eduName[j].name+'</option> ');
		select.append(option);
	}
	var timeInput = $('<input readonly class="form-control time" id="eduTime'+i+'" size="7" type="text" placeholder="入学时间" value="'+obj.timeB+'"> ');
	var schoolInput = $('<input class="form-control" id="eduSchool'+i+'" type="text" placeholder="学校名称" value="'+obj.school+'"> ');
	var majorInput = $('<input class="form-control" id="eduMajor'+i+'" type="text" placeholder="专业名称" value="'+obj.major+'" style="'+(obj.degree > 30?'':'display: none;')+'"> ');
	var deleteBtn = $('<button class="btn btn-danger btn-sm" onclick="deleteEdu('+i+')" id="edu'+i+'DeleteBtn">删除</button> ');
	form.append(select);
	form.append('&nbsp;');
	form.append(timeInput);
	form.append('&nbsp;');
	form.append(schoolInput);
	form.append('&nbsp;');
	form.append(majorInput);
	form.append('&nbsp;');
	form.append(deleteBtn);
	form.append('&nbsp;');
	educationList.append(form);
	return educationList;
}

function addIndElement(obj, i) {
	var getDivByClass = function(klass) {
		return $('<div class="'+klass+'"></div>');
	};
	var getInfo = function(t) {
		return $('<h5>'+t+'</h5>');
	};
	var industriesList = $('<div class="industries-list"></div>');
	var form = $('<div class="form"></div>');
	var row = $('<div class="row"></div>');
	var indSelect = $('<select class="form-control" onchange="selectInd('+i+', this.value)"></select>');
	var dutySelect = $('<select class="form-control" onchange="selectDuty('+i+', this.value)" id="duty'+i+'"></select>');
	for(var j = 0; j < indName.length; j++) {
		var ind = indName[j];
		if(ind.level === 1) {
			var selected = '';
			if(ind.id === obj.industry) {
				selected = 'selected';
			}
			var option = $('<option '+selected+'>'+ind.name+'</option> ');
			indSelect.append(option);
		}
		if(ind.parentsId.indexOf(obj.industry) !== -1) {
			selected = '';
			if(ind.id === obj.duty) {
				selected = 'selected';
			}
			option = $('<option '+selected+'>'+ind.name+'</option> ');
			dutySelect.append(option);
		}
	}
	var col1 = getDivByClass('col-xs-4 col-md-4');
	col1.append(getInfo('行业分类'));
	col1.append(indSelect);
	var col2 = getDivByClass('col-xs-4 col-md-4');
	col2.append(getInfo('&nbsp;'));
	col2.append(dutySelect);
	var occu = $('<input type="text" class="form-control" id="indOccu'+i+'" placeholder="职位名称" value="'+(obj.occupation || '')+'">');
	col3 = getDivByClass('col-xs-12 col-md-4');
	col3.append(getInfo('职位名称'));
	col3.append(occu);
	var br = getDivByClass('col-xs-12 col-md-12');
	var org = $('<input type="text" class="form-control" id="indOrg'+i+'" placeholder="单位名称" value="'+(obj.organization || '')+'">');
	var col4 = getDivByClass('col-xs-12 col-md-4');
	col4.append(getInfo('单位名称'));
	col4.append(org);
	var col44 = getDivByClass('row').append(getDivByClass('col-xs-12 col-md-12').append(col4));
	var timeB = $('<input readonly type="text" class="form-control time" id="indTimeB'+i+'" size="8" placeholder="入职日期" value="'+(obj.timeB || '')+'">');
	var col5 = getDivByClass('col-xs-12 col-md-3');
	col5.append(getInfo('入职日期'));
	col5.append(timeB);
	var timeE = $('<input readonly type="text" class="form-control time" id="indTimeE'+i+'" size="8" placeholder="离职日期" value="'+(obj.timeE || '')+'">');
	var col6 = getDivByClass('col-xs-12 col-md-3');
	col6.append(getInfo('离职日期'));
	col6.append(timeE);
	var text = $('<textarea class="form-control" rows="5" placeholder="工作内容简介" id="indDes'+i+'">'+(obj.description || '')+'</textarea>');
	var col7 = getDivByClass('col-xs-12 col-md-12');
	col7.append(getInfo('工作内容简介'));
	col7.append(text);
	var deleteBtn = $('<button class="btn btn-danger btn-sm" onclick="deleteInd('+i+')" id="ind'+i+'DeleteBtn">删除</button> ');
	var btn = getDivByClass('col-xs-12 col-md-12');
	btn.append($("<br>"));
	btn.append(deleteBtn);
	row.append(col1);
	row.append(col2);
	row.append(br);
	row.append(col44);
	row.append(col3);
	row.append(col5);
	row.append(col6);
	row.append(col7);
	row.append(btn);
	form.append(row);
	industriesList.append(form);
	form.append('&nbsp;');
	return industriesList;
}

function displayInd() {
	$('#industries-div').html(industriesRender(industries));
	initTime();
}

function displayEdu() {
	$('#education-div').html(educationRender(education));
	initTime();
}

function deleteEdu(i) {
	load();
	education.splice(i, 1);
	displayEdu();
}

function deleteInd(i) {
	load();
	industries.splice(i, 1);
	displayInd();
}

function addEdu() {
	var obj = {
		degree: 1,
		timeB: '',
		major: '',
		school: ''
	};
	var element = addEduElement(obj, education.length);
	$('#education-div>div').append(element);
	education.push(obj);
	initTime();
}

function addInd() {
	var obj = {
		timeB: '',
		timeE: '',
		industry: '5',
		duty: '81',
		occupation: '',
		organization: ''
	};
	var element = addIndElement(obj, industries.length);
	$('#industries-div>div').append(element);
	industries.push(obj);
	initTime();
}

function load() {
	for(var i = 0 ; i < education.length; i++) {
		var e = education[i];
		e.timeB = $('#eduTime'+i).val();
		e.school = $('#eduSchool'+i).val();
		e.major = $('#eduMajor'+i).val();
	}
	for(var i = 0; i < industries.length; i++) {
		var e = industries[i];
		e.timeB = $('#indTimeB'+i).val();
		e.timeE = $('#indTimeE'+i).val();
		e.occupation = $('#indOccu'+i).val();
		e.organization = $('#indOrg'+i).val();
		e.description = $('#indDes'+i).val();
	}
	loadDisplayResume('name');
	loadDisplayResume('gender');
	loadDisplayResume('birthDate');
	loadDisplayResume('location');
	loadDisplayResume('address');
	loadDisplayResume('education');
	loadDisplayResume('industry');
}


function changeSelect(j, value) {
	var id;
	for(var i = 0; i < eduName.length; i++) {
		if(eduName[i].name === value) {
			id = eduName[i].id;
			break;
		}
	}
	education[j].degree = id;
	if(id < 40) {
		$('#eduMajor'+j).css('display', 'none');
	} else {
		$('#eduMajor'+j).css('display', '');
	}
}

function selectInd(j, value) {
	var indId;
	var selected = 'selected';
	$('#duty'+j).html('');
	for(var i = 0; i < indName.length; i++) {
		var ind = indName[i];
		if(ind.name === value) {
			indId = ind.id;
			break;
		}
	}
	for(var i = 0; i < indName.length; i++) {
		ind = indName[i];
		if(ind.parentsId.indexOf(indId) !== -1) {
			var option = $('<option '+selected+'>'+ind.name+'</option>');
			$('#duty'+j).append(option);
			if(selected) selected = '';
		}
	}
	industries[j].industry = indId;
}

function selectDuty(j, value) {
	for(var i = 0; i < indName.length; i++) {
		var ind = indName[i];
		if(ind.name === value) {
			industries[j].duty = ind.id;
			break;
		}
	}
}


displayInd();
displayEdu();

function submit(uid) {
	load();
	var obj = {
		education: education,
		industries: industries,
		name: $('#name').val(),
		birthDate: $('#birthDate').val(),
		address: $('#address').val(),
		location: $('#location').val(),
		privacy: privacy
	};
	var arr = $('input[name="gender"]');
	if(arr.eq(0).is(':checked')) {
		obj.gender = 'men';
	} else {
		obj.gender = 'women';
	}
	nkcAPI('/u/'+uid+'/settings/resume', 'PUT', obj)
		.then(function() {
			sweetSuccess('保存成功');
		})
		.catch(function(data) {
			sweetError(data.error || data);
		})
}

$('#countryLi').on('click', function() {
	$('#province').html('--');
	$('#city').html('--');
	$('#district').html('--');
});


function loadDisplayResume(id) {
	var optionArr = [];
	var arr = $('#'+id+'Select option');
	for(var i = 0; i < arr.length; i++) {
		optionArr.push({
			data: arr.eq(i).attr('data'),
			text: arr.eq(i).text()
		});
	}
	var select = $('#'+id+'Select');
	for(var i = 0; i < optionArr.length; i++) {
		if(select.val() === optionArr[i].text) {
			privacy[id] = optionArr[i].data;
			break;
		}
	}
}

function addAccountElement(obj, i) {
  var accountList = $('<div class="account-list"></div>');
  var sm2 = $('<div class="col-sm-2"></div>');
  var inputType = $('<input class="form-control" id="type'+i+'" type="text" placeholder="账号平台" value="'+obj.type+'">');
  sm2.append(inputType);
  var sm4 = $('<div class="col-sm-4"></div>');
  var inputNumber = $('<input class="form-control" id="number'+i+'" type="text" placeholder="请输入账号" value="'+obj.number+'">');
  sm4.append(inputNumber);
  var sm5 = $('<div class="col-sm-5"></div>');
  var deleteBtn = $('<button class="btn btn-danger" onclick="deleteAccount('+i+')">删除</button>');
  sm5.append(deleteBtn);
  accountList.append(sm2);
  accountList.append(sm4);
  accountList.append(sm5);
  return accountList;
}

function displayAccount() {
  var accountDiv = $('#account-div');
  accountDiv.html('');
  for(var i = 0; i < accounts.length; i++) {
    var account = accounts[i];
    if(account.type === 'wechat') {
      $('#wechat').val(account.number);
    } else if(account.type === 'QQ') {
      $('#QQ').val(account.number);
    } else if(account.type === 'google') {
      $('#google').val(account.number);
    } else {
      accountDiv.append(addAccountElement(account, i));
    }
  }
}

function addAccount() {
  loadAccounts();
  var obj = {
    type: '',
    number: ''
  };
  accounts.push(obj);
  displayAccount();
}

function deleteAccount(i) {
  loadAccounts();
  accounts.splice(i, 1);
  displayAccount();
}

function loadAccounts() {
  var hasQQ, hasWechat, hasGoogle;
  for(var i = 0; i < accounts.length; i++) {
    var account = accounts[i];
    if(account.type === 'QQ') {
      accounts[i].number = $('#QQ').val();
      hasQQ = true;
    } else if(account.type === 'wechat') {
      accounts[i].number = $('#wechat').val();
      hasWechat = true;
    } else if(account.type === 'google') {
      hasGoogle = true;
      accounts[i].number = $('#google').val();
    } else {
      accounts[i].type = $('#type'+i).val();
      accounts[i].number = $('#number'+i).val();
    }
  }
  if(!hasQQ) {
    accounts.push({
      type: 'QQ',
      number: $('#QQ').val()
    })
  }
  if(!hasWechat) {
    accounts.push({
      type: 'wechat',
      number: $('#wechat').val()
    })
  }
  if(!hasGoogle) {
    accounts.push({
      type: 'google',
      number: $('#google').val()
    })
  }
}

$(function() {
  displayAccount();
});

function submitSocial(uid) {
  loadAccounts();
  var obj = {
    accounts: accounts
  };
  nkcAPI('/u/'+uid+'/settings/social', 'PUT', obj)
    .then(function() {
      sweetSuccess('保存成功');
    })
    .catch(function(data) {
      sweetError(data.error || data);
    })
}


$(function() {
  initEvent('life');
  initEvent('cert');
});
var displayResume = {};
function initEvent(elementId) {
  $('#'+elementId).on('change', function() {
    var files = $('#'+elementId)[0].files;
    uploadLifePhotos(files, 0, elementId);
  });
}

function removePhoto(id) {
  nkcAPI('/photo/'+id, 'DELETE', {})
    .then(function(data) {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data.error);
    });
}

function uploadLifePhotos(files, i, elementId) {
  if(elementId === "cert") {
    $('#certPhotoInfo').text((i+1) + '/' + files.length);
  } else {
    $('#photoInfo').text((i+1) + '/' + files.length);
  }
  var file = files[i];
  var formData = new FormData();
  formData.append('file', file);
  formData.append('photoType', elementId);
  nkcUploadFile("/photo", "POST", formData, function(e, percentage) {
    console.log(percentage);
  })
    .then(function() {
      i++;
      if(i <= (files.length-1)) {
        uploadLifePhotos(files, i, elementId);
      } else {
        window.location.reload();
      }
    })
    .catch(function(data) {
      sweetError(data);
    })
}

function submitPhoto(uid) {
  var optionArr = [];
  var displayPhoto = 0;
  var arr = $('#lifePhotoSelect option');
  for(var i = 0; i < arr.length; i++) {
    optionArr.push({
      data: arr.eq(i).attr('data'),
      text: arr.eq(i).text()
    });
  }
  var select = $('#lifePhotoSelect');
  for(var i = 0; i < optionArr.length; i++) {
    if(select.val() === optionArr[i].text) {
      displayPhoto = optionArr[i].data;
      break;
    }
  }
  nkcAPI('/u/'+uid+'/settings/photo', 'PUT', {displayPhoto: displayPhoto})
    .then(function(){
      sweetSuccess('保存成功');
    })
    .catch(function(data) {
      sweetError(data.error || data);
    })
}

function submitCert(uid) {
  var optionArr = [];
  var displayPhoto = 0;
  var arr = $('#certPhotoSelect option');
  for(var i = 0; i < arr.length; i++) {
    optionArr.push({
      data: arr.eq(i).attr('data'),
      text: arr.eq(i).text()
    });
  }
  var select = $('#certPhotoSelect');
  for(var i = 0; i < optionArr.length; i++) {
    if(select.val() === optionArr[i].text) {
      displayPhoto = optionArr[i].data;
      break;
    }
  }
  nkcAPI('/u/'+uid+'/settings/cert', 'PUT', {displayPhoto: displayPhoto})
    .then(function(){
      sweetSuccess('保存成功');
    })
    .catch(function(data) {
      sweetError(data.error || data);
    })
}
