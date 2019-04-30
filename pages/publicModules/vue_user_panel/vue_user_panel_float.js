var vue_user_panel_float = new Vue({
  el: "#vue_user_panel_float",
  data: {
    show: false,
    top: 0,
    left: 0,
    user: {
      username: "",
      description: "",
      uid: "",
      certsName: "",
      kcb: 0,
      xsf: 0,
      postCount: 0,
      threadCount: 0
    },
    usersObj: {}
  },
  methods: {
    close: function() {
      vue_user_panel_float.show = false;
    },

    getMousePosition: function(event) {
      var e = event || window.event;
      var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
      var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
      var x = e.pageX || e.clientX + scrollX;
      var y = e.pageY || e.clientY + scrollY;
      var scrollTop = $(document).scrollTop();
      return { 'x': x, 'y': y-scrollTop };
    },

    loadUser: function(userString) {
      var user = strToObj(userString);
      var position = this.getMousePosition();
      var maxX = $(window).width();
      var maxY = $(window).height();

      var top = position.y+20;
      var left = position.x-20;
      // console.log(maxX, maxY, top, left);

      // if(maxX < left + 300) left = maxX - 320;
      // if(maxY < top + 300) top = maxY - 320;
      this.left = left;
      this.top = top;

      if(this.usersObj[user.uid]) {
        this.user = this.usersObj[user.uid];
        return vue_user_panel_float.show = true;
      }

      vue_user_panel_float.show = true;

      var targetUser = user;

      vue_user_panel_float.usersObj[targetUser.uid] = {
        username: targetUser.username,
        description: (targetUser.description ||"暂未填写个人简介").slice(0, 140),
        uid: targetUser.uid,
        kcb: targetUser.kcb,
        xsf: targetUser.xsf,
        postCount: targetUser.postCount,
        threadCount: targetUser.threadCount,
        certsName: targetUser.info.certsName
      };
      vue_user_panel_float.user = vue_user_panel_float.usersObj[targetUser.uid];
    }
  }
});