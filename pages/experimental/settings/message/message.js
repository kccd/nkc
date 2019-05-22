var app = new Vue({
  el: '#app',
  data: {
    type: "template", // template, limit
    messageTypes: [],
    selectedMessageType: "",
    messageTypesLanguage: {},
    roles: [],
    grades: [],

    error: "",
    info: ""
  },
  methods: {
    lang: function(k) {
      return this.messageTypesLanguage[k] || k;
    },
    selectType: function(type) {
      this.selectedMessageType = type;
      this.clearErrorInfo();
    },
    clearErrorInfo: function() {
      this.error = "";
      this.info = "";
    },
    save: function(type) {
      this.clearErrorInfo();
      nkcAPI("/e/settings/message", "PATCH", {
        type: "modifyMessageType",
        messageType: type
      })
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
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
