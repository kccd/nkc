$(function() {
  var option = {
    title: {
      left: 'left',
      subtext: '根据用户发表的文章和回复统计',
      text: '发表统计'
    },
    tooltip : {},
    visualMap: {
      min: 0,
      max: 10,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 65,
      /*inRange: {
        color: [
          'rgba(191, 68, 76, 1)',
          'rgba(191, 68, 76, 0.8)',
          'rgba(191, 68, 76, 0.6)',
          'rgba(191, 68, 76, 0.4)',
          'rgba(191, 68, 76, 0.2)'
        ],
      },*/
      textStyle: {
        color: '#000'
      }
    },
    calendar: {
      top: 120,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: '2016',
      /*splitLine: {
        show: false
      },*/
      dayLabel: {
        nameMap: "cn"
      },
      monthLabel: {
        nameMap: "cn"
      },
      itemStyle: {
        borderWidth: 1,
        // borderColor: "#eee",
      },
      yearLabel: {show: false}
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: getVirtulData(2016)
    }
  };
  var myChart = echarts.init(document.getElementById('summaryCalendar'));
  myChart.setOption(option);
});


function getVirtulData(year) {
    year = year || '2017';
    var date = +echarts.number.parseDate(year + '-01-01');
    var end = +echarts.number.parseDate((+year + 1) + '-01-01');
    var dayTime = 3600 * 24 * 1000;
    var data = [];
    for (var time = date; time < end; time += dayTime) {
        data.push([
            echarts.format.formatTime('yyyy-MM-dd', time),
            Math.floor(Math.random() * 10)
        ]);
    }
    return data;
}