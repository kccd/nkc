// 团队申请/个人申请
var selectedUsers = [];
var getUsers = [];
// 项目其他信息
var projectCycle = [];
var budgetMoney = [];
// 填写个人信息
var payMethod = '';

// 自动保存间隔
var timeToAutoSave = 5*60; // 秒
$(function() {
	init();
	initTeam();
	initSelectedUsers();
	initFundPay();
	var applicationFormId = $('#applicationFormId').text();
	applicationFormId = parseInt(applicationFormId);
	autoSaveProject(applicationFormId);
	initProjectCycle();
	initBudgetMoney();
	onContentChange();
});

function init() {
	$('#team').on('click', function() {
		teamDisplay();
	});
	$('#personal').on('click', function() {
		teamDisappear();
		//clearTeam();
	});
	$('.wechat').on('click', function() {
		chooseWechat();
	});
	$('.alipay').on('click', function() {
		chooseAlipay();
	});
}

function initTeam() {
	if($('#team').hasClass('active')){
		teamDisplay();
	}
}

function clearTeam() {
	selectedUsers = [];
	getUsers = [];
	displayResult();
	displaySelectedUsers();
}

function teamDisplay() {
	$('#teamDiv').css('display', 'block');
	$('#team').addClass('active');
	$('#personal').removeClass('active');
}

function teamDisappear() {
	$('#teamDiv').css('display', 'none');
	$('#team').removeClass('active');
	$('#personal').addClass('active');
}

function initSelectedUsers() {
	var users = $('.selectedUser');
	var length = users.length;
	selectedUsers = [];
	for(var i = 0; i < length; i++) {
		selectedUsers.push({
			uid: $('.selectedUser').eq(i).attr('uid'),
			username: $('.selectedUser').eq(i).text()
		});
	}
}

function getSubscribeUsers(uid) {
	nkcAPI('/u/'+uid+'/subscribe', 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(err) {
			return jwarning(err);
		})
}

function getSubscribers(uid) {
	nkcAPI('/u/'+uid+'/subscribe?fans=true', 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(err) {
			return jwarning(err);
		})
}

function displayResult() {
	var usersList = '';
	var blank = '<div class="blank">暂无数据</div>';
	if(getUsers.length === 0) {
		return $('#usersList').html(blank);
	}
	for (var user of getUsers){
		usersList += '<span class="fund-span disabled" uid="'+user.uid+'" onclick="selectUser('+user.uid+')">'+user.username+'<span class="fund-span add glyphicon glyphicon-ok"></span></span>';
	}
	$('#usersList').html(usersList);
}

function displaySelectedUsers() {
	var usersList = '';
	var blank = '<h4>暂未添加组员</h4>';
	var head = '<h4>已添加组员：</h4>';
	if(selectedUsers.length === 0) {
		return $('#selectedUsersDiv').html(blank);
	}
	usersList += head;
	for (var user of selectedUsers) {
		usersList += '<span class="fund-span selectedUser" uid="'+user.uid+'" onclick="deleteUser('+user.uid+')">'+user.username+'<span class="fund-span delete glyphicon glyphicon-remove"></span></span></span>';
	}
	$('#selectedUsersDiv').html(usersList);
}

function selectUser(uid) {
	uid = '' + uid;
	var username = '';
	for(var user of getUsers) {
		if(user.uid === uid) {
			username = user.username;
		}
	}
	for(var user of selectedUsers) {
		if(user.uid === uid) {
			return;
		}
	}
	selectedUsers.push({
		uid,
		username: username
	});
	displaySelectedUsers();
}

function deleteUser(uid) {
	uid = '' + uid;
	for (var i = 0; i < selectedUsers.length; i++) {
		if(selectedUsers[i].uid === uid) {
			selectedUsers.splice(i, 1);
			break;
		}
	}
	displaySelectedUsers();
}

function getUser() {
	var blank = '<div class="blank">搜索中，请稍后...</div>';
	$('#usersList').html(blank);
	var text = $('#username').val();
	if(text === '') {
		return jwarning('输入不能为空！');
	}
	nkcAPI('/u'+'?username='+text+'&uid='+text, 'GET', {})
		.then(function(data) {
			getUsers = data.targetUsers;
			displayResult();
		})
		.catch(function(err) {
			return jwarning(err);
		})
}

function submit(id){
	var obj = {
		newMembers: [],
		s: 1
	};
	if ($('#team').hasClass('active')) {
		if(selectedUsers.length === 0) {
			return jwarning('团队申请必须要有组员，若没有组员请选择个人申请。');
		}
		obj.newMembers = selectedUsers;
	}
	nkcAPI('/fund/a/'+id, 'PATCH', obj)
		.then(function(data){
			var s = data.s;
			window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
		})
		.catch(function(err) {
			return jwarning(err);
		})

}

function initFundPay() {
	if($('.wechat').hasClass('active')) {
		payMethod = 'wechat';
	} else if($('.alipay').hasClass('active')) {
		payMethod = 'alipay';
	} else {
		payMethod = '';
	}
}

function chooseWechat() {
	$('.wechat').addClass('active');
	$('.alipay').removeClass('active');
	initFundPay();
}
function chooseAlipay() {
	$('.wechat').removeClass('active');
	$('.alipay').addClass('active');
	initFundPay();
}

function submitUserMessages(id) {
	try {
		var obj = userMessagesForm();
		var data = {
			account: {
				paymentMethod: obj.paymentMethod,
				number: obj.account
			},
			newApplicant: {
				name: obj.name,
				idCardNumber: obj.idCardNumber,
				mobile: obj.mobile,
				description: obj.description
			},
			s: 2
		};
		nkcAPI('/fund/a/'+id, 'PATCH', data)
			.then(function(data) {
				var s = data.s;
				window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
			})
			.catch(function(err) {
				jwarning(err);
			})
	} catch (err) {
		jwarning(err);
	}
}

