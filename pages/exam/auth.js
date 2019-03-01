var app = new Vue({
  el: '#app',
  data: {
    questions: [],
    question: null,
    auth: {
      status: true,
      reason: ''
    }
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    var questions = data.questions;
    for(var i = 0; i < questions.length; i++) {
      var a = questions[i];
      a.content_ = NKC.methods.custom_xss_process(NKC.methods.mdToHtml(a.content));
      a.ans_ = [];
      for(var j = 0; j < a.answer.length; j ++) {
        a.ans_[j] = NKC.methods.custom_xss_process(NKC.methods.mdToHtml(['A', 'B', 'C', 'D'][j] + '. ' + a.answer[j]));
      }
    }
    this.questions = questions;
  },
  methods: {
    format: NKC.methods.format,
    select: function(question) {
      this.question = question;
    },
    save: function() {
      var auth = this.auth;
      var status = ['true', true].indexOf(auth.status) !== -1;
      if(!status && auth.reason === '') return screenTopWarning('请输入原因');
      nkcAPI('/exam/auth', 'POST', {
        status: status,
        reason: auth.reason,
        qid: this.question._id
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    }
  }
})