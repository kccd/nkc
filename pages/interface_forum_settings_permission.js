iconSwitch();

function switchStatus(id) {
	return $('#'+id).hasClass('fa-toggle-on');
}

function submit(fid) {

	var obj = {
		klass: $('#contentClass').val(),
		accessible: switchStatus('accessible'),
		displayOnParent: switchStatus('displayOnParent'),
		visibility: switchStatus('visibility'),
		isVisibleForNCC: switchStatus('isVisibleForNCC'),
	};
	nkcAPI('/f/'+fid+'/settings/permission', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}