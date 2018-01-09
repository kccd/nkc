// 团队申请/个人申请
var selectedUsers = [];
var getUsers = [];

// 填写个人信息
var payMethod = '';

$(function() {
	init();
	initTeam();
	initSelectedUsers();
	initFundPay();
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