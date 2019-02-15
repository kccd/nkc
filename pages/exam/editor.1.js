var defaultQuestion = {
  volume: 'A',
  type: 'ch4',
  content: '',
  answer: [],
  answerObj: [
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
  ],
  baseUrl: ''
};
var app = new Vue({
  el: '#app',
  data: {
    submitted: false,
    submitting: '',
    cid: '',
    auth: null,
    categories: [],
    question: JSON.parse(JSON.stringify(defaultQuestion))
  },
  mounted: function() {
    var url = window.location.href;
    if(url.indexOf('?') !== -1) {
      url += '&t=' + Date.now();
    } else {
      url += '?t=' + Date.now();
    }
    kcAPI(url, 'get', {})
      .then(function(data) {
        app.categories = data.categories;
        if(data.question) {
          app.question = data.question;
          app.auth = data.question.auth;
          app.question.answerObj = [];
          for(var i = 0; i < app.question.answer.length; i++) {
            app.question.answerObj.push({
              text: app.question.answer[i]
            });
          }
          if(app.question.answerObj.length === 1) {
            for(var i = 0; i < 3; i++) {
              app.question.answerObj.push({text: ''})
            }
          }
        } else {
          if(data.cid) {
            for(var i = 0; i < app.categories.length; i++) {
              if(data.cid === app.categories[i]._id) {
                app.question.cid = data.cid;
                continue;
              }
            }
          }
        }
      })
      .catch(function(data) {
        screenTopWarning(data);
      })
  },
  methods: {
    reset: function() {
      this.question = JSON.parse(JSON.stringify(defaultQuestion));
      this.submitting = '';
      this.submitted = false;
    },
    removeImage: function() {
      this.question.file = '';
      this.question.baseUrl = '';
      delete this.question.file;
      delete this.question.baseUrl;
      this.question.hasImage = false;
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
        Vue.set(app.question, 'baseUrl', this.result);
      };
    },
    save: function() {
      var question = this.question;
      if (!question.cid) return screenTopWarning('请选择试题所属科目');
      if (!question.content) return screenTopWarning('请输入题目内容');
      if(app.auth === 'true' || app.auth === true) question.auth = true;
      if(app.auth === 'false' || app.auth === false) question.auth = false;
      if (question.type === 'ch4') {
        if (question.answerObj.length !== 4) return screenTopWarning('单项选择题答案个数错误');
        for (var i = 0; i < question.answerObj.length; i++) {
          var a = question.answerObj[i];
          if (!a.text) return screenTopWarning('答案不能为空');
          question.answer[i] = a.text;
        }
      } else {
        if (!question.answerObj[0].text) return screenTopWarning('答案不能为空');
        question.answer = [question.answerObj[0].text];
      }
      var formData = new FormData();
      if (question.file) {
        formData.append('file', question.file);
      }
      var q = JSON.parse(JSON.stringify(question));
      delete q.file;
      delete q.baseUrl;
      delete q.arr;
      delete q.user;
      var url = '/exam/category/' + question.cid;
      var method = 'POST';
      if (q._id) {
        url = '/exam/question/' + q._id;
        method = 'PATCH';
      }
      formData.append('question', JSON.stringify(q));
      submitting = '提交中';
      uploadFileAPI(url, method, formData, function (e) {
        var num = ((e.loaded/e.total)*100).toFixed(2);
        if(num > 100) num = 100;
        app.submitting = '提交中... ' + num + '%';
      })
        .then(function () {
          if(question._id) {
            window.location.href = '/exam/category/' + question.cid;
          } else {
            app.submitted = true;
          }
        })
        .catch(function (data) {
          screenTopWarning(data);
          app.submitting = '提交';
        })
    }
  }
});