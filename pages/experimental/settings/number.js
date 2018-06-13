function saveNumberSettings() {
	var coefficients = {
		postToForum: $('#postToForum').val(),
		postToThread: $('#postToThread').val(),
		digest: $('#digest').val(),
		dailyLogin: $('#dailyLogin').val(),
		xsf: $('#xsf').val(),
		thumbsUp: $('#thumbsUp').val(),
		violation: $('#violation').val()
	};
	nkcAPI('/e/settings/number', 'PATCH', {coefficients: coefficients})
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}