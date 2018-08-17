var app;
$(function() {
  app = new Vue({
    el: '#app',
    data: {
      text: '',
      submitted: false
    },
    methods: {
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
            screenTopAlert('发送成功');
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      }
    }
  })
});