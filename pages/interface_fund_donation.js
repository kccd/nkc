var obj = {
	money: 200
};

$(function() {
	init();
	ensureBill();
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
		money = parseFloat(money);
		if(money >= 20) {
			obj.money = money.toFixed(1);
		} else {
			return screenTopWarning('捐款金额不能少于20元。');
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
			window.open(data.url);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


function ensureBill() {
	var id = $('#message').attr('bid');
	var fn = function() {
		setTimeout(function(){
			nkcAPI('/fund/bills/'+id, 'GET', {})
				.then(function(data) {
					var bill = data.bill;
					if(bill.verify) {
						$('#message').text('捐款成功！');
					} else {
						if(bill.error) {
							$('#error').text(bill.error);
						} else {
							if($('#message .point').html() === '.....') {
								$('#message .point').html('');
							}
							$('#message .point').html($('#message .point').html() + '.');
							fn();
						}
					}
				})
				.catch(function(data) {
					screenTopWarning(data.error)
				})
		}, 2000)
	};

	if(id) {
		fn();
	}

}


function selectFund(id) {
	obj.fundId = id;
	var arr = $('.select');
	arr.text('');
	for(var i = 0; i < arr.length; i++) {
		var element = arr.eq(i);
		if(element.attr('fundid') === obj.fundId) {
			element.text('已选择');
			break;
		}
	}
}

function selectMoney(m) {
	obj.money = m;
	var arr = $('.selectMoney');
	arr.text('');
	for(var i = 0; i < arr.length; i++) {
		var element = arr.eq(i);
		var money = element.attr('money');
		if(money) {
			money = parseInt(money);
			$('#money').hide();
		} else {
			$('#money').show();
		}
		if(m === money) {
			element.text('已选择');
			break;
		}
	}
}