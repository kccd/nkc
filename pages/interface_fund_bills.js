function submit(id) {
	var time = $('#time').val();
	if(!time) return screenTopWarning('请选择时间。');
	time = new Date(time).getTime();
	var money = $('#money').val();
	if(!money) return screenTopWarning('请输入金额。');
	var abstract = $('#abstract').val();
	if(!abstract) return screenTopWarning('请输入摘要。');
	var notes = $('#notes').val();
	if(!notes) return screenTopWarning('请输入备注。');
	var bill = {
		toc: time,
		changed: money,
		abstract: abstract,
		notes: notes
	};
	nkcAPI('/fund/list/'+id+'/bills', 'POST', {bill: bill})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}