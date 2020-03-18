const floatUserPanel = new Vue({
  el: "#floatUserPanel",
  data: {
    user: "",
    uid: NKC.configs.uid,
    over: false,
    show: false, 
    count: 1,
    onPanel: false,
    users: {},
    timeoutName: "",
  },
  mounted() {
    const self = this;
    const panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
    });
    panel.css({
      top: 300,
      left: 300
    });

    if(this.uid && !window.SubscribeTypes) {
      if(!NKC.modules.SubscribeTypes) {
        return sweetError("未引入与关注相关的模块");
      } else {
        window.SubscribeTypes = new NKC.modules.SubscribeTypes();
      }
    }

    this.initPanel();

  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    initPanel() {
      const doms = $(`[data-float-uid]`);
      for(var i = 0; i < doms.length; i++) {
        const dom = doms.eq(i);
        if(dom.attr("data-float-init") === "true") continue;
        this.initEvent(doms.eq(i));
      }
    },
    reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.user = "";
    },
    initEvent(dom) {
      const self = this;
      dom.on("mouseleave", function() {
        self.timeoutName = setTimeout(() => {
          self.reset();
        }, 200);
      });
      dom.on("mouseover", async function(e) {
        // 鼠标已悬浮在元素上
        clearTimeout(self.timeoutName);
        self.count ++;
        self.over = true;
        let uid;
        let count_ = self.count;
        let left, top, width, height;
        // 做一个延迟，过滤掉鼠标意外划过元素的情况。
        self.timeout(300)
          .then(() => {
            if(count_ !== self.count) throw "timeout 1";
            if(!self.over) throw "timeout 2";
            uid = dom.attr("data-float-uid");
            left = dom.offset().left;
            top = dom.offset().top;
            width = dom.width();
            height = dom.height();
            return self.getUserById(uid);
          })
          .then(userObj => {
            const {user, subscribed} = userObj;
            if(count_ !== self.count) throw "timeout 3";
            if(!self.over) throw "timeout 4";
            self.user = user;
            self.subscribed = subscribed;
            const panel = $(self.$el);
            self.show = true;
            panel.on("mouseleave", function() {
              self.reset();
            });
            panel.on("mouseover", function() {
              clearTimeout(self.timeoutName);
              self.onPanel = true;
            });

            const documentWidth = $(document).width() - 10;
            
            const panelWidth = 26 * 12;

            if((left + panelWidth) > documentWidth) {
              left = documentWidth - panelWidth;
            }

            panel.css({
              top: top + height + 10,
              left
            });
          })
          .catch(err => {
            // console.log(err);
          });
      });
      dom.attr("data-float-init", "true");
    },
    timeout(t) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, t)
      });
    },
    getUserById(id) {
      const self = this;
      return new Promise((resolve, reject) => {
        let userObj = self.users[id];
        if(userObj) {
          resolve(userObj);
        } else {
          nkcAPI(`/u/${id}?from=panel`, "GET")
            .then(data => {
              const userObj = {
                subscribed: data.subscribed,
                user: data.targetUser
              };
              self.users[data.targetUser.uid] = userObj;
              resolve(userObj);
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        }    
      });      
    },
    subscribe() {
      const {user, subscribed} = this;
      SubscribeTypes.subscribeUser(user.uid, !subscribed);
    }
  }
});