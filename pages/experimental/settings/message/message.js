var app = new Vue({
  el: '#app',
  data: {
    type: "limit", // template, limit
    messageSettings: "",
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
      nkcAPI("/e/settings/message", "PUT", {
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
        grades: app.grades,
        type: "modifySendLimit"
      };
      obj.messageSettings = this.messageSettings;
      if(!obj.messageSettings.systemLimitInfo ||!obj.messageSettings.customizeLimitInfo || !obj.messageSettings.mandatoryLimitInfo) return screenTopWarning("请输入受限提示");
      nkcAPI('/e/settings/message', 'PUT', obj)
        .then(function() {
          screenTopAlert('保存成功');
        })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    this.messageTypesLanguage = data.messageTypesLanguage;
    this.grades = data.grades;
    this.roles = data.roles;
    this.messageTypes = data.messageTypes;
    this.messageSettings = data.messageSettings;
    if(this.messageTypes.length > 0) {
      this.selectedMessageType = this.messageTypes[0];
    }
  }
});
