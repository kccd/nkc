$('#timepicker').datetimepicker({
	language:  'zh-CN',
	format: 'yyyy-mm-dd',
	autoclose: 1,
	todayHighlight: 1,
	startView: 4,
	minView: 2,
	forceParse: 0
});


$.getJSON('/bootstrap/js/lib/sql_areas.json',function(data){
	for (var i = 0; i < data.length; i++) {
		var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
		data[i] = area;
	}
	$('.bs-chinese-region').chineseRegion('source',data);
});