
// window.ready()
//   .then(() => {

//     var host = "http://192.168.11.114";
//     // 用户信息
//     var user = getFromLocal('user');
//     if (user && user.grade) {
//       user.gradeImgSrc = '../../images/grade/v' + user.grade._id + 'l.png?t=' + Date.now();
//     }
//     if (isApp()) {
//       host = getFromLocal("host");
//       setPaddingTop(document.getElementById("app"));
//       setBarStyle("dark");
//     }


//   })
//   .catch(data => {

//     bottomAlert(data.error || data);
//     throw data;
//   });
var data = NKC.methods.getDataById("data");
var user = data.user;
var host = data.host;
var app = new Vue({
  el: "#app",
  data: {
    data,
    user,
    host
  },
  mounted() {
    console.log(this.data)
  },
  computed: {

  },
  methods: {
  }
})

$(function () {
  $(".statistics li").on('click', function (e) {
    $(this).find('span').eq(1).toggle();
  });
  $('.menu').find('div').on('click', function (e) {
    var that = this;
    var index = $(this).index();
    $(this).addClass('active').siblings().removeClass('active');
    $('.menu-item').eq(index).show().siblings('.menu-item').hide();
  })
})