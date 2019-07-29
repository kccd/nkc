var vue_user_panel_float = new Vue({
  el: "#vue_user_panel_float",
  data: {
    show: false,
    panelSwitch: false,
    subUid: [],
    top: 0,
    left: 0,
    user: {},
    usersObj: {},
    timeout: ''
  },
  mounted: function() {
    var data = NKC.methods.strToObj(this.$el.getAttribute("data-sub-uid"));
    this.subUid = data.subUid;
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    close: function() {
      this.timeout = setTimeout(function() {
        vue_user_panel_float.show = false;
      }, 100);
    },

    onPanel: function() {
      clearTimeout(this.timeout)
    },

    outPanel: function() {
      this.show = false;
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
      clearTimeout(this.timeout);
      var user = NKC.methods.strToObj(userString);
      var position = this.getMousePosition();
      var maxX = $(window).width();
      var maxY = $(window).height();
      this.top = position.y + 20;
      this.left = position.x-20;
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
        tlv: targetUser.tlv,
        column: targetUser.column,
        toc: targetUser.toc,
        xsf: targetUser.xsf,
        postCount: targetUser.postCount - targetUser.disabledPostsCount,
        threadCount: targetUser.threadCount - targetUser.disabledThreadsCount,
        certsName: targetUser.info.certsName
      };
      vue_user_panel_float.user = vue_user_panel_float.usersObj[targetUser.uid];
    }
  }
});