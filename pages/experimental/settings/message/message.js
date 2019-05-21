var app = new Vue({
  el: '#app',
  data: {
    type: "template", // template, limit
    messageTypes: [],
    selectedMessageType: "",
    messageTypesLanguage: {},
    roles: [],
    grades: []
  },
  methods: {
    lang: function(k) {
      return this.messageTypesLanguage[k] || k;
    },
    submit: function() {
      var obj = {
        roles: app.roles,
        grades: app.grades
      };
      nkcAPI('/e/settings/message', 'PATCH', obj)
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  },
  mounted: function() {
    var data = getDataById("data");
    this.messageTypesLanguage = data.messageTypesLanguage;
    this.grades = data.grades;
    this.roles = data.roles;
    this.messageTypes = data.messageTypes;
    if(this.messageTypes.length > 0) {
      this.selectedMessageType = this.messageTypes[0];
    }
  }
});
