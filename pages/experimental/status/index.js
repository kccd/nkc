function initTime() {
  $('.time').datetimepicker({
    language:  'zh-CN',
    format: 'yyyy-mm',
    autoclose: 1,
    todayHighlight: 1,
    startView: 4,
    minView: 3,
    forceParse: 0
  });
}

$(function() {
  initTime();
  getResults({type: 'today'});
  var radios = $('input:radio[name="statusType"]');
  radios.on('ifChanged', function() {
    for(var i = 0; i < radios.length; i ++) {
      var radio = radios.eq(i);
      if(radio.prop('checked')) {
        var type = radio.attr('data-type');
        getResults({type: type});
      }
    }
  });
});

/*$('input[name="statusType"]').iCheck({
  checkboxClass: 'icheckbox_minimal-red',
  radioClass: 'iradio_minimal-red',
});*/


function getResults(options) {
  var type = options.type;
  if(type === 'custom') {
    $('#custom').show();
  } else {
    $('#custom').hide();
    getData(type)
  }

}

function reset() {
  $('#custom input[name="time1"]').val('');
  $('#custom input[name="time2"]').val('');
}

function getData(type) {
  var url = '/e/status?type='+type;
  if(type === 'custom') {
    var time1 = $('#custom input[name="time1"]').val();
    var time2 = $('#custom input[name="time2"]').val();
    url = '/e/status?type='+type+'&time1='+time1+'&time2='+time2;
  }
  nkcAPI(url, 'GET', {})
    .then(function(data) {
      display(data.results);
    })
    .catch(function(data) {
      screenTopWarning(data.error|| data);
    })
}

function display(results) {


  var myChart = echarts.init(document.getElementById('main'));


  // 指定图表的配置项和数据
  var option = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data:['发表文章', '发表回复', '用户注册']
    },
    xAxis: {
      data: results.x
    },
    yAxis: {},
    series: [
      {
        name: '发表文章',
        type: 'line',
        stack: '发表文章',
        data: results.threadsData
      },
      {
        name: '发表回复',
        type: 'line',
        stack: '发表回复',
        data: results.postsData
      },
      {
        name: '用户注册',
        type: 'line',
        stack: '用户注册',
        data: results.usersData
      }
    ]
  };

  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

function getLogs() {
  nkcAPI("/e/status?type=logs", "GET")
    .then(function(data) {
      console.log(data);
    })
    .catch(function(data) {
      sweetError(data);
    })
}

Object.assign(window, {
  initTime,
  getResults,
  reset,
  getData,
  display,
  getLogs,
});