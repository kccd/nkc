(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var dialog = new NKC.modules.ReviewForumInfo();
new Vue({
  el: "#app",
  data: {
    pForums: data.pForums || []
  },
  methods: {
    // 打开详细信息的模态框
    review: function review(index) {
      var forum = this.pForums[index];
      dialog.open(forum);
    },
    // 点击uid复制
    copyUID: function copyUID(_ref) {
      var target = _ref.target;
      var textNode = target.childNodes[0];
      var range = document.createRange();
      range.setStart(textNode, 1);
      range.setEnd(textNode, textNode.textContent.length - 1);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
    },
    timeFormat: NKC.methods.timeFormat
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvcmV2aWV3Rm9ydW0vcmV2aWV3Rm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBWDtBQUNBLElBQUksTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxlQUFoQixFQUFiO0FBRUEsSUFBSSxHQUFKLENBQVE7QUFDTixFQUFBLEVBQUUsRUFBRSxNQURFO0FBRU4sRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTCxJQUFnQjtBQURyQixHQUZBO0FBS04sRUFBQSxPQUFPLEVBQUU7QUFDUDtBQUNBLElBQUEsTUFGTyxrQkFFQSxLQUZBLEVBRU87QUFDWixVQUFJLEtBQUssR0FBRyxLQUFLLE9BQUwsQ0FBYSxLQUFiLENBQVo7QUFDQSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtBQUNELEtBTE07QUFNUDtBQUNBLElBQUEsT0FQTyx5QkFPVztBQUFBLFVBQVQsTUFBUyxRQUFULE1BQVM7QUFDaEIsVUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsQ0FBbEIsQ0FBZjtBQUNBLFVBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFULEVBQVo7QUFDQSxNQUFBLEtBQUssQ0FBQyxRQUFOLENBQWUsUUFBZixFQUF5QixDQUF6QjtBQUNBLE1BQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFiLEVBQXVCLFFBQVEsQ0FBQyxXQUFULENBQXFCLE1BQXJCLEdBQThCLENBQXJEO0FBQ0EsVUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVAsRUFBaEI7QUFDQSxNQUFBLFNBQVMsQ0FBQyxlQUFWO0FBQ0EsTUFBQSxTQUFTLENBQUMsUUFBVixDQUFtQixLQUFuQjtBQUNBLE1BQUEsUUFBUSxDQUFDLFdBQVQsQ0FBcUIsTUFBckI7QUFDRCxLQWhCTTtBQWlCUCxJQUFBLFVBQVUsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZO0FBakJqQjtBQUxILENBQVIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxubGV0IGRpYWxvZyA9IG5ldyBOS0MubW9kdWxlcy5SZXZpZXdGb3J1bUluZm8oKTtcclxuXHJcbm5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICBwRm9ydW1zOiBkYXRhLnBGb3J1bXMgfHwgW11cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIC8vIOaJk+W8gOivpue7huS/oeaBr+eahOaooeaAgeahhlxyXG4gICAgcmV2aWV3KGluZGV4KSB7XHJcbiAgICAgIGxldCBmb3J1bSA9IHRoaXMucEZvcnVtc1tpbmRleF07XHJcbiAgICAgIGRpYWxvZy5vcGVuKGZvcnVtKTtcclxuICAgIH0sXHJcbiAgICAvLyDngrnlh7t1aWTlpI3liLZcclxuICAgIGNvcHlVSUQoe3RhcmdldH0pIHtcclxuICAgICAgbGV0IHRleHROb2RlID0gdGFyZ2V0LmNoaWxkTm9kZXNbMF07XHJcbiAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLnNldFN0YXJ0KHRleHROb2RlLCAxKTtcclxuICAgICAgcmFuZ2Uuc2V0RW5kKHRleHROb2RlLCB0ZXh0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAxKTtcclxuICAgICAgbGV0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xyXG4gICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XHJcbiAgICB9LFxyXG4gICAgdGltZUZvcm1hdDogTktDLm1ldGhvZHMudGltZUZvcm1hdFxyXG4gIH1cclxufSk7Il19
