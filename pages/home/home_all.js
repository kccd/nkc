$(function() {
  // 轮播图
  var swiper = new Swiper('.swiper-container', {
    pagination: {
      el: '.swiper-pagination',
      type: 'fraction',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });
  swiper.el.onmouseover = function(){
    swiper.autoplay.stop();
  };
  swiper.el.onmouseleave = function() {
    swiper.autoplay.start();
  };
  // 监听页面滚动 更改header样式
  $(window).scroll(function(event){
    const scrollTop = $(window).scrollTop();
    const header = $(".navbar-default.nkcshade");
    if(scrollTop > 10) {
      header.addClass("home-fixed-header");
    } else {
      header.removeClass("home-fixed-header");
    }
  });

  // 搜索专栏
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

