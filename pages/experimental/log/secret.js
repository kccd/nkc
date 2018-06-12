function initTime() {
	$('.time').datetimepicker({
		language:  'zh-CN',
		format: 'yyyy-mm-dd',
		autoclose: 1,
		todayHighlight: 1,
		startView: 4,
		minView: 2,
		forceParse: 0
	});
}