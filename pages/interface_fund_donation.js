var obj = {
	money: 500,
	anonymous: false
};
var loginJson = $('#info').text();
var info = JSON.parse(loginJson);
var login = info.login;
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
	if(obj.money < 20) {
		$('#submit').removeClass('disabled').attr('onclick', fn);
		return screenTopWarning('单笔赞助金额不能少于20元。');
	}
	if(obj.money > 10000) {
		$('#submit').removeClass('disabled').attr('onclick', fn);
		return screenTopWarning('单笔赞助金额不能超过10000元，请分批次赞助。')
	}
	if(!obj.anonymous && !login) {
		$('#submit').removeClass('disabled').attr('onclick', fn);
		return screenTopWarning('非匿名赞助要求用户必须登录，请登录后再试。');
	}

	var url = '/fund/donation?getUrl=true&money=' + obj.money + '&anonymous=' + obj.anonymous;
	var isPhone = NKC.methods.isPhone();
	var newWindow;

	if(NKC.configs.platform !== 'reactNative') {
		if(isPhone) {
			url += '&redirect=true';
			screenTopAlert('正在前往支付宝...');
			return window.location.href = url;
		} else {
			newWindow = window.open();
		}
	}

	nkcAPI(url, 'GET')
		.then(function(data) {
			if(NKC.configs.platform === 'reactNative') {
				NKC.methods.visitUrl(data.url, true);
			} else {
				newWindow.location = data.url;
			}
			sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
			// $('#donation-mask').removeClass('hidden');
			// $('#submit').removeClass('disabled').attr('onclick', fn);
		})
		.catch(function(data) {
			if(newWindow) {
				newWindow.document.body.innerHTML = data.error || data;
			}
			sweetError(data);
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
						$('#message').text('系统已确认，支付成功！');
						setTimeout(function(){
							// window.location.href='/fund';
							openToNewLocation('/fund');
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
	arr.text('').css('background-color', '');
	for(var i = 0; i < arr.length; i++) {
		var element = arr.eq(i);
		if(element.attr('fundid') === obj.fundId) {
			element.text('已选择').css('background-color', 'rgba(255,255,255,0.8)');
			break;
		}
	}
}

function selectMoney(m) {
	obj.money = m;
	var arr = $('.selectMoney');
	arr.text('未选择').css('color', '#c3e9f5');
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
			element.text('已选择').css('color', '#ffc253');
			break;
		}
	}
}

function disappearMask(){
	$('#donation-mask').addClass('hidden');
}
