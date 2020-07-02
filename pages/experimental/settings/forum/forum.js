(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
var app = new Vue({
  el: '#app',
  data: {
    forumName: '',
    forums: data.forums,
    forumSettings: data.forumSettings
  },
  mounted: function mounted() {
    setTimeout(function () {
      floatForumPanel.initPanel();
    }, 500);
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    move: function move(index, direction) {
      if (index === 0 && direction === 'lefe' || index + 1 === this.forums.length && direction === 'right') return;
      var forum = this.forums[index];

      var _index;

      if (direction === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }

      var _forum = this.forums[_index];
      this.forums[_index] = forum;
      Vue.set(this.forums, index, _forum);
    },
    save: function save() {
      var fidArr = this.forums.map(function (f) {
        return f.fid;
      });
      nkcAPI('/e/settings/forum', 'PATCH', {
        fidArr: fidArr
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    },
    addForum: function addForum() {
      var forumName = this.forumName;
      Promise.resolve().then(function () {
        if (!forumName) throw '专业名称不能为空';
        return sweetQuestion("\u786E\u5B9A\u8981\u521B\u5EFA\u4E13\u4E1A\u300C".concat(forumName, "\u300D\u5417\uFF1F"));
      }).then(function () {
        return nkcAPI('/f', 'POST', {
          displayName: forumName
        });
      }).then(function (data) {
        sweetSuccess('创建成功，正在前往专业设置');
        setTimeout(function () {
          NKC.methods.visitUrl("/f/".concat(data.forum.fid, "/settings"));
        }, 2000);
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFNBQVMsRUFBRSxFQURQO0FBRUosSUFBQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BRlQ7QUFHSixJQUFBLGFBQWEsRUFBRSxJQUFJLENBQUM7QUFIaEIsR0FGWTtBQU9sQixFQUFBLE9BUGtCLHFCQU9SO0FBQ1IsSUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUEsZUFBZSxDQUFDLFNBQWhCO0FBQ0QsS0FGUyxFQUVQLEdBRk8sQ0FBVjtBQUdELEdBWGlCO0FBWWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxJQUZPLGdCQUVGLEtBRkUsRUFFSyxTQUZMLEVBRWdCO0FBQ3JCLFVBQ0csS0FBSyxLQUFLLENBQVYsSUFBZSxTQUFTLEtBQUssTUFBOUIsSUFDQyxLQUFLLEdBQUcsQ0FBUixLQUFjLEtBQUssTUFBTCxDQUFZLE1BQTFCLElBQW9DLFNBQVMsS0FBSyxPQUZyRCxFQUdFO0FBQ0YsVUFBTSxLQUFLLEdBQUcsS0FBSyxNQUFMLENBQVksS0FBWixDQUFkOztBQUNBLFVBQUksTUFBSjs7QUFDQSxVQUFHLFNBQVMsS0FBSyxNQUFqQixFQUF5QjtBQUN2QixRQUFBLE1BQU0sR0FBRyxLQUFLLEdBQUcsQ0FBakI7QUFDRCxPQUZELE1BRU87QUFDTCxRQUFBLE1BQU0sR0FBRyxLQUFLLEdBQUcsQ0FBakI7QUFDRDs7QUFDRCxVQUFNLE1BQU0sR0FBRyxLQUFLLE1BQUwsQ0FBWSxNQUFaLENBQWY7QUFDQSxXQUFLLE1BQUwsQ0FBWSxNQUFaLElBQXNCLEtBQXRCO0FBQ0EsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEtBQUssTUFBYixFQUFxQixLQUFyQixFQUE0QixNQUE1QjtBQUNELEtBakJNO0FBa0JQLElBQUEsSUFsQk8sa0JBa0JBO0FBQ0wsVUFBTSxNQUFNLEdBQUcsS0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxHQUFOO0FBQUEsT0FBakIsQ0FBZjtBQUNBLE1BQUEsTUFBTSxDQUFDLG1CQUFELEVBQXNCLE9BQXRCLEVBQStCO0FBQUMsUUFBQSxNQUFNLEVBQU47QUFBRCxPQUEvQixDQUFOLENBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQUhILFdBSVMsVUFKVDtBQUtELEtBekJNO0FBMEJQLElBQUEsUUExQk8sc0JBMEJJO0FBQ1QsVUFBTSxTQUFTLEdBQUcsS0FBSyxTQUF2QjtBQUNBLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFlBQUcsQ0FBQyxTQUFKLEVBQWUsTUFBTSxVQUFOO0FBQ2YsZUFBTyxhQUFhLDJEQUFZLFNBQVosd0JBQXBCO0FBQ0QsT0FKSCxFQUtHLElBTEgsQ0FLUSxZQUFNO0FBQ1YsZUFBTyxNQUFNLENBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZTtBQUFDLFVBQUEsV0FBVyxFQUFFO0FBQWQsU0FBZixDQUFiO0FBQ0QsT0FQSCxFQVFHLElBUkgsQ0FRUSxVQUFBLElBQUksRUFBSTtBQUNaLFFBQUEsWUFBWSxDQUFDLGVBQUQsQ0FBWjtBQUNBLFFBQUEsVUFBVSxDQUFDLFlBQU07QUFDZixVQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixjQUEyQixJQUFJLENBQUMsS0FBTCxDQUFXLEdBQXRDO0FBQ0QsU0FGUyxFQUVQLElBRk8sQ0FBVjtBQUdELE9BYkgsV0FjUyxVQWRUO0FBZUQ7QUEzQ007QUFaUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgZm9ydW1OYW1lOiAnJyxcclxuICAgIGZvcnVtczogZGF0YS5mb3J1bXMsXHJcbiAgICBmb3J1bVNldHRpbmdzOiBkYXRhLmZvcnVtU2V0dGluZ3MsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGZsb2F0Rm9ydW1QYW5lbC5pbml0UGFuZWwoKTtcclxuICAgIH0sIDUwMClcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgbW92ZShpbmRleCwgZGlyZWN0aW9uKSB7XHJcbiAgICAgIGlmKFxyXG4gICAgICAgIChpbmRleCA9PT0gMCAmJiBkaXJlY3Rpb24gPT09ICdsZWZlJykgfHxcclxuICAgICAgICAoaW5kZXggKyAxID09PSB0aGlzLmZvcnVtcy5sZW5ndGggJiYgZGlyZWN0aW9uID09PSAncmlnaHQnKVxyXG4gICAgICApIHJldHVybjtcclxuICAgICAgY29uc3QgZm9ydW0gPSB0aGlzLmZvcnVtc1tpbmRleF07XHJcbiAgICAgIGxldCBfaW5kZXg7XHJcbiAgICAgIGlmKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBfZm9ydW0gPSB0aGlzLmZvcnVtc1tfaW5kZXhdO1xyXG4gICAgICB0aGlzLmZvcnVtc1tfaW5kZXhdID0gZm9ydW07XHJcbiAgICAgIFZ1ZS5zZXQodGhpcy5mb3J1bXMsIGluZGV4LCBfZm9ydW0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IGZpZEFyciA9IHRoaXMuZm9ydW1zLm1hcChmID0+IGYuZmlkKTtcclxuICAgICAgbmtjQVBJKCcvZS9zZXR0aW5ncy9mb3J1bScsICdQQVRDSCcsIHtmaWRBcnJ9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW0oKSB7XHJcbiAgICAgIGNvbnN0IGZvcnVtTmFtZSA9IHRoaXMuZm9ydW1OYW1lO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFmb3J1bU5hbWUpIHRocm93ICfkuJPkuJrlkI3np7DkuI3og73kuLrnqbonO1xyXG4gICAgICAgICAgcmV0dXJuIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIm+W7uuS4k+S4muOAjCR7Zm9ydW1OYW1lfeOAjeWQl++8n2ApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2YnLCAnUE9TVCcsIHtkaXNwbGF5TmFtZTogZm9ydW1OYW1lfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfliJvlu7rmiJDlip/vvIzmraPlnKjliY3lvoDkuJPkuJrorr7nva4nKTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL2YvJHtkYXRhLmZvcnVtLmZpZH0vc2V0dGluZ3NgKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufSlcclxuXHJcbiJdfQ==
