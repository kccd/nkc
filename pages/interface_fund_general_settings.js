function submit() {
	var obj = {
		description: '',
		terms: '',
		donationDescription: '',
		readOnly: false,
		closed: {
			status: false,
			openingHours: 0,
		}
	};

	var description = $('#description').val();
	var terms = $('#terms').val();
	var donationDescription = $('#donationDescription').val();
	var fundPoolDescription = $('#fundPoolDescription').val();
	if(!description) {
		return screenTopWarning('请输入科创基金介绍。');
	} else {
		obj.description = description;
	}
	if(!terms) {
		return screenTopWarning('请输入科创基金条款。');
	} else {
		obj.terms = terms;
	}
	if(!donationDescription) {
		return screenTopWarning('请输入科创基金捐款说明。');
	} else {
		obj.donationDescription = donationDescription;
	}
	if(!fundPoolDescription) {
		return screenTopWarning('请输入资金池介绍。');
	} else {
		obj.fundPoolDescription = fundPoolDescription;
	}
	obj.readOnly = $('input[name="readOnly"]').eq(0).is(':checked');
	obj.closed.status = $('input[name="closed"]').eq(0).is(':checked');

	var reason = $('#reason').val();
	var openingTime = $('#openingTime').val();
	if(openingTime === '') {
		openingTime = parseInt($('#openingTime').attr('time'));
	}
	if(obj.closed.status) {
		if(reason === '') {
			return screenTopWarning('请输入临时关闭的原因。');
		}
		openingTime = new Date(openingTime).getTime();
		if(openingTime <= new Date().getTime()) {
			return screenTopWarning('请输入正确的开放时间。');
		}
	}
	obj.closed.reason = reason;
	obj.closed.openingHours = openingTime;

	nkcAPI('/fund/settings', 'PATCH', {settingsObj: obj})
		.then(function() {
			screenTopAlert('提交成功。');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}