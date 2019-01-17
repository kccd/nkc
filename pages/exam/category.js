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
    editor: false,
    displayFilter: false,
    filter: ['A', 'B', 'enabled', 'disabled','authNull', 'authFalse', 'authTrue'],
    question: {},
    questions: [],
    category: {},
    categories: [],
    paging: {}
  },
  watch: {
    filter: function() {
      /*var qs = this.questions;
      var filter = this.filter;
      for(var i = 0; i < qs.length; i++) {
        var q = qs[i];
        q.hide = true;
        if(filter.indexOf(q.volume) === -1) continue;
        if((q.disabled && filter.indexOf('disabled') === -1) || (!q.disabled && filter.indexOf('enabled') === -1)) continue;
        if((q.auth === true && filter.indexOf('authTrue') === -1) ||
          (q.auth === false && filter.indexOf('authFalse') === -1) ||
          (q.auth === null && filter.indexOf('authNull') === -1)
        ) continue;
        q.hide = false;
      }*/
    }
  },
  updated: function() {
    NKC.methods.renderFormula();
  },
  mounted: function() {
    var url = window.location.pathname;
    kcAPI(url, 'GET', {})
      .then(function(data) {
        app.questions = app.extendQuestions(data.questions);
        app.categories = data.categories;
        app.category = data.category;
        app.paging = NKC.methods.paging(data.paging);
      })
      .catch(function(err) {
        screenTopWarning(err);
      });
    // this.displayEditor();
  },
  methods: {
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    extendQuestions: function(questions) {
      for(var i = 0; i < questions.length; i++) {
        var a = questions[i];
        a.content_ = custom_xss_process(mdToHtml(a.content));
        a.answer_ = [];
        for(var j = 0; j < a.answer.length; j ++) {
          if(a.type === 'ch4') {
            a.answer_[j] = custom_xss_process(mdToHtml(['A', 'B', 'C', 'D'][j] + '. ' + a.answer[j]));
          } else {
            a.answer_[j] = custom_xss_process(mdToHtml(a.answer[j]));
          }
        }
      }
      return questions;
    },
    toPage: function(page) {
      var options = {
        volume: [],
        disabled: [],
        auth: []
      };
      var filter = this.filter;
      if(filter.indexOf('A') !== -1) {
        options.volume.push('A');
      }
      if(filter.indexOf('B') !== -1) {
        options.volume.push('B');
      }
      if(filter.indexOf('enabled') !== -1) {
        options.disabled.push(false);
      }
      if(filter.indexOf('disabled') !== -1) {
        options.disabled.push(true);
      }
      if(filter.indexOf('authNull') !== -1) {
        options.auth.push(null);
      }
      if(filter.indexOf('authTrue') !== -1) {
        options.auth.push(true);
      }
      if(filter.indexOf('authFalse') !== -1) {
        options.auth.push(false);
      }
      var data = {
        page: page,
        options: JSON.stringify(options)
      };
      kcAPI(window.location.pathname, 'GET', data)
        .then(function(data) {
          app.questions = app.extendQuestions(data.questions);
          app.paging = NKC.methods.paging(data.paging);
          NKC.methods.scrollToTop(0)
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    toEditor: function(q) {
      if(q && q._id) {
        window.location.href = '/exam/editor?qid=' + q._id;
      } else if(this.category) {
        window.location.href = '/exam/editor?cid=' + this.category._id;
      }
    },
    visitSettings: function(c) {
      window.location.href = '/e/settings/exam?cid=' + c._id;
    },
    disabledQuestion: function(q, type) {
      var url = '/exam/question/' + q._id + '/disabled';
      var method = 'POST';
      if(!type) {
        method = 'DELETE';
      }
      kcAPI(url, method, {})
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data.error);
        })
    },
    filterFunc: function() {
      this.displayFilter = !this.displayFilter;
    }
  }
});
