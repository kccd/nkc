$(function() {
  var forumsName = [], summaryData = [], colors = [];
  var data = [
    {
      color: "#f1d300",
      value: 234,
      forumName: "23",
    },
    {
      color: "#987812",
      value: 45,
      forumName: "30"
    }
  ];
  for(var i = 0; i < data.length; i++) {
    var f = data[i];
    forumsName.push(f.name);
    colors.push(f.color);
    summaryData.push({
      value: f.value,
      name: f.forumName + "("+f.value+"条)"
    });
  }
  var myChart = echarts.init(document.getElementById("summaryPie"));

// 指定图表的配置项和数据
  var option = {
    title : {
      text: '活跃领域',
      subtext: '根据用户发表的文章和回复统计',
      x:'left'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{b} : {d}%"
    },
    legend: {
      show: false,
      x : 'center',
      y : 'bottom',
      data: forumsName
    },
    color: colors,
    toolbox: {
      show : false,
      feature : {
        mark : {show: true},
        dataView : {show: true, readOnly: false},
        magicType : {
          show: true,
          type: ['pie', 'funnel']
        },
        restore : {show: true},
        saveAsImage : {show: true}
      }
    },
    calculable : true,
    series : [
      {
        name: '访问来源',
        type: 'pie',
        radius : '50%',
        center: ['50%', '60%'],
        data: summaryData,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
// 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
});