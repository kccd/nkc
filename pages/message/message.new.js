var app;

var winWidth = $(window).width();

var xss = window.filterXSS;

var data = getDataById("data");

var targetUser = data.targetUser;

var timeout;

var mobile = winWidth < 1100;

var pageName = "message";

if(mobile) {
  $("body").css("background-color", "#ffffff");
}

$(function() {

  app = new Vue({
    el: "#app",
    data: {

      /********数据列表*********/
      // 所有相关的用户(基本对象)
      userList: [],
      // 已添加的好友
      friendList: [],
      // 和已选中对象之间的所有消息
      messageList: [],
      // 已创建的聊天
      createdUserList: [],

      voiceHisIndex: "",
      // 地址数据
      locationData: "",
      mobile: mobile,

    }
  });

});