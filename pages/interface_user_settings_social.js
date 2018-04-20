var data = JSON.parse($('#data').text());
var accounts = data.accounts;
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
	load();
	var obj = {
		type: '',
		number: ''
	};
	accounts.push(obj);
	displayAccount();
}

function deleteAccount(i) {
	load();
	accounts.splice(i, 1);
	displayAccount();
}

function load() {
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

function submit(uid) {
	load();
	var obj = {
		accounts: accounts
	};
	nkcAPI('/u/'+uid+'/settings/social', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}