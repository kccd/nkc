var floatUserPanel = new Vue({
  el: "#floatUserPanel",
  data: {
    show: false,
    panelSwitch: false,
    subUid: [],
    top: 0,
    left: 0,
    user: {},
    uid: "",
    usersObj: {},
    timeout: ''
  },
  mounted: function() {
    var data = NKC.methods.strToObj(this.$el.getAttribute("data-sub-uid"));
    this.subUid = data.subUid;
    $("#floatUserPanel").on("mouseover", this.onPanel)
      .on("mouseleave", this.outPanel);
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    format: NKC.methods.format,
    getUrl: NKC.methods.tools.getUrl,
    close: function(uid) {
      var this_ = this;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function() {
        if(uid !== this_.uid) return;
        floatUserPanel.show = false;
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
    open: function(dom, uid) {
      var this_ = this;
      this.uid = uid;
      dom = $(dom);
      dom.on("mouseleave", function() {
        this_.close(uid);
      });
      this_.show = true;
      var offset = dom.offset();
      var scrollTop = $(document).scrollTop();
      var documentWidth = $(document).width();
      if((offset.left + 25*12) > documentWidth) {
        this.left = documentWidth - 25*12;
      } else {
        this.left = parseInt(offset.left);
      }
      this.top = parseInt(offset.top) - scrollTop + dom.height() + 15;
      var user = this.usersObj[uid];
      Promise.resolve()
        .then(function() {
          if(!user) {
            return nkcAPI("/u/" + uid + "?from=panel", "GET")
          }
        })
        .then(function(data) {
          if(!user) {
            if(this_.uid !== data.targetUser.uid) return;
            user = data.targetUser;
            this_.usersObj[user.uid] = user;
          }
          this_.user = user;
        })
        .catch(function(data) {
          // 临时解决办法。已知遨游浏览器在页面跳转时，向服务器再发送请求将触发此错误。
          if(data !== "发起请求失败，请检查网络连接") {
            sweetError(data);
          }
        });
      /*var func;
      if(user) {
        func = Promise.resolve();
      } else {
        func = nkcAPI("/u/" + uid + "?from=panel", "GET");
      }
      func
        .then(function(data) {
          if(!user) {
            if(this_.uid !== data.targetUser.uid) return;
            user = data.targetUser;
            this_.usersObj[user.uid] = user;
          }
          this_.user = user;
        })
        .catch(function(data) {
          // 临时解决办法。已知遨游浏览器在页面跳转时，向服务器再发送请求将触发此错误。
          if(data !== "发起请求失败，请检查网络连接") {
            sweetError(data);
          }
        });*/
    }
    /*open: function(userString) {
      clearTimeout(this.timeout);
      var user = NKC.methods.strToObj(userString);
      var position = this.getMousePosition();
      var maxX = $(window).width();
      var maxY = $(window).height();
      this.top = position.y + 20;
      this.left = position.x-20;
      if(this.usersObj[user.uid]) {
        this.user = this.usersObj[user.uid];
        return floatUserPanel.show = true;
      }

      floatUserPanel.show = true;

      var targetUser = user;

      floatUserPanel.usersObj[targetUser.uid] = {
        username: targetUser.username,
        description: (targetUser.description ||"暂未填写个人简介").slice(0, 140),
        uid: targetUser.uid,
        kcb: targetUser.kcb,
        avatar: targetUser.avatar,
        banner: targetUser.banner,
        tlv: targetUser.tlv,
        column: targetUser.column,
        toc: targetUser.toc,
        xsf: targetUser.xsf,
        postCount: targetUser.postCount - targetUser.disabledPostsCount,
        threadCount: targetUser.threadCount - targetUser.disabledThreadsCount,
        certsName: targetUser.info.certsName
      };
      floatUserPanel.user = floatUserPanel.usersObj[targetUser.uid];
    }*/
  }
});
