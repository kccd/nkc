var app = new Vue({
  el: '#app',
  data: {
    editor: false,
    question: {},
    questions: [],
    category: {},
    categories: []
  },
  mounted: function() {
    var url = window.location.pathname;
    kcAPI(url, 'GET', {})
      .then(function(data) {
        app.category = data.category;
        app.questions = data.questions;
        app.categories = data.categories;
      })
      .catch(function(err) {
        screenTopWarning(err);
      });
    // this.displayEditor();
  },
  methods: {
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    visitSettings: function(c) {
      window.location.href = '/e/settings/exam?cid=' + c._id;
    },
    displayEditor: function(q) {
      if(q) {
        var arr = [];
        for(var i = 0; i < q.answer.length; i++) {
          arr.push({
            text: q.answer[i]
          });
        }
        q.arr = arr;
        this.question = q;
      } else {
        this.question = {
          type: 'ch4',
          baseUrl: '',
          volume: 'A',
          cid: app.category._id,
          answer: ['', '', '', ''],
          arr: [
            {
              text: ''
            },
            {
              text: ''
            },
            {
              text: ''
            },
            {
              text: ''
            }
          ]
        };
      }
      this.editor = true;
    },
    addWrongAnswer: function() {
      this.question.arr.push({
        text: ''
      })
    },
    removeAnswer: function(a) {
      var arr = this.question.arr;
      var index = arr.indexOf(a);
      if(index === -1) return;
      arr.splice(index, 1);
    },
    clickInput: function() {
      app.$refs.input.click();
    },
    inputChange: function(e) {
      var input = e.target;
      var file = input.files?input.files[0]:'';
      if(!file) return;
      this.question.file = file;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        app.question.baseUrl = this.result;
        Vue.set(app.questions, app.questions.indexOf(app.question), app.question)
      };
    },
    save: function() {
      var question = this.question;
      if(!question.content) return screenTopWarning('请输入题目内容');
      if(question.type === 'ch4') {
        if(question.arr.length !== 4) return screenTopWarning('单项选择题答案个数错误');
        for(var i = 0; i < question.arr.length; i++) {
          var a = question.arr[i];
          if(!a.text) return screenTopWarning('答案不能为空');
          question.answer[i] = a.text;
        }
      } else {
        if(!question.arr[0].text) return screenTopWarning('答案不能为空');
        question.answer = [question.arr[0].text];
      }
      var formData = new FormData();
      if(question.file) {
        formData.append('file', question.file);
      }
      var q = JSON.parse(JSON.stringify(question));
      delete q.file;
      delete q.baseUrl;
      delete q.arr;
      delete q.user;
      var url = '/exam/category/' + this.category._id;
      var method = 'POST';
      if(q._id) {
        url = '/exam/question/' + q._id;
        method = 'PATCH';
      }
      formData.append('question', JSON.stringify(q));
      uploadFileAPI(url, method, formData, function(e) {
        console.log(e);
      })
        .then(function(data) {
          var newQuestion = data.question;
          if(q._id) {
            for(var i = 0 ; i < app.questions.length; i++) {
              if(app.questions[i]._id === newQuestion._id) {
                if(app.category._id !== newQuestion.cid) {
                  app.questions.splice(i, 1);
                } else {
                  newQuestion.t = Date.now();
                  app.questions[i] = newQuestion;
                }
                break;
              }
            }
          } else {
            app.questions.unshift(newQuestion);
          }
          app.editor = false;
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    removeImage: function() {
      delete this.question.file;
      delete this.question.baseUrl;
      this.question.hasImage = false;
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
    }
  }
});
