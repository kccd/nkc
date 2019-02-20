var app = new Vue({
  el: '#app',
  data: {
    submitted: false,
    submitting: '',
    question: {
      type: 'ch4',
      public: false,
      hasImage: false,
      volume: 'A',
      content: '',
      forum: '',
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
      ]
    },
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    if(data.question) {
      this.extendAnswers(data.question);
      if(data.question.public) {
        data.question.forum = '';
      }
      this.question = data.question;
    }
    vueSelectForum.init({
      func:this.selectedForum
    });
  },
  methods: {
    showSelectForumPanel: function() {
      vueSelectForum.app.show();
    },
    selectedForum: function(forum) {
      this.question.forum = forum;
    },
    extendAnswers: function(question) {
      if(question.type === 'ans') {
        return question.answerObj = [{text: question.answer[0]}]
      };
      var answer = question.answer;
      var answerObj = [];
      for(var i = 0; i < answer.length; i++) {
        answerObj.push({
          text: answer[i]
        });
      }
      question.answerObj = answerObj;
    },
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
      if(question.public === 'true' || question.public === true) {
        question.public = true;
      } else {
        question.public = false;
      }
      if(!question.public) {
        if(!question.forum) return screenTopWarning('请选择专业领域');
        question.fid = question.forum.fid;
      }
      if (!question.content) return screenTopWarning('请输入题目内容');
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
      delete q.forum;
      delete q.answerObj;
      var url = '/exam/question';
      var method = 'POST';
      if (q._id && q.auth === null) {
        url = '/exam/question/' + q._id;
        method = 'PATCH';
      }
      formData.append('question', JSON.stringify(q));
      submitting = '提交中';
      uploadFilePromise(url, formData, function (e) {
        var num = ((e.loaded/e.total)*100).toFixed(2);
        if(num > 100) num = 100;
        app.submitting = '提交中... ' + num + '%';
      }, method)
        .then(function () {
          window.location.href = '/exam/record/question';
          /* if(question._id) {
            window.location.href = '/exam/category/' + question.cid;
          } else {
            app.submitted = true;
          } */
        })
        .catch(function (data) {
          screenTopWarning(data);
          /* screenTopWarning(data);
          app.submitting = '提交'; */
        })
    }
  }
});