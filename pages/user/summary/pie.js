NKC.modules.SummaryPie = function(dom) {
  var self = this;
  self.dom = $(dom);
  self.uid = self.dom.attr("data-uid");
  self.getData = function() {
    nkcAPI("/u/" + self.uid + "/profile/summary/pie", "GET")
      .then(function(data) {
        self.initEcharts(data.pie);
      })
      .catch(sweetError);
  };
  self.initEcharts = function(data) {
    var forumsName = [], summaryData = [], colors = [];
    for(var i = 0; i < data.length; i++) {
      var f = data[i];
      forumsName.push(f.forumName);
      colors.push(f.color);
      summaryData.push({
        value: f.count,
        name: f.forumName + "("+f.count+"条)"
      });
    }
    var myChart = echarts.init(self.dom[0]);
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
    myChart.setOption(option);
  };
  self.getData();
};