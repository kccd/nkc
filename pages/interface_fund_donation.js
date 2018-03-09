$(function() {
	init();
});
function init() {
	$('input[name="money"]').on('click', function() {
		var otherInput = $('#otherInput');
		if($('#other').is(':checked')) {
			if(otherInput.hasClass('hidden')) {
				otherInput.removeClass('hidden');
			}
		} else {
			if(!otherInput.hasClass('hidden')) {
				otherInput.addClass('hidden');
			}
		}
	})
}

function submit() {
	var obj = {};
	var fundArr = $('input[name="fund"]');
	for(var i = 0; i < fundArr.length; i++) {
		var f = fundArr.eq(i);
		if(f.is(':checked')) {
			obj.fundId = f.attr('fundId') || '';
			break;
		}
	}
	if($('#other').is(':checked')) {
		var money = $('#money').val();
		if(money === '') {
			return screenTopWarning('请输入捐款金额。');
		}
		if(money >= 0) {
			obj.money = money.toFixed(1);
		} else {
			return screenTopWarning('请输入正确的捐款金额。');
		}
	} else {
		var moneyArr = $('input[name="money"]');
		for(var i = 0; i < moneyArr.length; i++) {
			var m = moneyArr.eq(i);
			if(m.is(':checked')) {
				var money = m.attr('money');
				money = parseInt(money);
				obj.money = money;
				break;
			}
		}
	}
	obj.anonymous = $('input[name="anonymous"]').eq(0).is(':checked');
	if(obj.money > 0) {

	}else {
		return screenTopWarning('请输入正确的捐款金额。');
	}
	nkcAPI('/fund/donation', 'POST', obj)
		.then(function(data) {
			window.location.href = data.url;
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}