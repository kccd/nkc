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
      setTimeout(function() {
        vue_user_panel_float.show = false;
      }, 300);
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

    loadUser: function(uid) {
      var position = this.getMousePosition();
      this.top = position.y+20;
      this.left = position.x+20;

      if(this.usersObj[uid]) {
        this.user = this.usersObj[uid];
        return vue_user_panel_float.show = true;
      }

      nkcAPI("/u/" + uid, "GET")
        .then(function(data) {

          vue_user_panel_float.show = true;

          var targetUser = data.targetUser;
          vue_user_panel_float.usersObj[targetUser.uid] = {
            username: targetUser.username,
            description: (targetUser.description ||"").slice(0, 140),
            uid: targetUser.uid,
            kcb: targetUser.kcb,
            xsf: targetUser.xsf,
            postCount: targetUser.postCount,
            threadCount: targetUser.threadCount,
            certsName: targetUser.info.certsName
          };
          vue_user_panel_float.user = vue_user_panel_float.usersObj[targetUser.uid];
        })
        .catch(function(data) {
          screenTopWarning(data)
        })
    }
  }
});