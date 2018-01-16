function removeApplicationForm(aid) {
	if(confirm('确定要删除？') === true) {
		nkcAPI('/fund/a/'+aid, 'DELETE', {})
			.then(function() {
				screenTopAlert('删除成功！');
				setTimeout(function(){
					window.location.reload();
				}, 2000)
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	}
}