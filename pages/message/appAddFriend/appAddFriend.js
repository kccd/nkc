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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9tZXNzYWdlL2FwcEFkZEZyaWVuZC9hcHBBZGRGcmllbmQubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE9BQU8sRUFBRSxFQURMO0FBRUosSUFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBRlA7QUFHSixJQUFBLFNBQVMsRUFBRTtBQUhQLEdBRlk7QUFPbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLFdBQVcsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQVosQ0FBc0IsV0FENUI7QUFFUCxJQUFBLE1BRk8sb0JBRUU7QUFBQSxVQUNBLE9BREEsR0FDOEIsSUFEOUIsQ0FDQSxPQURBO0FBQUEsVUFDUyxXQURULEdBQzhCLElBRDlCLENBQ1MsV0FEVDtBQUFBLFVBQ3NCLElBRHRCLEdBQzhCLElBRDlCLENBQ3NCLElBRHRCO0FBRVAsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsV0FBVyxDQUFDLE9BQUQsRUFBVTtBQUNuQixVQUFBLElBQUksRUFBRSxNQURhO0FBRW5CLFVBQUEsR0FBRyxFQUFFLENBRmM7QUFHbkIsVUFBQSxHQUFHLEVBQUU7QUFIYyxTQUFWLENBQVg7QUFLQSxlQUFPLE1BQU0sY0FBTyxJQUFQLGVBQXVCLE1BQXZCLEVBQStCO0FBQzFDLFVBQUEsV0FBVyxFQUFFO0FBRDZCLFNBQS9CLENBQU4sQ0FHSixJQUhJLENBR0MsWUFBTTtBQUNWLFVBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLENBQXFCLE1BQXJCO0FBQ0EsVUFBQSxJQUFJLENBQUMsU0FBTCxHQUFpQixJQUFqQjtBQUNELFNBTkksV0FPRSxHQUFHLENBQUMsT0FBSixDQUFZLFFBUGQsQ0FBUDtBQVFELE9BZkg7QUFnQkQ7QUFyQk07QUFQUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGNvbnRlbnQ6ICcnLFxyXG4gICAgdFVpZDogZGF0YS50VWlkLFxyXG4gICAgc3VibWl0dGVkOiBmYWxzZSxcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICBzdWJtaXQoKSB7XHJcbiAgICAgIGNvbnN0IHtjb250ZW50LCBjaGVja1N0cmluZywgdFVpZH0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBjaGVja1N0cmluZyhjb250ZW50LCB7XHJcbiAgICAgICAgICAgIG5hbWU6ICfpqozor4Hkv6Hmga8nLFxyXG4gICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgIG1heDogMTAwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvdS8ke3RVaWR9L2ZyaWVuZHNgLCAnUE9TVCcsIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGNvbnRlbnRcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBOS0MubWV0aG9kcy5hcHBUb2FzdCgn5Y+R6YCB5oiQ5YqfJyk7XHJcbiAgICAgICAgICAgICAgc2VsZi5zdWJtaXR0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goTktDLm1ldGhvZHMuYXBwVG9hc3QpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdfQ==