function submitEnsureUsersMessages(id) {
	if(id === undefined) {
		setTimeout(function() {
			jalert('保存成功！');
		}, 300);
	} else {
		nkcAPI('/fund/a/'+id, 'PATCH', {s: 3})
			.then(function(data) {
				var s = data.s;
				window.location.href = '/fund/a/'+id+'/settings?s='+(s+1);
			})
			.catch(function(err) {
				jwarning(err);
			})
	}
}

function saveProject(id, callback) {
	var project = {
		t: $('#projectTitle').val(),
		c: $('#projectContent').text()
	};
	nkcAPI('/fund/a/'+id, 'PATCH', {project: project, s: 4})
		.then(function(data) {
			if(callback === undefined){
				jalert('保存成功！');
			} else {
				callback(data);
			}
		})
		.catch(function(err) {
			jwarning(err);
		})
}

function toEditor(id) {
	saveProject(id, function(){
		window.location.href = '/editor?target=application/'+id+'/p/';
	});
}

function submitProject(id) {
	saveProject(id, function(){
		window.location.href = '/fund/a/'+id+'/settings?s=5';
	});
}

function autoSaveProject(id) {
	if($('.autoSaveTime').text() !== '') {
		$('.autoSaveTime').css('display', 'inline');
		var n = -1;
		var loop = function() {
			n++;
			setTimeout(function() {
				displayTimeToSave(timeToAutoSave-n);
				if(n < timeToAutoSave) { // 时间未到
					return loop();
				} else { // 时间到
					saveProject(id, function() {
						jalert('自动保存成功！');
						return autoSaveProject(id);
					});
				}
			}, 1000)
		};
		loop();
	}
}

function displayTimeToSave(time) {
	$('#saveTime').text(time+'秒');
}


function initBudgetMoney() {
	var length = $('.list .fund-money-list').length;
	var newArr = [];
	for (var i = 0; i < length; i++){
		newArr.push({
			purpose: getText('purpose', i),
			count: getText('count', i),
			money: getText('money', i)
		})
	}
	budgetMoney = newArr;
}

function getText(klass, i) {
	var text = $('.'+klass+'[num='+i+']').text();
	if(klass !== 'purpose') {
		return parseInt(text);
	}
	return text;
}

function initProjectCycle() {
	var str = $('#projectCycle').attr('key');
	if(str){
		var arr = str.split(',');
		for(var i = 0; i < arr.length; i++){
			if(i === 0 && arr[0] === ''){
				arr[0] = null;
			} else {
				arr[i] = parseInt(arr[i]);
			}
		}
		projectCycle = arr;
	}
}

function readProjectValue() {
	var time = $('#projectCycle').val();
	time = parseInt(time);
	if(time <= 0) {
		return jwarning('研究周期不能小于0天');
	}
	projectCycle[0] = time;
}

function displayPurpose(disabled) {
	var html = '';
	var aggregate = 0;
	var length = budgetMoney.length;
	if (length === 0) {
		$('#aggregate').text('');
		html = '<div class="blank" style="color: #ccc;line-height: 4rem;">暂无数据</div>';
	} else {
		for (var i = 0; i < length; i++) {
			var m = budgetMoney[i];
			m.i = i;
			html += fundMoneyList(m, disabled);
			aggregate += (m.count*m.money);
			m.i = undefined;
		}
		$('#aggregate').text('总计：'+aggregate+'元');
	}
	$('#budgetMoney .list').html(html);
}

function editor() {
	initBudgetMoney();
	var arr = $('.fund-money-list .delete');
	if(arr.length === 0) return;
	if(arr.eq(0).hasClass('disabled')) {
		$('.fund-money-list .delete').removeClass('disabled');
	} else {
		$('.fund-money-list .delete').addClass('disabled');
	}
}
function deleteList(num) {
	initBudgetMoney();
	budgetMoney.splice(num, 1);
	displayPurpose();
}

function addList() {
	initBudgetMoney();
	$('.delete').addClass('disabled');
	var obj = {
		money: 0,
		count: 0,
		purpose: '新建'+(budgetMoney.length+1)
	};
	budgetMoney.push(obj);
	displayPurpose(true);
	onContentChange();
}

function fundMoneyList(obj, disabled) {
	var purpose = obj.purpose;
	var count = obj.count;
	var money = obj.money;
	var total = count*money;
	var i = obj.i;
	var dis = '';
	if(disabled === true) dis = 'disabled';
	return '<div class="fund-money-list" num='+i+'><div class="purpose" contenteditable=true num='+i+'>'+purpose+'</div><div class="count" contenteditable=true num='+i+'>'+count+'</div><div class="money" contenteditable=true num='+i+'>'+money+'</div><div class="total" num='+i+'>'+total+'</div><div class="delete glyphicon glyphicon-remove '+dis+'" onclick="deleteList('+i+')"></div></div>';
}

function onContentChange() {
	$('.purpose, .count, .money').unbind();
	$('.purpose, .count, .money').one('blur', function(){
		initBudgetMoney();
		displayPurpose(true);
		onContentChange();
	})
}

function  saveBudgetMoney(id, callback) {
	initBudgetMoney();
	readProjectValue();
	var obj = {
		projectCycle: projectCycle,
		budgetMoney: budgetMoney,
		s: 5
	};
	nkcAPI('/fund/a/'+id, 'PATCH', obj)
		.then(function(data) {
			if(callback !== undefined) {
				callback(data);
			} else {
				jalert('保存成功！');
			}
		})
		.catch(function(err) {
			jwarning(err);
		})
}