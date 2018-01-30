var support = true;
var money = parseInt($('#total').attr('money'));
var remittance = [];
$(function() {
	init();
});

function init() {
	$('input[name="audit"]').on('click', function() {
		choose();
	});
	$('#remittance').on('input', function() {
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
	})
}

function choose() {
	var arr = $('input[name="audit"]');
	if(arr.eq(0).is(':checked')) {
		support = true;
	} else {
		support = false;
	}
}

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
