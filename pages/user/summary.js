$(function() {
  var userPostSummary = NKC.methods.getDataById("userSummaryData").userPostSummary;
  if(!userPostSummary) return;
  var forumsName = [], summaryData = [], colors = [];

  for(var i = 0; i < userPostSummary.length; i++) {
    var forum = userPostSummary[i];
    forumsName.push(forum.forumName);
    colors.push(forum.color);
    summaryData.push({
      value: forum.count,
      name: forum.forumName + "("+forum.count+"条)"
    });
  }
  var myChart = echarts.init(document.getElementById('user_summary'));

// 指定图表的配置项和数据
  option = {
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

