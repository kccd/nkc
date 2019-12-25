const floatForumPanel = new Vue({
  el: "#floatForumPanel",
  data: {
    forum: "",
    uid: NKC.configs.uid,
    subscribed: false,
    over: false,
    show: false,
    count: 1,
    onPanel: false,
    forums: {},
    timeoutName: "",
  },
  mounted() {
    const self = this;
    const panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
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
    initPanel() {
      const doms = $(`[data-float-fid]`);
      for(var i = 0; i < doms.length; i++) {
        const dom = doms.eq(i);
        if(dom.attr("data-float-init") === "true") continue;
        this.initEvent(doms.eq(i));
      };
    },
    reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.forum = "";
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
        let fid;
        let count_ = self.count;
        let left, top, width, height;
        // 做一个延迟，过滤掉鼠标意外划过元素的情况。
        self.timeout(300)
          .then(() => {
            if(count_ !== self.count) throw "事件已过时1";
            if(!self.over) throw "事件已过时2";
            fid = dom.attr("data-float-fid");
            left = dom.offset().left;
            top = dom.offset().top;
            width = dom.width();
            height = dom.height();
            return self.getForumById(fid);
          })
          .then(forumObj => {
            const {forum, subscribed} = forumObj;
            if(count_ !== self.count) throw "事件已过时3";
            if(!self.over) throw "事件已过时4";
            self.forum = forum;
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
            
            const panelWidth = 24 * 12;

            if((left + panelWidth) > documentWidth) {
              left = documentWidth - panelWidth;
            }

            panel.css({
              top: top + height + 10,
              left
            });
          })
          .catch(err => {
            console.log(err);
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
    getForumById(fid) {
      const self = this;
      return new Promise((resolve, reject) => {
        let forumsObj = self.forums[fid];
        if(forumsObj) {
          resolve(forumsObj); 
        } else {
          nkcAPI(`/f/${fid}/card`, "GET")
            .then(data => {
              forumsObj = {
                forum: data.forum,
                subscribed: data.subscribed
              };
              self.forums[data.forum.fid] = forumsObj;
              resolve(forumsObj);
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    },
    subscribe() {
      const {forum, subscribed} = this;
      SubscribeTypes.subscribeForum(forum.fid, !subscribed);
    },
    close() {

    },

  }
});