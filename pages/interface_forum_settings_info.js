function toEditor(fid) {
	window.location.href = '/editor?type=forum_declare&id='+fid;
}


function submit(fid, fn) {
	var obj = {
		displayName: $('#displayName').val(),
		abbr: $('#abbr').val(),
		color: $('#color').val(),
		description: $('#description').val(),
		brief: $('#brief').val(),
		basicThreadsId: $('#basicThreadsId').val(),
		noticeThreadsId: $('#noticeThreadsId').val(),
		valuableThreadsId: $('#valuableThreadsId').val(),
	};
	nkcAPI('/f/'+fid+'/settings/info', 'PATCH', obj)
		.then(function() {
			if(fn) {
				fn(fid);
			} else {
				screenTopAlert('保存成功');
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}