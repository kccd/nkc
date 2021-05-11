function ensureRemittance(id, number) {
	var info = '确认执行此操作？';
	if(confirm(info) === true) {
		$('#remittance').attr('disabled', true);
		nkcAPI('/fund/a/'+id+'/remittance', 'POST', {number: number})
			.then(function (data) {
				window.location.reload();
			})
			.catch(function(data) {
				screenTopWarning(data.error);
				$('#remittance').removeAttr('disabled');
			})
	}
}

function withdrawApplicationForm(id) {
	nkcAPI('/fund/a/'+id+'?type=withdraw', 'DELETE', {})
		.then(function(data) {
			// window.location.href = '/fund/a/'+data.applicationForm._id;
			openToNewLocation('/fund/a/'+data.applicationForm._id);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function refuseApplicationForm(id) {
	nkcAPI('/fund/a/'+id+'?type=refuse', 'DELETE', {})
		.then(function(data) {
			// window.location.href = '/fund/a/'+data.applicationForm._id;
			openToNewLocation('/fund/a/'+data.applicationForm._id);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

Object.assign(window, {
	ensureRemittance,
	withdrawApplicationForm,
	refuseApplicationForm,
});