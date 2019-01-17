var markdown = window.markdownit();

var xss = window.filterXSS;
var default_whitelist = xss.whiteList;
default_whitelist.img = ['src','style'];

var xssoptions = {
  whiteList:default_whitelist,
  onTagAttr: function(tag, name, value, isWhiteAttr) {
    if(isWhiteAttr) {
      if(tag === 'a' && name === 'href') {
        var valueHandled = value.replace('javascript:', '');
        return "href=" + valueHandled;
      }
    }
  }
};

var custom_xss = new xss.FilterXSS(xssoptions);
var custom_xss_process = function(str){
  return custom_xss.process(str)
};

function mdToHtml(md) {
  return markdown.render(md);
}
var app = new Vue({
  el: '#app',
  data: {
    submitted: false,
    passed: '',
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
    },
    submit: function() {
      for(var i = 0; i < this.questions.length; i++) {
        var answer = this.questions[i].answer;
        if(typeof answer === 'undefined') {
          if(confirm('您还有未作答的题目，确认要提交试卷吗？') === false)  {
            return;
          }
          break;
        }
      }
      this.submitted = true;
      kcAPI('/exam/paper/' + app.paper._id, 'post', {questions: this.questions})
        .then(function(data) {
          app.passed = data.passed;
        })
        .catch(function(data) {
          screenTopWarning(data);
          app.submitted = false;
        });
    }
  },
  mounted: function() {
    kcAPI(window.location.href, 'GET', {})
      .then(function(data) {
        app.paper = data.paper;
        app.category = data.category;
        var questions = data.questions;
        for(var i = 0; i < questions.length; i++) {
          var a = questions[i];
          a.content_ = custom_xss_process(mdToHtml(i+1+'、'+a.content));
          a.ans_ = [];
          for(var j = 0; j < a.ans.length; j ++) {
            a.ans_[j] = custom_xss_process(mdToHtml(['A', 'B', 'C', 'D'][j] + '. ' + a.ans[j]));
          }
        }
        app.questions = questions;
        setInterval(function() {
          app.compute();
        }, 500);
      })
      .catch(function(err) {
        screenTopWarning(err);
      });
  }
});