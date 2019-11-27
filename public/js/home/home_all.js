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
  }); // 监听页面滚动 更改header样式

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