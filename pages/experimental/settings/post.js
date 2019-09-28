var app = new Vue({
  el: '#app',
  data: {
    postSettings: '',
    roles: [],
    grades: [],
    uid: "",
    users: [],
    type: 'postToForum'
  },
  methods: {
    addUser: function(type) {
      var uid = this.uid;
      var this_ = this;
      nkcAPI("/u/" + uid + "?from=panel", "GET")
        .then(function(data) {
          var targetUser = data.targetUser;
          if(targetUser) {
            this_.users.push(targetUser);
            var uidArr = this_.postSettings[this_.type][type].uid;
            if(uidArr.indexOf(targetUser.uid) === -1) {
              uidArr.push(targetUser.uid);
            }

          }
        })
        .catch(function(err) {
          sweetError(err);
        })
    },
    getUserById: function(uid) {
      var users = this.users;
      for(var i = 0; i < users.length; i++) {
        var user = users[i];
        if(user.uid === uid) return user;
      }
    },
    removeUser: function(index, type) {
      this.postSettings[this.type][type].uid.splice(index, 1);
    },
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
      results_.exam = {
        volumeA: exam.indexOf('volumeA') !== -1,
        volumeB: exam.indexOf('volumeB') !== -1,
        notPass: {
          status: exam.indexOf('notPass') !== -1,
          unlimited: [true, 'true'].indexOf(results_.examCountLimit.unlimited) !== -1,
          countLimit: Number(results_.examCountLimit.countLimit)
        }
      };
      var obj = {
        roles: app.roles,
        grades: app.grades
      };
      delete results_.examCountLimit;
      delete results_.authLevel;
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
    defaultRole: function() {
      var roles = this.roles;
      for(var i = 0; i < roles.length; i++) {
        if(roles[i]._id === "default") return roles[i];
      }
    },
    displayNotPassCountLimit: function() {
      return this.postSettings[this.type].exam.indexOf('notPass') !== -1;
    },
    selectedUsers: function() {
      var uid = this.postSettings[this.type].anonymous.uid;
      var users = [];
      for(var i = 0; i < uid.length; i++) {
        var id = uid[i];
        var user = this.getUserById(id);
        if(user) users.push(user);
      }
      return users;
    },
    selectedUsersSurvey: function() {
      var uid = this.postSettings[this.type].survey.uid;
      var users = [];
      for(var i = 0; i < uid.length; i++) {
        var id = uid[i];
        var user = this.getUserById(id);
        if(user) users.push(user);
      }
      return users;
    }
  },
  mounted: function() {
    nkcAPI('/e/settings/post?t=' + Date.now(), 'GET', {})
      .then(function(data) {
        app.roles = data.roles;
        app.grades = data.grades;
        app.users = data.users;
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
