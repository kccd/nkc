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
function editorBlock(cid){

};
//删除
function del(){};
//屏蔽
function disabled(){};
function clickEditor(){

};
//进入编辑模式
function editor(){
  const homeTitle = $('.home-title-r');
  const moveHandle = $('.move-handle');
  const adminEditor = document.getElementsByClassName('admin-editor');
  const homeFinished = document.getElementsByClassName('admin-finished');
  for(let i = 0; i < homeTitle.length; i++) {
    const element = homeTitle[i];
    element.style.visibility = 'initial';
  }
  for(let i = 0; i < moveHandle.length; i++) {
    const element = moveHandle[i];
    element.style.display = 'initial';
  }
  adminEditor[0].style.display = 'none';
  homeFinished[0].style.display = 'initial';
};
function finished(){
  const homeTitle = $('.home-title-r');
  const moveHandle = $('.move-handle');
  const adminEditor = document.getElementsByClassName('admin-editor');
  const homeFinished = document.getElementsByClassName('admin-finished');
  for(let i = 0; i < homeTitle.length; i++) {
    const element = homeTitle[i];
    element.style.visibility = 'hidden';
  }
  for(let i = 0; i < moveHandle.length; i++) {
    const element = moveHandle[i];
    element.style.display = 'none';
  }
  adminEditor[0].style.display = 'initial';
  homeFinished[0].style.display = 'none';
};

Object.assign(window, {
  changeOrder,
  finished,
  clickEditor,
  disabled,
  del,
  editorBlock,
  modifyForum,
  editor,
});
