(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

$(function () {
  // 轮播图
  var swiper = new Swiper('.swiper-container', {
    pagination: {
      el: '.swiper-pagination',
      type: 'fraction'
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    }
  });

  swiper.el.onmouseover = function () {
    swiper.autoplay.stop();
  };

  swiper.el.onmouseleave = function () {
    swiper.autoplay.start();
  }; // 监听页面滚动 更改header样式


  $(window).scroll(function (event) {
    var scrollTop = $(window).scrollTop();
    var header = $(".navbar-default.nkcshade");

    if (scrollTop > 10) {
      header.addClass("home-fixed-header");
    } else {
      header.removeClass("home-fixed-header");
    }
  }); // 搜索专栏

  /*$("#searchForum").on("click", () => {
    let keyword = $("#searchForumInput").val();
    if(!keyword) return;
    let scrollToFirst = false;
    $(".category-forums .detailed-forum-panel-name a").each((index, el) => {
      let text = $(el).text();
      if(text.includes(keyword)) {
        $(el).css("backgroundColor", "yellow");
        if(!scrollToFirst) {
          $('html, body').animate({scrollTop: $(el).offset().top - 100});
          scrollToFirst = true;
        }
      } else {
        $(el).css("backgroundColor", "unset");
      }
    });
  })*/
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9ob21lL2hvbWVfYWxsLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxDQUFDLFlBQVc7QUFDWDtBQUNBLE1BQUksTUFBTSxHQUFHLElBQUksTUFBSixDQUFXLG1CQUFYLEVBQWdDO0FBQzNDLElBQUEsVUFBVSxFQUFFO0FBQ1YsTUFBQSxFQUFFLEVBQUUsb0JBRE07QUFFVixNQUFBLElBQUksRUFBRTtBQUZJLEtBRCtCO0FBSzNDLElBQUEsVUFBVSxFQUFFO0FBQ1YsTUFBQSxNQUFNLEVBQUUscUJBREU7QUFFVixNQUFBLE1BQU0sRUFBRTtBQUZFLEtBTCtCO0FBUzNDLElBQUEsSUFBSSxFQUFFLElBVHFDO0FBVTNDLElBQUEsUUFBUSxFQUFFO0FBQ1IsTUFBQSxLQUFLLEVBQUUsSUFEQztBQUVSLE1BQUEsb0JBQW9CLEVBQUU7QUFGZDtBQVZpQyxHQUFoQyxDQUFiOztBQWVBLEVBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxXQUFWLEdBQXdCLFlBQVU7QUFDaEMsSUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFoQjtBQUNELEdBRkQ7O0FBR0EsRUFBQSxNQUFNLENBQUMsRUFBUCxDQUFVLFlBQVYsR0FBeUIsWUFBVztBQUNsQyxJQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQWhCO0FBQ0QsR0FGRCxDQXBCVyxDQXVCWDs7O0FBQ0EsRUFBQSxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsTUFBVixDQUFpQixVQUFTLEtBQVQsRUFBZTtBQUM5QixRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsU0FBVixFQUFsQjtBQUNBLFFBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQywwQkFBRCxDQUFoQjs7QUFDQSxRQUFHLFNBQVMsR0FBRyxFQUFmLEVBQW1CO0FBQ2pCLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsbUJBQWhCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsTUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixtQkFBbkI7QUFDRDtBQUNGLEdBUkQsRUF4QlcsQ0FrQ1g7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJELENBcERBLENBQUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIkKGZ1bmN0aW9uKCkge1xyXG4gIC8vIOi9ruaSreWbvlxyXG4gIHZhciBzd2lwZXIgPSBuZXcgU3dpcGVyKCcuc3dpcGVyLWNvbnRhaW5lcicsIHtcclxuICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgZWw6ICcuc3dpcGVyLXBhZ2luYXRpb24nLFxyXG4gICAgICB0eXBlOiAnZnJhY3Rpb24nLFxyXG4gICAgfSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBhdXRvcGxheToge1xyXG4gICAgICBkZWxheTogMzAwMCxcclxuICAgICAgZGlzYWJsZU9uSW50ZXJhY3Rpb246IGZhbHNlLFxyXG4gICAgfSxcclxuICB9KTtcclxuICBzd2lwZXIuZWwub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgc3dpcGVyLmF1dG9wbGF5LnN0b3AoKTtcclxuICB9O1xyXG4gIHN3aXBlci5lbC5vbm1vdXNlbGVhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHN3aXBlci5hdXRvcGxheS5zdGFydCgpO1xyXG4gIH07XHJcbiAgLy8g55uR5ZCs6aG16Z2i5rua5YqoIOabtOaUuWhlYWRlcuagt+W8j1xyXG4gICQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgY29uc3QgaGVhZGVyID0gJChcIi5uYXZiYXItZGVmYXVsdC5ua2NzaGFkZVwiKTtcclxuICAgIGlmKHNjcm9sbFRvcCA+IDEwKSB7XHJcbiAgICAgIGhlYWRlci5hZGRDbGFzcyhcImhvbWUtZml4ZWQtaGVhZGVyXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGVhZGVyLnJlbW92ZUNsYXNzKFwiaG9tZS1maXhlZC1oZWFkZXJcIik7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIOaQnOe0ouS4k+agj1xyXG4gIC8qJChcIiNzZWFyY2hGb3J1bVwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcclxuICAgIGxldCBrZXl3b3JkID0gJChcIiNzZWFyY2hGb3J1bUlucHV0XCIpLnZhbCgpO1xyXG4gICAgaWYoIWtleXdvcmQpIHJldHVybjtcclxuICAgIGxldCBzY3JvbGxUb0ZpcnN0ID0gZmFsc2U7XHJcbiAgICAkKFwiLmNhdGVnb3J5LWZvcnVtcyAuZGV0YWlsZWQtZm9ydW0tcGFuZWwtbmFtZSBhXCIpLmVhY2goKGluZGV4LCBlbCkgPT4ge1xyXG4gICAgICBsZXQgdGV4dCA9ICQoZWwpLnRleHQoKTtcclxuICAgICAgaWYodGV4dC5pbmNsdWRlcyhrZXl3b3JkKSkge1xyXG4gICAgICAgICQoZWwpLmNzcyhcImJhY2tncm91bmRDb2xvclwiLCBcInllbGxvd1wiKTtcclxuICAgICAgICBpZighc2Nyb2xsVG9GaXJzdCkge1xyXG4gICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogJChlbCkub2Zmc2V0KCkudG9wIC0gMTAwfSk7XHJcbiAgICAgICAgICBzY3JvbGxUb0ZpcnN0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJChlbCkuY3NzKFwiYmFja2dyb3VuZENvbG9yXCIsIFwidW5zZXRcIik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pKi9cclxufSk7XHJcblxyXG4iXX0=
