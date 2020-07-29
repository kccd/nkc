(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
var app = new Vue({
  el: '#app',
  data: {
    forumName: '',
    forums: data.forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories
  },
  mounted: function mounted() {
    setTimeout(function () {
      floatForumPanel.initPanel();
    }, 500);
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    move: function move(index, arr, direction) {
      if (index === 0 && direction === 'left' || index + 1 === arr.length && direction === 'right') return;
      var forum = arr[index];

      var _index;

      if (direction === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }

      var _forum = arr[_index];
      arr[_index] = forum;
      Vue.set(arr, index, _forum);
    },
    save: function save() {
      var fidArr = this.forums.map(function (f) {
        return f.fid;
      });
      var forumCategories = this.forumCategories;
      var checkString = NKC.methods.checkData.checkString;
      Promise.resolve().then(function () {
        var _iterator = _createForOfIteratorHelper(forumCategories),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var fc = _step.value;
            checkString(fc.name, {
              name: '分类名',
              minLength: 1,
              maxLength: 20
            });
            checkString(fc.description, {
              name: '分类介绍',
              minLength: 0,
              maxLength: 100
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return nkcAPI('/e/settings/forum', 'PUT', {
          fidArr: fidArr,
          categories: forumCategories
        });
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    },
    addForum: function addForum() {
      var forumName = this.forumName;
      var self = this;
      Promise.resolve().then(function () {
        if (!forumName) throw '专业名称不能为空';
        return sweetQuestion("\u786E\u5B9A\u8981\u521B\u5EFA\u4E13\u4E1A\u300C".concat(forumName, "\u300D\u5417\uFF1F"));
      }).then(function () {
        return nkcAPI('/f', 'POST', {
          displayName: forumName
        });
      }).then(function (data) {
        sweetSuccess('创建成功'); // self.forums = data.forums;
      })["catch"](sweetError);
    },
    addForumCategory: function addForumCategory() {
      this.forumCategories.push({
        name: '',
        description: '',
        displayStyle: 'simple'
      });
    },
    remove: function remove(index, arr) {
      arr.splice(index, 1);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFNBQVMsRUFBRSxFQURQO0FBRUosSUFBQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BRlQ7QUFHSixJQUFBLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFIaEI7QUFJSixJQUFBLGVBQWUsRUFBRSxJQUFJLENBQUM7QUFKbEIsR0FGWTtBQVFsQixFQUFBLE9BUmtCLHFCQVFSO0FBQ1IsSUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUEsZUFBZSxDQUFDLFNBQWhCO0FBQ0QsS0FGUyxFQUVQLEdBRk8sQ0FBVjtBQUdELEdBWmlCO0FBYWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxJQUZPLGdCQUVGLEtBRkUsRUFFSyxHQUZMLEVBRVUsU0FGVixFQUVxQjtBQUMxQixVQUNHLEtBQUssS0FBSyxDQUFWLElBQWUsU0FBUyxLQUFLLE1BQTlCLElBQ0MsS0FBSyxHQUFHLENBQVIsS0FBYyxHQUFHLENBQUMsTUFBbEIsSUFBNEIsU0FBUyxLQUFLLE9BRjdDLEVBR0U7QUFDRixVQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBRCxDQUFqQjs7QUFDQSxVQUFJLE1BQUo7O0FBQ0EsVUFBRyxTQUFTLEtBQUssTUFBakIsRUFBeUI7QUFDdkIsUUFBQSxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsUUFBQSxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQWpCO0FBQ0Q7O0FBQ0QsVUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQUQsQ0FBbEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxNQUFELENBQUgsR0FBYyxLQUFkO0FBQ0EsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEdBQVIsRUFBYSxLQUFiLEVBQW9CLE1BQXBCO0FBQ0QsS0FqQk07QUFrQlAsSUFBQSxJQWxCTyxrQkFrQkE7QUFDTCxVQUFNLE1BQU0sR0FBRyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLEdBQU47QUFBQSxPQUFqQixDQUFmO0FBREssVUFFRSxlQUZGLEdBRXFCLElBRnJCLENBRUUsZUFGRjtBQUFBLFVBR0UsV0FIRixHQUdpQixHQUFHLENBQUMsT0FBSixDQUFZLFNBSDdCLENBR0UsV0FIRjtBQUlMLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUFBLG1EQUNNLGVBRE47QUFBQTs7QUFBQTtBQUNWLDhEQUFpQztBQUFBLGdCQUF2QixFQUF1QjtBQUMvQixZQUFBLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSixFQUFVO0FBQ25CLGNBQUEsSUFBSSxFQUFFLEtBRGE7QUFFbkIsY0FBQSxTQUFTLEVBQUUsQ0FGUTtBQUduQixjQUFBLFNBQVMsRUFBRTtBQUhRLGFBQVYsQ0FBWDtBQUtBLFlBQUEsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFKLEVBQWlCO0FBQzFCLGNBQUEsSUFBSSxFQUFFLE1BRG9CO0FBRTFCLGNBQUEsU0FBUyxFQUFFLENBRmU7QUFHMUIsY0FBQSxTQUFTLEVBQUU7QUFIZSxhQUFqQixDQUFYO0FBS0Q7QUFaUztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWFWLGVBQU8sTUFBTSxDQUFDLG1CQUFELEVBQXNCLEtBQXRCLEVBQTZCO0FBQUMsVUFBQSxNQUFNLEVBQU4sTUFBRDtBQUFTLFVBQUEsVUFBVSxFQUFFO0FBQXJCLFNBQTdCLENBQWI7QUFDRCxPQWZILEVBZ0JHLElBaEJILENBZ0JRLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQWxCSCxXQW1CUyxVQW5CVDtBQW9CRCxLQTFDTTtBQTJDUCxJQUFBLFFBM0NPLHNCQTJDSTtBQUNULFVBQU0sU0FBUyxHQUFHLEtBQUssU0FBdkI7QUFDQSxVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxPQUFPLENBQUMsT0FBUixHQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsWUFBRyxDQUFDLFNBQUosRUFBZSxNQUFNLFVBQU47QUFDZixlQUFPLGFBQWEsMkRBQVksU0FBWix3QkFBcEI7QUFDRCxPQUpILEVBS0csSUFMSCxDQUtRLFlBQU07QUFDVixlQUFPLE1BQU0sQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlO0FBQUMsVUFBQSxXQUFXLEVBQUU7QUFBZCxTQUFmLENBQWI7QUFDRCxPQVBILEVBUUcsSUFSSCxDQVFRLFVBQUEsSUFBSSxFQUFJO0FBQ1osUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaLENBRFksQ0FFWjtBQUNELE9BWEgsV0FZUyxVQVpUO0FBYUQsS0EzRE07QUE0RFAsSUFBQSxnQkE1RE8sOEJBNERZO0FBQ2pCLFdBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQjtBQUN4QixRQUFBLElBQUksRUFBRSxFQURrQjtBQUV4QixRQUFBLFdBQVcsRUFBRSxFQUZXO0FBR3hCLFFBQUEsWUFBWSxFQUFFO0FBSFUsT0FBMUI7QUFLRCxLQWxFTTtBQW1FUCxJQUFBLE1BbkVPLGtCQW1FQSxLQW5FQSxFQW1FTyxHQW5FUCxFQW1FWTtBQUNqQixNQUFBLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBWCxFQUFrQixDQUFsQjtBQUNEO0FBckVNO0FBYlMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGZvcnVtTmFtZTogJycsXHJcbiAgICBmb3J1bXM6IGRhdGEuZm9ydW1zLFxyXG4gICAgZm9ydW1TZXR0aW5nczogZGF0YS5mb3J1bVNldHRpbmdzLFxyXG4gICAgZm9ydW1DYXRlZ29yaWVzOiBkYXRhLmZvcnVtQ2F0ZWdvcmllcyxcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgZmxvYXRGb3J1bVBhbmVsLmluaXRQYW5lbCgpO1xyXG4gICAgfSwgNTAwKVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBtb3ZlKGluZGV4LCBhcnIsIGRpcmVjdGlvbikge1xyXG4gICAgICBpZihcclxuICAgICAgICAoaW5kZXggPT09IDAgJiYgZGlyZWN0aW9uID09PSAnbGVmdCcpIHx8XHJcbiAgICAgICAgKGluZGV4ICsgMSA9PT0gYXJyLmxlbmd0aCAmJiBkaXJlY3Rpb24gPT09ICdyaWdodCcpXHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBmb3J1bSA9IGFycltpbmRleF07XHJcbiAgICAgIGxldCBfaW5kZXg7XHJcbiAgICAgIGlmKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBfZm9ydW0gPSBhcnJbX2luZGV4XTtcclxuICAgICAgYXJyW19pbmRleF0gPSBmb3J1bTtcclxuICAgICAgVnVlLnNldChhcnIsIGluZGV4LCBfZm9ydW0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IGZpZEFyciA9IHRoaXMuZm9ydW1zLm1hcChmID0+IGYuZmlkKTtcclxuICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCB7Y2hlY2tTdHJpbmd9ID0gTktDLm1ldGhvZHMuY2hlY2tEYXRhO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGZvcihjb25zdCBmYyBvZiBmb3J1bUNhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcoZmMubmFtZSwge1xyXG4gICAgICAgICAgICAgIG5hbWU6ICfliIbnsbvlkI0nLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDIwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhmYy5kZXNjcmlwdGlvbiwge1xyXG4gICAgICAgICAgICAgIG5hbWU6ICfliIbnsbvku4vnu40nLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBua2NBUEkoJy9lL3NldHRpbmdzL2ZvcnVtJywgJ1BVVCcsIHtmaWRBcnIsIGNhdGVnb3JpZXM6IGZvcnVtQ2F0ZWdvcmllc30pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bSgpIHtcclxuICAgICAgY29uc3QgZm9ydW1OYW1lID0gdGhpcy5mb3J1bU5hbWU7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFmb3J1bU5hbWUpIHRocm93ICfkuJPkuJrlkI3np7DkuI3og73kuLrnqbonO1xyXG4gICAgICAgICAgcmV0dXJuIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIm+W7uuS4k+S4muOAjCR7Zm9ydW1OYW1lfeOAjeWQl++8n2ApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2YnLCAnUE9TVCcsIHtkaXNwbGF5TmFtZTogZm9ydW1OYW1lfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfliJvlu7rmiJDlip8nKTtcclxuICAgICAgICAgIC8vIHNlbGYuZm9ydW1zID0gZGF0YS5mb3J1bXM7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW1DYXRlZ29yeSgpIHtcclxuICAgICAgdGhpcy5mb3J1bUNhdGVnb3JpZXMucHVzaCh7XHJcbiAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGRpc3BsYXlTdHlsZTogJ3NpbXBsZSdcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlKGluZGV4LCBhcnIpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIl19
