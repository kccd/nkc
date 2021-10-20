import Sortable from "sortablejs";

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
});
function initSortable() {
  const masterContainerL = document.getElementsByClassName('home-categories-left')[0];
  new Sortable(masterContainerL, {
    group: 'master',
    invertSwap: true,
    handle: '.home-category-master-handle',
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    onEnd: this.changeOrder
  });
  const masterContainerR = document.getElementsByClassName('home-categories-right')[0];
  new Sortable(masterContainerR, {
    group: 'master',
    invertSwap: true,
    handle: '.home-category-master-handle',
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    onEnd: this.changeOrder
  });
};
function changeOrder(){
  const domOrder = $('.home-category-master-handle');
  const forumDoms = [];
  for(let i = 0; i < domOrder.length; i++) {
    const m = domOrder.eq(i);
    const cid = Number(m.attr('data-cid'));
    forumDoms.push({
      cid,
      order: i
    });
  }
};
//新建
function modifyForum(){

};
//编辑
function editorForum(cid){
  const domBlock = $('.home-forums-list');
  for(let i = 0;i<domBlock.length;i++){
    const n = domBlock.eq(i);
    const id = Number(n.attr('data-cid'));
    if(id === Number(cid)){
      this.domHidden = cid;
    }
  }

};
//删除
function del(){};
//屏蔽
function disabled(){};
function clickEditor(){

};
function editor(){
  $('.home-title-r').css.visibility = 'initial';
};
function finished(){};
