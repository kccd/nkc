(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: '#app',
  data: {
    content: '',
    tUid: data.tUid,
    submitted: false
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    submit: function submit() {
      var content = this.content,
          checkString = this.checkString,
          tUid = this.tUid;
      var self = this;
      Promise.resolve().then(function () {
        checkString(content, {
          name: '验证信息',
          min: 0,
          max: 1000
        });
        return nkcAPI("/u/".concat(tUid, "/friends"), 'POST', {
          description: content
        }).then(function () {
          NKC.methods.appToast('发送成功');
          self.submitted = true;
        })["catch"](NKC.methods.appToast);
      });
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL21lc3NhZ2UvYXBwQWRkRnJpZW5kL2FwcEFkZEZyaWVuZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsT0FBTyxFQUFFLEVBREw7QUFFSixJQUFBLElBQUksRUFBRSxJQUFJLENBQUMsSUFGUDtBQUdKLElBQUEsU0FBUyxFQUFFO0FBSFAsR0FGWTtBQU9sQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQUQ1QjtBQUVQLElBQUEsTUFGTyxvQkFFRTtBQUFBLFVBQ0EsT0FEQSxHQUM4QixJQUQ5QixDQUNBLE9BREE7QUFBQSxVQUNTLFdBRFQsR0FDOEIsSUFEOUIsQ0FDUyxXQURUO0FBQUEsVUFDc0IsSUFEdEIsR0FDOEIsSUFEOUIsQ0FDc0IsSUFEdEI7QUFFUCxVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxPQUFPLENBQUMsT0FBUixHQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBQSxXQUFXLENBQUMsT0FBRCxFQUFVO0FBQ25CLFVBQUEsSUFBSSxFQUFFLE1BRGE7QUFFbkIsVUFBQSxHQUFHLEVBQUUsQ0FGYztBQUduQixVQUFBLEdBQUcsRUFBRTtBQUhjLFNBQVYsQ0FBWDtBQUtBLGVBQU8sTUFBTSxjQUFPLElBQVAsZUFBdUIsTUFBdkIsRUFBK0I7QUFDMUMsVUFBQSxXQUFXLEVBQUU7QUFENkIsU0FBL0IsQ0FBTixDQUdKLElBSEksQ0FHQyxZQUFNO0FBQ1YsVUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosQ0FBcUIsTUFBckI7QUFDQSxVQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0QsU0FOSSxXQU9FLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFQZCxDQUFQO0FBUUQsT0FmSDtBQWdCRDtBQXJCTTtBQVBTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgY29udGVudDogJycsXHJcbiAgICB0VWlkOiBkYXRhLnRVaWQsXHJcbiAgICBzdWJtaXR0ZWQ6IGZhbHNlLFxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qge2NvbnRlbnQsIGNoZWNrU3RyaW5nLCB0VWlkfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNoZWNrU3RyaW5nKGNvbnRlbnQsIHtcclxuICAgICAgICAgICAgbmFtZTogJ+mqjOivgeS/oeaBrycsXHJcbiAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgbWF4OiAxMDAwXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC91LyR7dFVpZH0vZnJpZW5kc2AsICdQT1NUJywge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogY29udGVudFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIE5LQy5tZXRob2RzLmFwcFRvYXN0KCflj5HpgIHmiJDlip8nKTtcclxuICAgICAgICAgICAgICBzZWxmLnN1Ym1pdHRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChOS0MubWV0aG9kcy5hcHBUb2FzdClcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl19
