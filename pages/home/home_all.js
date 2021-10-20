import Sortable from "sortablejs";
const homeModal = new NKC.modules.homeModal();

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

const homeAll = new Vue({
  el: "#home_all",
  data: {},
  mounted() {
    this.initSortable();
  },
  methods:{
    initSortable() {
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
    },
    changeOrder(){
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
    },
    //新建
    modifyForum(){
      homeModal.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        const warning = data[2].value;
        const threadWarning = data[3].value;
      }, {
        title: '新建',
        data: [
          {
            dom: 'input',
            label: '标题',
            value: ''
          },
          {
            dom: 'textarea',
            label: '介绍',
            value: ''
          },
          {
            dom: 'textarea',
            label: '注意事项',
            value: ''
          },
          {
            dom: 'textarea',
            label: '文章公告',
            value: ''
          }
        ]
      })
    },
    //编辑
    editorForum(){
      homeModal.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        const warning = data[2].value;
        const threadWarning = data[3].value;
      }, {
        title: '编辑',
        data: [
          {
            dom: 'input',
            label: '标题',
            value: ''
          },
          {
            dom: 'textarea',
            label: '介绍',
            value: ''
          },
          {
            dom: 'textarea',
            label: '注意事项',
            value: ''
          },
          {
            dom: 'textarea',
            label: '文章公告',
            value: ''
          }
        ]
      })
    },
  }
})

