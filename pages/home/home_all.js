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
  });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9ob21lL2hvbWVfYWxsLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxDQUFDLFlBQVc7QUFDWDtBQUNBLE1BQUksTUFBTSxHQUFHLElBQUksTUFBSixDQUFXLG1CQUFYLEVBQWdDO0FBQzNDLElBQUEsVUFBVSxFQUFFO0FBQ1YsTUFBQSxFQUFFLEVBQUUsb0JBRE07QUFFVixNQUFBLElBQUksRUFBRTtBQUZJLEtBRCtCO0FBSzNDLElBQUEsVUFBVSxFQUFFO0FBQ1YsTUFBQSxNQUFNLEVBQUUscUJBREU7QUFFVixNQUFBLE1BQU0sRUFBRTtBQUZFLEtBTCtCO0FBUzNDLElBQUEsSUFBSSxFQUFFLElBVHFDO0FBVTNDLElBQUEsUUFBUSxFQUFFO0FBQ1IsTUFBQSxLQUFLLEVBQUUsSUFEQztBQUVSLE1BQUEsb0JBQW9CLEVBQUU7QUFGZDtBQVZpQyxHQUFoQyxDQUFiOztBQWVBLEVBQUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxXQUFWLEdBQXdCLFlBQVU7QUFDaEMsSUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFoQjtBQUNELEdBRkQ7O0FBR0EsRUFBQSxNQUFNLENBQUMsRUFBUCxDQUFVLFlBQVYsR0FBeUIsWUFBVztBQUNsQyxJQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQWhCO0FBQ0QsR0FGRCxDQXBCVyxDQXVCWDs7O0FBQ0EsRUFBQSxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsTUFBVixDQUFpQixVQUFTLEtBQVQsRUFBZTtBQUM5QixRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsU0FBVixFQUFsQjtBQUNBLFFBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQywwQkFBRCxDQUFoQjs7QUFDQSxRQUFHLFNBQVMsR0FBRyxFQUFmLEVBQW1CO0FBQ2pCLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsbUJBQWhCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsTUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixtQkFBbkI7QUFDRDtBQUNGLEdBUkQ7QUFTRCxDQWpDQSxDQUFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJChmdW5jdGlvbigpIHtcclxuICAvLyDova7mkq3lm75cclxuICB2YXIgc3dpcGVyID0gbmV3IFN3aXBlcignLnN3aXBlci1jb250YWluZXInLCB7XHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2ZyYWN0aW9uJyxcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgYXV0b3BsYXk6IHtcclxuICAgICAgZGVsYXk6IDMwMDAsXHJcbiAgICAgIGRpc2FibGVPbkludGVyYWN0aW9uOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgc3dpcGVyLmVsLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oKXtcclxuICAgIHN3aXBlci5hdXRvcGxheS5zdG9wKCk7XHJcbiAgfTtcclxuICBzd2lwZXIuZWwub25tb3VzZWxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBzd2lwZXIuYXV0b3BsYXkuc3RhcnQoKTtcclxuICB9O1xyXG4gIC8vIOebkeWQrOmhtemdoua7muWKqCDmm7TmlLloZWFkZXLmoLflvI9cclxuICAkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgIGNvbnN0IHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgIGNvbnN0IGhlYWRlciA9ICQoXCIubmF2YmFyLWRlZmF1bHQubmtjc2hhZGVcIik7XHJcbiAgICBpZihzY3JvbGxUb3AgPiAxMCkge1xyXG4gICAgICBoZWFkZXIuYWRkQ2xhc3MoXCJob21lLWZpeGVkLWhlYWRlclwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhlYWRlci5yZW1vdmVDbGFzcyhcImhvbWUtZml4ZWQtaGVhZGVyXCIpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuXHJcbiJdfQ==
