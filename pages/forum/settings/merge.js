(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
var moveThread = new NKC.modules.MoveThread();
var app = new Vue({
  el: '#app',
  data: {
    forum: data.forum,
    targetForum: null,
    submitting: false
  },
  methods: {
    selectForum: function selectForum() {
      var self = this;
      moveThread.open(function (data) {
        self.targetForum = data.originForums[0];
        moveThread.close();
      }, {
        hideMoveType: true,
        forumCountLimit: 1
      });
    },
    submit: function submit() {
      var self = this;
      self.submitting = true;
      Promise.resolve().then(function () {
        if (!self.targetForum) {
          throw '请选择目标专业';
        }

        return nkcAPI("/f/".concat(self.forum.fid, "/settings/merge"), 'PUT', {
          targetForumId: self.targetForum.fid
        });
      }).then(function () {
        sweetSuccess('合并成功，正在前往目标专业...');
        NKC.methods.visitUrl("/f/".concat(self.targetForum.fid), false);
      })["catch"](sweetError)["finally"](function () {
        self.submitting = false;
      });
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2ZvcnVtL3NldHRpbmdzL21lcmdlLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFBaEIsRUFBbkI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBRFI7QUFFSixJQUFBLFdBQVcsRUFBRSxJQUZUO0FBR0osSUFBQSxVQUFVLEVBQUU7QUFIUixHQUZZO0FBT2xCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxXQURPLHlCQUNPO0FBQ1osVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsVUFBQSxJQUFJLEVBQUk7QUFDdEIsUUFBQSxJQUFJLENBQUMsV0FBTCxHQUFtQixJQUFJLENBQUMsWUFBTCxDQUFrQixDQUFsQixDQUFuQjtBQUNBLFFBQUEsVUFBVSxDQUFDLEtBQVg7QUFDRCxPQUhELEVBR0c7QUFDRCxRQUFBLFlBQVksRUFBRSxJQURiO0FBRUQsUUFBQSxlQUFlLEVBQUU7QUFGaEIsT0FISDtBQU9ELEtBVk07QUFXUCxJQUFBLE1BWE8sb0JBV0U7QUFDUCxVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxJQUFJLENBQUMsVUFBTCxHQUFrQixJQUFsQjtBQUNBLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFlBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVCxFQUFzQjtBQUNwQixnQkFBTSxTQUFOO0FBQ0Q7O0FBQ0QsZUFBTyxNQUFNLGNBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFsQixzQkFBd0MsS0FBeEMsRUFBK0M7QUFBQyxVQUFBLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBTCxDQUFpQjtBQUFqQyxTQUEvQyxDQUFiO0FBQ0QsT0FOSCxFQU9HLElBUEgsQ0FPUSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsa0JBQUQsQ0FBWjtBQUNBLFFBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLGNBQTJCLElBQUksQ0FBQyxXQUFMLENBQWlCLEdBQTVDLEdBQW1ELEtBQW5EO0FBQ0QsT0FWSCxXQVdTLFVBWFQsYUFZVyxZQUFNO0FBQ2IsUUFBQSxJQUFJLENBQUMsVUFBTCxHQUFrQixLQUFsQjtBQUNELE9BZEg7QUFlRDtBQTdCTTtBQVBTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBtb3ZlVGhyZWFkID0gbmV3IE5LQy5tb2R1bGVzLk1vdmVUaHJlYWQoKTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bTogZGF0YS5mb3J1bSxcclxuICAgIHRhcmdldEZvcnVtOiBudWxsLFxyXG4gICAgc3VibWl0dGluZzogZmFsc2VcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHNlbGVjdEZvcnVtKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgbW92ZVRocmVhZC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHNlbGYudGFyZ2V0Rm9ydW0gPSBkYXRhLm9yaWdpbkZvcnVtc1swXTtcclxuICAgICAgICBtb3ZlVGhyZWFkLmNsb3NlKCk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBoaWRlTW92ZVR5cGU6IHRydWUsXHJcbiAgICAgICAgZm9ydW1Db3VudExpbWl0OiAxLFxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHNlbGYuc3VibWl0dGluZyA9IHRydWU7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIXNlbGYudGFyZ2V0Rm9ydW0pIHtcclxuICAgICAgICAgICAgdGhyb3cgJ+ivt+mAieaLqeebruagh+S4k+S4mic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvZi8ke3NlbGYuZm9ydW0uZmlkfS9zZXR0aW5ncy9tZXJnZWAsICdQVVQnLCB7dGFyZ2V0Rm9ydW1JZDogc2VsZi50YXJnZXRGb3J1bS5maWR9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5ZCI5bm25oiQ5Yqf77yM5q2j5Zyo5YmN5b6A55uu5qCH5LiT5LiaLi4uJyk7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL2YvJHtzZWxmLnRhcmdldEZvcnVtLmZpZH1gLCBmYWxzZSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnN1Ym1pdHRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl19
