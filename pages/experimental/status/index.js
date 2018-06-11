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

$(function() {
	initTime();
	if($('#main').length !== 0) {
		display();
	}
	getResults({type: 'today'});
});

$('input[name="statusType"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
	radioClass: 'iradio_minimal-red',
});


function getResults(options) {
	var type = options.type;
	if(type === 'custom') {
		return;
	}
	nkcAPI('/e/status?type='+type, 'GET', {})
		.then(function(data) {
			console.log(data);
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}




function display() {
	var myChart = echarts.init(document.getElementById('main'));

	// 指定图表的配置项和数据
	var option = {
		title: {
			text: '网站统计'
		},
		tooltip: {},
		legend: {
			data:['发表文章', '发表回复', '用户注册']
		},
		xAxis: {
			data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
		},
		yAxis: {},
		series: [
			{
			name: '发表文章',
			type: 'line',
			data: [5, 20, 36, 10, 10, 20]
			},
			{
				name: '发表回复',
				type: 'line',
				data: [533, 30, 32, 45, 4, 6]
			},
			{
				name: '用户注册',
				type: 'line',
				data: [23, 3, 54, 2, 32, 32]
			}
		]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
}
