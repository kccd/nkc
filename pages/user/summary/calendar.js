NKC.modules.SummaryCalender = function(dom, year) {
  var self = this;
  self.dom = $(dom);
  self.uid = self.dom.attr("data-uid");
  self.initSelect = false;
  self.createYearList = function(toc) {
    if(self.initSelect) return;
    var registerYear = new Date(toc).getFullYear();
    var nowYear = new Date().getFullYear();
    var select = $("<select onchange='console.log(this)'></select>");
    for(var i = registerYear; i <= nowYear; i++) {
      var option = $("<option value='"+i+"'>"+i+"</option>");
      select.append(option);
    }
    self.dom.append(select);
    self.initSelect = true;
  };
  self.setYear = function(year) {
    self.year = year || new Date().getFullYear();
    self.begin = (new Date(self.year + "-1-1 00:00:00")).getTime();
    self.end = (new Date((self.year + 1) + "-1-1 00:00:00")).getTime();
    self.getData();
  };
  self.getData = function() {
    nkcAPI("/u/" + self.uid + "/profile/summary/calendar?year=" + self.year, "GET")
      .then(function(data) {
        self.initEcharts(data.posts);
        self.createYearList(data.user.toc);
      })
      .catch(sweetError);
  };
  self.initEcharts = function(data) {
    var times = {};
    for(var i = self.begin; i < self.end ; i = i + 24*60*60*1000) {
      times[NKC.methods.format("YYYY-MM-DD", i)] = 0;
    }
    for(var i = 0; i < data.length; i++) {
      var t = data[i].toc;
      times[NKC.methods.format("YYYY-MM-DD", t)] ++;
    }
    data = [];
    var max = 0;
    for(var i in times) {
      if(!times.hasOwnProperty(i)) continue;
      if(times[i] > max) max = times[i];
      data.push([
        i, times[i]
      ]);
    }
    var maxMap = Math.ceil((max - 1)/5) * 5 + 1;
    var option = {
      title: {
        left: 'left',
        subtext: '根据用户发表的文章和回复统计',
        text: self.year + '年发表统计'
      },
      tooltip : {},
      visualMap: [
        {
          type: "piecewise",
          pieces: [
            {
              min: 1,
              max: 1
            },
            {
              min: 2,
              max: 3
            },
            {
              min: 4,
              max: 6
            },
            {
              min: 7,
              max: 10
            },
          ]
        }
      ],
      /*visualMap: {
        min: 1,
        max: maxMap,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        top: 65,
        /!*inRange: {
          color: [
            'rgba(191, 68, 76, 1)',
            'rgba(191, 68, 76, 0.8)',
            'rgba(191, 68, 76, 0.6)',
            'rgba(191, 68, 76, 0.4)',
            'rgba(191, 68, 76, 0.2)'
          ],
        },*!/
        textStyle: {
          color: '#000'
        }
      },*/
      calendar: {
        top: 120,
        left: 30,
        right: 30,
        cellSize: ['auto', 13],
        range: self.year,
        /*splitLine: {
          show: false
        },*/
        dayLabel: {
          nameMap: "cn"
        },
        monthLabel: {
          nameMap: "cn"
        },
        splitLine: {
          lineStyle: {
            color: "#bbb",
            width: 2
          }
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: "#fff",
          color: "#f5f5f5"
        },
        yearLabel: {show: false}
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data
      }
    };
    var myChart = echarts.init(self.dom[0]);
    myChart.setOption(option);
  };
  self.setYear(year);
};
/*
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
      /!*inRange: {
        color: [
          'rgba(191, 68, 76, 1)',
          'rgba(191, 68, 76, 0.8)',
          'rgba(191, 68, 76, 0.6)',
          'rgba(191, 68, 76, 0.4)',
          'rgba(191, 68, 76, 0.2)'
        ],
      },*!/
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
      /!*splitLine: {
        show: false
      },*!/
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
  var myChart = echarts.init(document.getElementsByClassName('summary-calendar')[0]);
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

console.log(getVirtulData(2019))*/
