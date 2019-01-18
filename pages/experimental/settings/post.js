var app = new Vue({
  el: '#app',
  data: {
    postSettings: '',
    roles: [],
    grades: [],
    type: 'postToForum'
  },
  methods: {
    extendVolume: function() {
      var exam = this.postSettings[this.type].exam;
      if(exam.indexOf('notPass') !== -1) {
        if(exam.indexOf('volumeA') === -1) exam.push('volumeA');
        if(exam.indexOf('volumeB') === -1) exam.push('volumeB');
      } else if(exam.indexOf('volumeA') !== -1) {
        if(exam.indexOf('volumeB') === -1) exam.push('volumeB');
      }
    },
    save: function() {
      var results = this.postSettings[this.type];
      var results_ = JSON.parse(JSON.stringify(results));
      var exam = results_.exam;
      results_.authLevel = Number(results_.authLevel);
      if(results_.authLevel < 0 || results_.authLevel > 3) return screenTopWarning('认证等级设置错误: ' + results_.authLevel);
      results_.exam = {
        volumeA: exam.indexOf('volumeA') !== -1,
        volumeB: exam.indexOf('volumeB') !== -1,
        notPass: {
          status: exam.indexOf('notPass') !== -1,
          unlimited: results_.examCountLimit.unlimited,
          countLimit: results_.examCountLimit.countLimit
        }
      };
      var obj = {
        roles: app.roles,
        grades: app.grades
      };
      obj[this.type] = results_;
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
    nkcAPI('/e/settings/post?t=' + Date.now(), 'GET', {})
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
