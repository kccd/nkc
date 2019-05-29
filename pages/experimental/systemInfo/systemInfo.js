var app;
$(function() {
  app = new Vue({
    el: '#app',
    data: {
      text: '',
      submitted: false,
      systemInfo: []
    },
    mounted: function() {
      var data = getDataById("data");
      for(var i = 0; i < data.systemInfo.length; i++) {
        data.systemInfo[i].modify = false;
      }
      this.systemInfo = data.systemInfo;
    },
    methods: {
      format: NKC.methods.format,
      strToHTML: NKC.methods.strToHTML,
      save: function(l) {
        nkcAPI("/e/systemInfo", "PATCH", {
          _id: l._id,
          c: l.c
        })
          .then(function() {
            l.modify = false;
            screenTopAlert("保存成功");
          })
          .catch(function(data){
            screenTopWarning(data);
          })
      },
      submit: function() {
        if(app.submitted) return;
        app.submitted = true;
        if(app.text === '') {
          return screenTopWarning('内容不能为空');
        }
        var obj = {
          content: app.text
        };
        nkcAPI('/e/systemInfo', 'POST', obj)
          .then(function() {
            app.text = '';
            app.submitted = false;
            screenTopAlert('发送成功');
          })
          .catch(function(data) {
            app.submitted = false;
            screenTopWarning(data.error || data);
          })
      }
    }
  })
});