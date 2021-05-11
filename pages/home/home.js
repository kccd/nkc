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

var SubscribeTypes;
$(function() {
  if(!window.SubscribeTypes && NKC.modules.SubscribeTypes)
    window.SubscribeTypes = new NKC.modules.SubscribeTypes();
  if(NKC.configs.swipeLeft) {
    window.ready()
      .then(function() {
        newEvent("swiperight", function() {
          emitEvent("openLeftBar");
        });
      })
  }
});

window.swiper = swiper;
