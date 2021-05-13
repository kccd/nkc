var data = NKC.methods.getDataById('data');
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

window.app = new Vue({
  el: '#threadList',
  data: {
    columnId: data.column._id,
    sort: 'hit', // hit, postCount, voteUp
    columnPosts: [],
    nav: [
      {
        type: 'hit',
        name: '阅读量'
      },
      {
        type: 'postCount',
        name: '回复数'
      },
      {
        type: 'voteUp',
        name: '点赞数'
      }
    ],
    paging: {
      page: 0,
      buttonValue: []
    },
  },
  mounted: function() {
    this.getPosts();
  },
  methods: {
    briefNumber: NKC.methods.tools.briefNumber,
    selectPage: function(t, page) {
      if(t === 'null') return;
      this.getPosts(page);
    },
    getPosts: function(page) {
      var self = this;
      if(page === undefined) page = this.paging.page;
      var url = '/m/' + this.columnId + '/status?sort=' + this.sort + '&page=' + page;
      nkcAPI(url, 'GET')
        .then(function(data) {
          self.columnPosts= data.columnPosts;
          self.paging = data.paging;
        })
        .catch(function(err) {
          sweetError(err);
        })
    },
    switchSort: function(t) {
      this.sort = t;
      this.getPosts(0);
    }
  }
})