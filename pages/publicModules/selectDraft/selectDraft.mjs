NKC.modules.SelectDraft = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleSelectDraft");
    self.app = new Vue({
      el: "#moduleSelectDraftApp",
      data: {
        uid: NKC.configs.uid,
        paging: {},
        perpage: 7,
        loading: true,
        drafts: []
      },
      methods: {
        fromNow: NKC.methods.fromNow,
        initDom() {
          const height = "43.5rem";
          self.dom.css({
            height
          });
          self.dom.draggable({
            scroll: false,
            handle: ".module-sd-title",
            drag: function(event, ui) {
              if(ui.position.top < 0) ui.position.top = 0;
              const height = $(window).height();
              if(ui.position.top > height - 30) ui.position.top = height - 30;
              const width = self.dom.width();
              if(ui.position.left < 100 - width) ui.position.left = 100 - width;
              const winWidth = $(window).width();
              if(ui.position.left > winWidth - 100) ui.position.left = winWidth - 100;
            }
          });
          const width = $(window).width();
          if(width < 700) {
            // 小屏幕
            self.dom.css({
              "width": width * 0.8,
              "top": 0,
              "right": 0
            });
          } else {
            // 宽屏
            self.dom.css("left", (width - self.dom.width())*0.5 - 20);
          }
          self.dom.show();
        },
        getDraftInfo(draft) {
          const {type, thread, forum} = draft;
          let info = "";
          if(type === "newThread") {
            info = `发表文章`;
          } else if(type === "newPost") {
            info = `在文章《${thread.title}》下发表回复`;
          } else if(type === "modifyPost") {
            info = `修改文章《${thread.title}》下的回复`;
          } else if(type === "modifyThread") {
            info = `修改文章《${thread.title}》`;
          } else {
            info = `修改专业《${forum.title}》的专业说明`;
          }
          return info;
        },
        insert(data) {
          self.callback(data);
        },
        removeDraft(draft) {
          sweetQuestion("确定要删除草稿吗？")
            .then(() => {
              nkcAPI('/u/' + this.uid + "/drafts/" + draft.did, "DELETE")
                .then(function() {
                  self.app.getDrafts(self.app.paging.page);
                })
                .catch(function(data) {
                  sweetError(data);
                })
            })
        },
        getDrafts(page = 0) {
          nkcAPI(`/u/${this.uid}/profile/draft?page=${page}&perpage=${this.perpage}`, "GET")
            .then(data => {
              self.app.drafts = data.drafts;
              self.app.paging = data.paging;
              self.app.loading = false;
            })
            .catch(sweetError);
        },
        loadDraft(d) {
          sweetQuestion(`继续创作将会覆盖编辑器中全部内容，确定继续？`)
            .then(() => {
              if(window.PostInfo && window.PostInfo.showCloseInfo) {
                window.PostInfo.showCloseInfo = false;
              }
              window.location.href = `/editor?type=redit&id=${d.did}`;
            })
            .catch(sweetError);
        },
        refresh() {
          this.getDrafts(self.app.paging.page);
        },
        open(callback) {
          self.callback = callback;
          this.initDom();
          this.getDrafts();
        },
        close() {
          self.dom.hide();
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }
};