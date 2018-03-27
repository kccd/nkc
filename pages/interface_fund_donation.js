var obj = {
	money: 200,
	anonymous: false
};

$(function() {
	init();
	ensureBill();
});
function init() {
	$('.choose-anonymous').on('click', function() {
		$('.choose-anonymous').removeClass('active');
		$(this).addClass('active');
		obj.anonymous = $(this).attr('anonymous') === 'true';
	})
	var arr = $('.select');
	for(var i = 0; i < arr.length; i++) {
		if(arr.eq(i).text() === '已选择') {
			obj.fundId = arr.eq(i).attr('fundid');
			break;
		}
	}
}

function submit() {
	var fn = $('#submit').attr('onclick');
	$('#submit').attr('onclick', '').addClass('disabled');
	var arr = $('.selectMoney');
	for(var i = 0; i < arr.length; i++) {
		if(arr.eq(i).text() === '已选择') {
			if(arr.eq(i).attr('money') === undefined) {
				var money = $('#money input').val();
				if(!money) {
					money = 0;
				} else {
					money = parseInt(money);
				}
			} else {
				var money = arr.eq(i).attr('money');
				money = parseInt(money);
			}
			obj.money = money;
			break;
		}
	}
	if(obj.money > 20 && obj.money < 10000) {

	} else {
		return screenTopWarning('请输入正确的捐款金额。');
	}
	nkcAPI('/fund/donation', 'POST', obj)
		.then(function(data) {
			$('#link').attr('href', data.url);
			$('#link')[0].click();
			$('#submit').removeClass('disabled').attr('onclick', fn);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
			$('#submit').removeClass('disabled').attr('onclick', fn);
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
						$('#message').text('捐款成功，感谢您的捐款！');
						setTimeout(function(){
							window.location.href='/fund';
						}, 3000);
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