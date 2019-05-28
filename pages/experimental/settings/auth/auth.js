var data = getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    authSettings: data.authSettings,
    certs: data.certs,
    selectCertId: "",
    error: "",
    info: "",
    auditorIdStr: data.authSettings.auditorId.join(", ")
  },
  mounted: function() {
    if(this.certs.length > 0) {
      this.selectCertId = this.certs[0]._id;
    }
  },
  computed: {
    certsObj: function() {
      var obj = {};
      for(var i = 0; i < this.certs.length; i++) {
        var cert = this.certs[i];
        obj[cert._id] = cert;
      }
      return obj;
    },
    selectedCerts: function() {
      var certsId = this.authSettings.auditorCerts;
      var arr = [];
      for(var i = 0; i < certsId.length; i++) {
        var certId = certsId[i];
        var cert = this.certsObj[certId];
        if(cert) arr.push(cert);
      }
      return arr;
    }
  },
  methods: {
    addCert:function() {
      if(this.authSettings.auditorCerts.indexOf(this.selectCertId) === -1) {
        this.authSettings.auditorCerts.push(this.selectCertId);
      }
    },
    removeCert: function(id) {
      var index = this.authSettings.auditorCerts.indexOf(id);
      if(index !== -1) {
        this.authSettings.auditorCerts.splice(index, 1);
      }
    },
    save: function() {
      var auditorIdStr = this.auditorIdStr;
      var arr = auditorIdStr.split(",");
      var auditorId = [];
      for(var i = 0; i < arr.length; i++) {
        var id = arr[i];
        id = id.trim();
        auditorId.push(id);
      }
      this.authSettings.auditorId = auditorId;
      nkcAPI("/e/settings/auth", "PATCH", {
        authSettings: this.authSettings
      })
        .then(function() {
          app.info = "保存成功";
        })
        .catch(function(data) {
          app.error = data.error;
        })
    }
  }
});