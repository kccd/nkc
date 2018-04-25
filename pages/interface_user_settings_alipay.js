function getUrl(uid) {
	var newWindow = window.open();
	nkcAPI('/u/'+uid+'/settings/alipay/url', 'GET', {})
		.then(function(data) {
			newWindow.location = data.url;
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}