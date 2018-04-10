function submit(uid) {
	var productionCode = $('#productionCode').val();
	if(productionCode === '') return screenTopWarning('请输入产品系列号。');
	nkcAPI('/u/'+uid+'/production', 'POST', {code: productionCode})
		.then(function() {
			screenTopAlert('验证序列号成功。');
			setTimeout(function() {
				window.location.reload();
			}, 2000);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}