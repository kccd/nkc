var app = new Vue({
  el: '#app',
  data: {
    postSettings: '',
    roles: [],
    grades: [],
    type: 'postToForum'
  },
  methods: {
    save: function() {
      var results = this.postSettings[this.type];
      var exam_ = results.exam;
      results.authLevel = Number(results.authLevel);
      if(authLevel < 0 || authLevel > 3) return screenTopWarning('认证等级设置错误: ' + results.authLevel);
      results.exam = {
        volumeA: exam_.indexOf('volumeA') !== -1,
        volumeB: exam_.indexOf('volumeA') !== -1,
        notPass: {
          status: exam_.indexOf('notPass') !== -1,
          unlimited: results.examCountLimit.unlimited,
          countLimit: results.examCountLimit.countLimit
        }
      };
      var obj = {
        roles: app.roles,
        grades: app.grades
      };
      obj[this.type] = results;
      nkcAPI('/e/settings/post', 'PATCH', obj)
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  },
  computed: {
    displayNotPassCountLimit: function() {
      return this.postSettings[this.type].exam.indexOf('notPass') !== -1;
    }
  },
  mounted: function() {
    nkcAPI('/e/settings/post', 'GET', {})
      .then(function(data) {
        app.roles = data.roles;
        app.grades = data.grades;
        var examArr = [];
        var exam = data.postSettings.c.postToForum.exam;
        if(exam.volumeA) {
          examArr.push('volumeA');
        }
        if(exam.volumeB) {
          examArr.push('volumeB');
        }
        if(exam.notPass.status) {
          examArr.push('notPass');
        }
        data.postSettings.c.postToForum.examCountLimit = exam.notPass;
        data.postSettings.c.postToForum.exam = examArr;

        examArr = [];
        exam = data.postSettings.c.postToThread.exam;
        if(exam.volumeA) {
          examArr.push('volumeA');
        }
        if(exam.volumeB) {
          examArr.push('volumeB');
        }
        if(exam.notPass.status) {
          examArr.push('notPass');
        }
        data.postSettings.c.postToThread.examCountLimit = exam.notPass;
        data.postSettings.c.postToThread.exam = examArr;

        app.postSettings = data.postSettings.c;
      })
      .catch(function(data) {
        screenTopWarning(data.error || data);
      });
  }
});
