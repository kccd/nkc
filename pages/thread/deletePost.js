(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

;

(function () {
  if (!NKC) return;
  if (!NKC.methods) return;

  function deletePost(postId) {
    sweetQuestion("你确定要删除吗？").then(function () {
      return nkcAPI("/p/".concat(postId, "/delete"), "GET");
    }).then(function (res) {
      console.log(res);
    });
  }

  ;
  NKC.methods.deletePost = deletePost;
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy90aHJlYWQvZGVsZXRlUG9zdC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOztBQUFFLGFBQVU7QUFDVixNQUFHLENBQUMsR0FBSixFQUFTO0FBQ1QsTUFBRyxDQUFDLEdBQUcsQ0FBQyxPQUFSLEVBQWlCOztBQUVqQixXQUFTLFVBQVQsQ0FBb0IsTUFBcEIsRUFBNEI7QUFDMUIsSUFBQSxhQUFhLENBQUMsVUFBRCxDQUFiLENBQ0csSUFESCxDQUNRO0FBQUEsYUFBTSxNQUFNLGNBQU8sTUFBUCxjQUF3QixLQUF4QixDQUFaO0FBQUEsS0FEUixFQUVHLElBRkgsQ0FFUSxVQUFBLEdBQUcsRUFBSTtBQUNYLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBQ0QsS0FKSDtBQUtEOztBQUFBO0FBRUQsRUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLFVBQVosR0FBeUIsVUFBekI7QUFDRCxDQWJDLEdBQUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCI7KGZ1bmN0aW9uKCl7XHJcbiAgaWYoIU5LQykgcmV0dXJuO1xyXG4gIGlmKCFOS0MubWV0aG9kcykgcmV0dXJuO1xyXG5cclxuICBmdW5jdGlvbiBkZWxldGVQb3N0KHBvc3RJZCkge1xyXG4gICAgc3dlZXRRdWVzdGlvbihcIuS9oOehruWumuimgeWIoOmZpOWQl++8n1wiKVxyXG4gICAgICAudGhlbigoKSA9PiBua2NBUEkoYC9wLyR7cG9zdElkfS9kZWxldGVgLCBcIkdFVFwiKSlcclxuICAgICAgLnRoZW4ocmVzID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICB9KVxyXG4gIH07XHJcblxyXG4gIE5LQy5tZXRob2RzLmRlbGV0ZVBvc3QgPSBkZWxldGVQb3N0O1xyXG59KCkpOyJdfQ==
