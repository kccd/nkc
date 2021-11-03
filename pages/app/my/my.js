const tabs = [
  {
    id: '/thread',
    name: '我的文章',
  },
  {
    id: '/post',
    name: '我的回复',
  },
  {
    id: '/draft',
    name: '我的草稿',
  },
  {
    id: '/note',
    name: '我的笔记',
  },
  {
    id: '/subscribe/user',
    name: '关注的用户',
  },
  {
    id: '/subscribe/topic',
    name: '关注的专业',
  },
  // {
  //   id: '/subscribe/discipline',
  //   name: '关注的学科',
  // },
  {
    id: '/subscribe/column',
    name: '关注的专栏',
  },
  {
    id: '/subscribe/thread',
    name: '关注的文章',
  },
  {
    id: '/subscribe/collection',
    name: '收藏的文章',
  },
  {
    id: '/finance',
    name: '我的账单',
  },
  {
    id: '/follower',
    name: '我的粉丝',
  },
];

$(function() {
  // 轮播图
  var swiper = new Swiper('.swiper-container', {
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
    },
  });
});