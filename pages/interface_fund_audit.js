var support = true;
var money = parseInt($('#total').text());
var suggestMoney = [];
var factMoney = [];
var remittance = [];
var moneyPassed = true;
var infoPassed = true;
$(function() {
	initSuggestMoney();
	initFactMoney();
	init();
});

function init() {
	$('input[name="audit"]').on('click', function() {
		choose();
	});
	/*$('#remittance').on('input', function() {
		var text = $('#remittance').val();
		var arr = text.split(',');
		$('.remittance').html('');
		var html = '';
		var total = 0;
		remittance = [];
		for(var i = 0; i < arr.length; i++) {
			var num = parseInt(arr[i]);
			if(num > 0) {
				html += '<h4>第'+(i+1)+'期&nbsp;&nbsp;'+ num +'元</h4>';
				total += num;
				remittance.push(num);
			}
		}
		$('.remittance').html(html);
		$('#remainder').text('余：'+ (money-total) +'元');
		if(money-total < 0) $('#remainder').css('color', 'red');
	});*/

	$('.suggestMoney').on('blur', function() {
		initSuggestMoney();
	});
	$('.factMoney').on('blur', function() {
		initFactMoney();
	});
	$('input[type="radio"]').on('click', function() {
		displaySubmitButton();
	});
	$('#enterBtn').on('click', function () {
		displayRemittance();
	});
}

function initSuggestMoney() {
	var arr = $('.suggestMoney');
	if (arr.length === 0) return;
	suggestMoney = [];
	var total = 0;
	for(var i = 0; i < arr.length; i++) {
		var m = parseFloat(arr.eq(i).text());
		suggestMoney.push(m);
		total += m;
	}
	$('#suggestMoney').text(total);
	if(money*0.8 > total) {
		$('#projectAuditInfo').text('建议的金额小于原金额的80%，只能选择不通过。');
		moneyPassed = false;
	} else {
		$('#projectAuditInfo').text('');
		moneyPassed = true;
	}
	pass();
}

function initFactMoney() {
	var arr = $('.factMoney');
	factMoney = [];
	var total = 0;
	for(var i = 0; i < arr.length; i++) {
		var m = parseFloat(arr.eq(i).text());
		factMoney.push(m);
		total += m
	}
	$('#factMoney').text(total);
	if(money*0.8 > total) {
		$('#adminAuditInfo').text('实际的金额小于原金额的80%，只能选择不通过。');
		moneyPassed = false;
	}else {
		$('#adminAuditInfo').text('');
		moneyPassed = true;
	}
	pass();
}

function pass() {
	if(infoPassed && moneyPassed){
		$('#submit').text('通过');
		support = true;
	} else {
		$('#submit').text('不通过');
		support = false;
	}
}

function displaySubmitButton() {
	var userInfo = $('input[name="userInfo"]');
	var project = $('input[name="project"]');
	var otherMessages = $('input[name="otherMessages"]');
	if(userInfo.eq(0).is(':checked') && project.eq(0).is(':checked') && otherMessages.eq(0).is(':checked')) {
		infoPassed = true;
	} else {
		infoPassed = false;
	}
	pass();
}


function choose() {
	var arr = $('input[name="audit"]');
	if(arr.eq(0).is(':checked')) {
		support = true;
	} else {
		support = false;
	}
}

function displayRemittance() {
	var count = $('#remittanceCount').val();
	count = parseInt(count);
	createList(count);
}

function createList(count) {
	var factMoney = parseFloat($('#factMoney').text());
	var remainder,average;
	remainder = factMoney%count;
	if(remainder !== 0) {
		average = (factMoney - remainder)/count;
	} else {
		average = factMoney/count;
	}
	var html = '';
	for (var i = 0; i < count; i++) {
		if(i === count-1) {
			average += remainder;
		}
		html += '<div><span>第'+(i+1)+'期：</span><input id="list'+i+'" value="'+average+'"></div>';
	}
	$('#remittanceList').html(html);
	$('#remittanceList > div > input').on('blur', function() {
		console.log($(this).val())
	})
}


function submitProject(id) {
	var userInfo = $('input[name="userInfo"]');
	var project = $('input[name="project"]');
	var otherMessages = $('input[name="otherMessages"]');

	var userInfoComment = $('#userInfoComment').val();
	var projectComment = $('#projectComment').val();
	var moneyComment = $('#moneyComment').val();

	var c = '';
	if(!userInfo.eq(0).is(':checked') && !userInfoComment) {
		return screenTopWarning('请输入申请人信息不通过的原因');
	} else {
		c += userInfoComment+'\n';
	}
	if(!project.eq(0).is(':checked') && !projectComment) {
		return screenTopWarning('请输入项目内容不通过的原因');
	} else {
		c += projectComment+'\n';
	}
	if(!otherMessages.eq(0).is(':checked') && !moneyComment) {
		return screenTopWarning('请输入资金预算不通过的原因');
	} else {
		c += moneyComment;
	}
	var obj = {
		support: support,
		c: c,
		suggestMoney: suggestMoney,
		type: 'project'
	};
	nkcAPI('/fund/a/'+id+'/audit', 'POST', obj)
		.then(function(data) {
			screenTopAlert('提交成功！2s后跳转到基金列表。');
			setTimeout(function() {
				window.location.href = '/fund/list/'+data.fund._id;
			}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}




/*
function submit(id, type) {
	var comment = $('#comment').val();
	if(comment === '') {
		return screenTopWarning('审核评语不能为空！');
	}
	var obj = {
		comment: comment,
		support: support,
		type: type
	};
	var msg = '';
	if(support === false) {
		msg = '您选择的是“不通过”， 点击确定则提交。';
	} else {
		if(remittance.length === 0) {
			msg ='您选择的是“通过”，没有设置分期打款，点击确认提交。'
		} else {
			msg = '您选择的是“通过”，打款分为'+ remittance.length +'期，分别为：';
			for (let i = 0; i < remittance.length; i++) {
				msg += ' ' + remittance[i] + '元';
			}
		}
	}
	if(type === 'admin') {
		obj.remittance = remittance;
		if(confirm(msg)!==true) return;
	}
	nkcAPI('/fund/a/'+id+'/audit', 'POST', obj)
		.then(function(data) {
			screenTopAlert('提交成功！2s后跳转到基金列表。');
			setTimeout(function() {
				window.location.href = '/fund/list/'+data.fund._id;
			}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}
*/
