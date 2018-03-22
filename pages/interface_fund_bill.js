var obj = {};

$(function() {
	initFromTo("from");
	initFromTo("to");
});

function initFromTo(type) {
	var arr = $('input[name="'+type+'"]');
	arr.on('click', function() {
		if(arr.eq(0).is(':checked')) {
			$('#'+type+'Fund').hide();
			$('#'+type+'Other').hide();
			$('#'+type+'User').show();
		} else if (arr.eq(1).is(':checked')) {
			$('#'+type+'User').hide();
			$('#'+type+'Other').hide();
			$('#'+type+'Fund').show();
		} else if (arr.eq(2).is(':checked')) {
			$('#'+type+'User').hide();
			$('#'+type+'Fund').hide();
			$('#'+type+'Other').hide();
		} else {
			$('#'+type+'User').hide();
			$('#'+type+'Fund').hide();
			$('#'+type+'Other').show();
		}
	})
}

function getUser(type) {
	var uid = $('#'+type+'Uid').val();
	if(uid === '') return screenTopWarning('用户UID不能为空。');
	nkcAPI('/u/'+uid, 'GET', {})
		.then(function(data) {
			var user = data.targetUser;
			if(!user) {
				$('#'+type+'UserInfo').text('未找到用户').addClass('text-danger');
			} else {
				$('#'+type+'UserInfo').text('用户名: '+user.username).removeClass('text-danger');
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function inputAbstract(a) {
	$('#abstract').val(a);
}


function load() {
	var time = $('#time').val();
	var timeValue = $('#time').attr('time');
	if(!time){
		if(!timeValue) {
			throw '请选择时间。';
		} else {
			time = parseInt(timeValue);
		}
	}
	obj.toc = new Date(time).getTime();
	var abstract = $('#abstract').val();
	if(!abstract) throw '请输入摘要。';
	obj.abstract = abstract;
	loadFromTo('from');
	loadFromTo('to');
	obj.notes = $('#notes').val();
	obj.verify = $('input[name="verify"]').eq(0).is(':checked');
	var money = $('#money').val();
	money = parseFloat(money);
	if(money > 0) {
		obj.money = money.toFixed(1);
	} else {
		throw '请输入金额。';
	}
}

function loadFromTo(type) {
	obj[type] = {};
	var arr = $('input[name="'+type+'"]');
	if(arr.eq(0).is(':checked')) {
		obj[type].type = 'user';
		obj[type].id = $('#'+type+'Uid').val() || '';
		obj[type].anonymous = $('input[name="'+type+'Anonymous"]').eq(0).is(':checked');
	} else if(arr.eq(1).is(':checked')) {
		obj[type].type = 'fund';
		var fundArr = $('input[name="'+type+'Fund"]');
		var id = '';
		for(var i = 0; i < fundArr.length; i++) {
			if(fundArr.eq(i).is(':checked')) {
				id = fundArr.eq(i).attr('fundId');
				break;
			}
		}
		if(!id) throw '请选择基金项目。';
		obj[type].id = id;
	} else if(arr.eq(2).is(':checked')){
		obj[type].type = 'fundPool';
	} else {
		obj[type].type = 'other';
		var otherInfo = $('#'+type+'OtherInfo').val();
		if(!otherInfo) throw '请输入其他途径。';
		obj[type].id = otherInfo;
	}
}

function submit(id) {
	$('#submit').addClass('disabled');
	try{
		load();
		var url, method;
		if(id) {
			url = '/fund/bills/'+id;
			method = 'PATCH';
		} else {
			url = '/fund/bills';
			method = 'POST';
		}
		nkcAPI(url, method, {billObj: obj})
			.then(function() {
				jump(obj);
			})
			.catch(function(data) {
				$('#submit').removeClass('disabled');
				screenTopWarning(data.error);
			})
	} catch(err) {
		screenTopWarning(err);
	}
}


function deleteBill(id) {
	if(confirm('确定要删除该条记录？') === false) return;
	nkcAPI('/fund/bills/'+id, 'DELETE', {})
		.then(function (data) {
			var bill = data.bill;
			jump(bill);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


function jump(obj){
	if(obj.from.type === 'fundPool') {
		window.location.href = '/fund/bills';
	} else if(obj.from.type === 'fund') {
		window.location.href = '/fund/list/'+obj.from.id+'/bills';
	} else {
		if(obj.to.type === 'fund') {
			window.location.href = '/fund/list/'+obj.to.id+'/bills';
		} else {
			window.location.href = '/fund/bills';
		}
	}
}