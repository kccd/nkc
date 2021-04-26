var data = NKC.methods.getDataById('data');
console.log(data);
renderData('subscriptionDom', data.subscriptions);
renderData('hitDom', data.hits);
renderData('voteUpDom', data.voteUp);
renderData('shareDom', data.share);


function renderData(domId, d) {
  var dom = document.getElementById(domId);
  dom.style.width = $(window).width();
  dom.style.height = '20rem';
  var chart = echarts.init(dom);
  var times = [];
  var seriesData = [];
  for(var i = 0; i < d.length; i++) {
    var s = d[i];
    times.push(s.time);
    seriesData.push(s.count);
  }
  var option = {
    toolbox: {
      show: true
    },
    tooltip: {
      trigger: 'axis'
    },
    title: {
      show: false,
      text: '订阅趋势'
    },
    xAxis: {
      type: 'category',
      data: times
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [{
      data: seriesData,
      type: 'line'
    }]
  };
  chart.setOption(option);
}