var app = new Vue({
  el: '#app',
  data: {
    paper: '',
    category: '',
    questions: [],
    countdown: '',
    timeOut: false
  },
  methods: {
    format: NKC.methods.format,
    compute: function() {
      var toc = this.paper.toc;
      var time = Date.now() - new Date(toc).getTime();
      time = this.category['paper' + this.paper.volume + 'Time']*60*1000 - time;
      var minutes = Math.floor(time/(1000*60));
      var seconds = Math.floor((time - minutes*60*1000)/1000);
      if(minutes < 10) minutes = '0' + minutes;
      if(seconds < 10) seconds = '0' + seconds;
      this.countdown = minutes + ' 分钟 ' + seconds + ' 秒 ';
    }
  },
  mounted: function() {
    kcAPI(window.location.href, 'GET', {})
      .then(function(data) {
        app.paper = data.paper;
        app.category = data.category;
        app.questions = data.questions;
        setInterval(function() {
          app.compute();
        }, 500);
      })
      .catch(function(err) {
        screenTopWarning(err);
      })
  }
});