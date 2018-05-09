
$('input[name="selectForum"]').iCheck({
	checkboxClass: 'icheckbox_flat-red',
});

function submit(id) {
	var arr = $('input[name="selectForum"]');
	var obj = {
		type: 'subscribeForums',
		subscribeForums: []
	};
	for(var i = 0; i < arr.length; i ++){
		if(arr.eq(i).prop('checked')) {
			obj.subscribeForums.push(arr.eq(i).attr('data-fid'));
		}
	}
	nkcAPI('/u/'+id+'/subscribe/register', 'POST', obj)
		.then(function(data) {
			screenTopAlert('提交成功');
			var url = data.url;
			setTimeout(function() {
				window.location.href = url;
			}, 1500);
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}