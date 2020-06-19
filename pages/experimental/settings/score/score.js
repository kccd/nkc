(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function saveNumberSettings() {
  var coefficients = {
    postToForum: $('#postToForum').val(),
    postToThread: $('#postToThread').val(),
    digest: $('#digest').val(),
    digestPost: $('#digestPost').val(),
    dailyLogin: $('#dailyLogin').val(),
    xsf: $('#xsf').val(),
    thumbsUp: $('#thumbsUp').val(),
    violation: $('#violation').val()
  };
  nkcAPI('/e/settings/number', 'PATCH', {
    coefficients: coefficients
  }).then(function () {
    screenTopAlert('保存成功');
  })["catch"](function (data) {
    screenTopWarning(data.error || data);
  });
}

function updateFormula() {
  var dailyLogin = $('#dailyLogin').val();
  var postToForum = $('#postToForum').val();
  var postToThread = $('#postToThread').val();
  var digest = $('#digest').val();
  var digestPost_ = $('#digestPost').val();
  var thumbsUp = $('#thumbsUp').val();
  var violation = $('#violation').val();
  var xsf = $('#xsf').val();
  var text = '公式：(在线天数 x ' + dailyLogin + ') + ' + '(文章数 x ' + postToForum + ') + (' + '回复数 x ' + postToThread + ') + (' + '精选文章数 x ' + digest + ') + (' + '精选回复数 x ' + digestPost_ + ') + (' + '被点赞数^(1/2) x ' + thumbsUp + ') + (' + '学术分 x ' + xsf + ') + (' + '违规数 x ' + violation + ')';
  $('#formula').text(text);
}

$(function () {
  updateFormula();
  $('.formula input').on('input', function () {
    updateFormula();
  });
});
var data = NKC.methods.getDataById('data');
var app = new Vue({
  el: '#app',
  data: {},
  methods: {}
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxTQUFTLGtCQUFULEdBQThCO0FBQzVCLE1BQUksWUFBWSxHQUFHO0FBQ2pCLElBQUEsV0FBVyxFQUFFLENBQUMsQ0FBQyxjQUFELENBQUQsQ0FBa0IsR0FBbEIsRUFESTtBQUVqQixJQUFBLFlBQVksRUFBRSxDQUFDLENBQUMsZUFBRCxDQUFELENBQW1CLEdBQW5CLEVBRkc7QUFHakIsSUFBQSxNQUFNLEVBQUUsQ0FBQyxDQUFDLFNBQUQsQ0FBRCxDQUFhLEdBQWIsRUFIUztBQUlqQixJQUFBLFVBQVUsRUFBRSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLEdBQWpCLEVBSks7QUFLakIsSUFBQSxVQUFVLEVBQUUsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixHQUFqQixFQUxLO0FBTWpCLElBQUEsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFELENBQUQsQ0FBVSxHQUFWLEVBTlk7QUFPakIsSUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFdBQUQsQ0FBRCxDQUFlLEdBQWYsRUFQTztBQVFqQixJQUFBLFNBQVMsRUFBRSxDQUFDLENBQUMsWUFBRCxDQUFELENBQWdCLEdBQWhCO0FBUk0sR0FBbkI7QUFVQSxFQUFBLE1BQU0sQ0FBQyxvQkFBRCxFQUF1QixPQUF2QixFQUFnQztBQUFDLElBQUEsWUFBWSxFQUFFO0FBQWYsR0FBaEMsQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFXO0FBQ2YsSUFBQSxjQUFjLENBQUMsTUFBRCxDQUFkO0FBQ0QsR0FISCxXQUlTLFVBQVMsSUFBVCxFQUFlO0FBQ3BCLElBQUEsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUwsSUFBWSxJQUFiLENBQWhCO0FBQ0QsR0FOSDtBQU9EOztBQUVELFNBQVMsYUFBVCxHQUF5QjtBQUN2QixNQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLEdBQWpCLEVBQWpCO0FBQ0EsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGNBQUQsQ0FBRCxDQUFrQixHQUFsQixFQUFsQjtBQUNBLE1BQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxlQUFELENBQUQsQ0FBbUIsR0FBbkIsRUFBbkI7QUFDQSxNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBRCxDQUFELENBQWEsR0FBYixFQUFiO0FBQ0EsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixHQUFqQixFQUFsQjtBQUNBLE1BQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxXQUFELENBQUQsQ0FBZSxHQUFmLEVBQWY7QUFDQSxNQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsWUFBRCxDQUFELENBQWdCLEdBQWhCLEVBQWhCO0FBQ0EsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLEdBQVYsRUFBVjtBQUVBLE1BQUksSUFBSSxHQUFHLGdCQUFnQixVQUFoQixHQUE2QixNQUE3QixHQUFzQyxTQUF0QyxHQUFrRCxXQUFsRCxHQUFnRSxPQUFoRSxHQUEwRSxRQUExRSxHQUFxRixZQUFyRixHQUFvRyxPQUFwRyxHQUE4RyxVQUE5RyxHQUEySCxNQUEzSCxHQUFvSSxPQUFwSSxHQUE4SSxVQUE5SSxHQUEySixXQUEzSixHQUF5SyxPQUF6SyxHQUFtTCxlQUFuTCxHQUFxTSxRQUFyTSxHQUFnTixPQUFoTixHQUEwTixRQUExTixHQUFxTyxHQUFyTyxHQUEyTyxPQUEzTyxHQUFxUCxRQUFyUCxHQUFnUSxTQUFoUSxHQUE0USxHQUF2UjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFVBQUQsQ0FBRCxDQUFjLElBQWQsQ0FBbUIsSUFBbkI7QUFDRDs7QUFFRCxDQUFDLENBQUMsWUFBVztBQUNYLEVBQUEsYUFBYTtBQUNiLEVBQUEsQ0FBQyxDQUFDLGdCQUFELENBQUQsQ0FBb0IsRUFBcEIsQ0FBdUIsT0FBdkIsRUFBZ0MsWUFBVztBQUN6QyxJQUFBLGFBQWE7QUFDZCxHQUZEO0FBR0QsQ0FMQSxDQUFEO0FBT0EsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFLEVBRlk7QUFLbEIsRUFBQSxPQUFPLEVBQUU7QUFMUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJmdW5jdGlvbiBzYXZlTnVtYmVyU2V0dGluZ3MoKSB7XHJcbiAgdmFyIGNvZWZmaWNpZW50cyA9IHtcclxuICAgIHBvc3RUb0ZvcnVtOiAkKCcjcG9zdFRvRm9ydW0nKS52YWwoKSxcclxuICAgIHBvc3RUb1RocmVhZDogJCgnI3Bvc3RUb1RocmVhZCcpLnZhbCgpLFxyXG4gICAgZGlnZXN0OiAkKCcjZGlnZXN0JykudmFsKCksXHJcbiAgICBkaWdlc3RQb3N0OiAkKCcjZGlnZXN0UG9zdCcpLnZhbCgpLFxyXG4gICAgZGFpbHlMb2dpbjogJCgnI2RhaWx5TG9naW4nKS52YWwoKSxcclxuICAgIHhzZjogJCgnI3hzZicpLnZhbCgpLFxyXG4gICAgdGh1bWJzVXA6ICQoJyN0aHVtYnNVcCcpLnZhbCgpLFxyXG4gICAgdmlvbGF0aW9uOiAkKCcjdmlvbGF0aW9uJykudmFsKClcclxuICB9O1xyXG4gIG5rY0FQSSgnL2Uvc2V0dGluZ3MvbnVtYmVyJywgJ1BBVENIJywge2NvZWZmaWNpZW50czogY29lZmZpY2llbnRzfSlcclxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICBzY3JlZW5Ub3BBbGVydCgn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgc2NyZWVuVG9wV2FybmluZyhkYXRhLmVycm9yfHxkYXRhKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUZvcm11bGEoKSB7XHJcbiAgdmFyIGRhaWx5TG9naW4gPSAkKCcjZGFpbHlMb2dpbicpLnZhbCgpO1xyXG4gIHZhciBwb3N0VG9Gb3J1bSA9ICQoJyNwb3N0VG9Gb3J1bScpLnZhbCgpO1xyXG4gIHZhciBwb3N0VG9UaHJlYWQgPSAkKCcjcG9zdFRvVGhyZWFkJykudmFsKCk7XHJcbiAgdmFyIGRpZ2VzdCA9ICQoJyNkaWdlc3QnKS52YWwoKTtcclxuICB2YXIgZGlnZXN0UG9zdF8gPSAkKCcjZGlnZXN0UG9zdCcpLnZhbCgpO1xyXG4gIHZhciB0aHVtYnNVcCA9ICQoJyN0aHVtYnNVcCcpLnZhbCgpO1xyXG4gIHZhciB2aW9sYXRpb24gPSAkKCcjdmlvbGF0aW9uJykudmFsKCk7XHJcbiAgdmFyIHhzZiA9ICQoJyN4c2YnKS52YWwoKTtcclxuXHJcbiAgdmFyIHRleHQgPSAn5YWs5byP77yaKOWcqOe6v+WkqeaVsCB4ICcgKyBkYWlseUxvZ2luICsgJykgKyAnICsgJyjmlofnq6DmlbAgeCAnICsgcG9zdFRvRm9ydW0gKyAnKSArICgnICsgJ+WbnuWkjeaVsCB4ICcgKyBwb3N0VG9UaHJlYWQgKyAnKSArICgnICsgJ+eyvumAieaWh+eroOaVsCB4ICcgKyBkaWdlc3QgKyAnKSArICgnICsgJ+eyvumAieWbnuWkjeaVsCB4ICcgKyBkaWdlc3RQb3N0XyArICcpICsgKCcgKyAn6KKr54K56LWe5pWwXigxLzIpIHggJyArIHRodW1ic1VwICsgJykgKyAoJyArICflrabmnK/liIYgeCAnICsgeHNmICsgJykgKyAoJyArICfov53op4TmlbAgeCAnICsgdmlvbGF0aW9uICsgJyknO1xyXG4gICQoJyNmb3JtdWxhJykudGV4dCh0ZXh0KTtcclxufVxyXG5cclxuJChmdW5jdGlvbigpIHtcclxuICB1cGRhdGVGb3JtdWxhKCk7XHJcbiAgJCgnLmZvcm11bGEgaW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgIHVwZGF0ZUZvcm11bGEoKTtcclxuICB9KTtcclxufSk7XHJcblxyXG5jb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcblxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG5cclxuICB9XHJcbn0pO1xyXG4iXX0=
