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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9mb3J1bS9zZXR0aW5ncy9tZXJnZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFVBQWhCLEVBQW5CO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQURSO0FBRUosSUFBQSxXQUFXLEVBQUUsSUFGVDtBQUdKLElBQUEsVUFBVSxFQUFFO0FBSFIsR0FGWTtBQU9sQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsV0FETyx5QkFDTztBQUNaLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxNQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFVBQUEsSUFBSSxFQUFJO0FBQ3RCLFFBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsQ0FBbEIsQ0FBbkI7QUFDQSxRQUFBLFVBQVUsQ0FBQyxLQUFYO0FBQ0QsT0FIRCxFQUdHO0FBQ0QsUUFBQSxZQUFZLEVBQUUsSUFEYjtBQUVELFFBQUEsZUFBZSxFQUFFO0FBRmhCLE9BSEg7QUFPRCxLQVZNO0FBV1AsSUFBQSxNQVhPLG9CQVdFO0FBQ1AsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsSUFBSSxDQUFDLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxNQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQ0csSUFESCxDQUNRLFlBQU07QUFDVixZQUFHLENBQUMsSUFBSSxDQUFDLFdBQVQsRUFBc0I7QUFDcEIsZ0JBQU0sU0FBTjtBQUNEOztBQUNELGVBQU8sTUFBTSxjQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBbEIsc0JBQXdDLEtBQXhDLEVBQStDO0FBQUMsVUFBQSxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQUwsQ0FBaUI7QUFBakMsU0FBL0MsQ0FBYjtBQUNELE9BTkgsRUFPRyxJQVBILENBT1EsWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLGtCQUFELENBQVo7QUFDQSxRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixjQUEyQixJQUFJLENBQUMsV0FBTCxDQUFpQixHQUE1QyxHQUFtRCxLQUFuRDtBQUNELE9BVkgsV0FXUyxVQVhULGFBWVcsWUFBTTtBQUNiLFFBQUEsSUFBSSxDQUFDLFVBQUwsR0FBa0IsS0FBbEI7QUFDRCxPQWRIO0FBZUQ7QUE3Qk07QUFQUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuY29uc3QgbW92ZVRocmVhZCA9IG5ldyBOS0MubW9kdWxlcy5Nb3ZlVGhyZWFkKCk7XHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgZm9ydW06IGRhdGEuZm9ydW0sXHJcbiAgICB0YXJnZXRGb3J1bTogbnVsbCxcclxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBzZWxlY3RGb3J1bSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIG1vdmVUaHJlYWQub3BlbihkYXRhID0+IHtcclxuICAgICAgICBzZWxmLnRhcmdldEZvcnVtID0gZGF0YS5vcmlnaW5Gb3J1bXNbMF07XHJcbiAgICAgICAgbW92ZVRocmVhZC5jbG9zZSgpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgaGlkZU1vdmVUeXBlOiB0cnVlLFxyXG4gICAgICAgIGZvcnVtQ291bnRMaW1pdDogMSxcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBzdWJtaXQoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzZWxmLnN1Ym1pdHRpbmcgPSB0cnVlO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFzZWxmLnRhcmdldEZvcnVtKSB7XHJcbiAgICAgICAgICAgIHRocm93ICfor7fpgInmi6nnm67moIfkuJPkuJonO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL2YvJHtzZWxmLmZvcnVtLmZpZH0vc2V0dGluZ3MvbWVyZ2VgLCAnUFVUJywge3RhcmdldEZvcnVtSWQ6IHNlbGYudGFyZ2V0Rm9ydW0uZmlkfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+WQiOW5tuaIkOWKn++8jOato+WcqOWJjeW+gOebruagh+S4k+S4mi4uLicpO1xyXG4gICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9mLyR7c2VsZi50YXJnZXRGb3J1bS5maWR9YCwgZmFsc2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5zdWJtaXR0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdfQ==
