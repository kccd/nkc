function ensureRemittance(id, number) {
	var info = '确认执行此操作？';
	if(confirm(info) === true) {
		nkcAPI('/fund/a/'+id+'/remittance', 'POST', {number: number})
			.then(function (data) {
				window.location.reload();
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	}
}