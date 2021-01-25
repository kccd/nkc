NKC.modules.downloadResource = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleDownloadResource");
    self.app = new Vue({
      el: "#moduleDownloadResourceApp",
      data: {
        uid: NKC.configs.uid,
        rid: "",
        fileName: "未知",
        type: "",
        size: 0,
        costs: [],
        hold: [],
        status: "loading",
        fileCountLimitInfo: '',
        errorInfo: '',
        settingNoNeed: false,
      },
      computed: {
        costMessage() {
          return this.costs.map(c => c.name + c.number).join("、");
        },
        holdMessage() {
          return this.hold.map(c => c.name + c.number).join("、");
        }
      },
      methods: {
        fromNow: NKC.methods.fromNow,
        initDom() {
          const height = "37rem";
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
        getResourceInfo(rid) {
          let self = this;
          self.status = 'loading';
          self.errorInfo = '';
          nkcAPI(`/r/${rid}/detail`, "GET")
            .then(data => {
              let {free, paid, resource, costScores, fileCountLimitInfo} = data.detail;
              self.fileCountLimitInfo = fileCountLimitInfo;
              if(!resource.isFileExist) {
                self.status = "fileNotExist";
                return;
              }
              self.status = (!free && !paid) ? "needScore": "noNeedScore";
              self.free = free;
              self.paid = paid;
              self.fileName = resource.oname;
              self.rid = resource.rid;
              self.type = resource.ext;
              self.size = NKC.methods.getSize(resource.size);
              if(!costScores) return;
              self.costs = costScores.map(score => {
                return {
                  name: score.name,
                  number: score.addNumber / 100 * -1
                }
              });
              self.hold = costScores.map(score => {
                return {
                  name: score.name,
                  number: score.number / 100
                }
              });
            })
            .catch(data => {
              self.fileCountLimitInfo = data.fileCountLimitInfo;
              self.status = 'error';
              self.errorInfo = data.error || data.message || data;
            })
        },
        download() {
          let self = this;
          let {rid, fileName} = this;
          nkcAPI(`/r/${rid}/pay`, "POST")
            .then(() => {
              let downloader = document.createElement("a");
              downloader.setAttribute("download", fileName);
              downloader.href = `/r/${rid}?d=attachment`;
              downloader.click();
            })
            .catch(sweetError)
            .then(() => self.getResourceInfo(self.rid))
        },
        fetchResource() {
          let {rid, fileName} = this;
          let downloader = document.createElement("a");
          downloader.setAttribute("download", fileName);
          downloader.href = `/r/${rid}?d=attachment`;
          downloader.click();
        },
        open(rid) {
          this.status = "loading";
          this.initDom();
          this.getResourceInfo(rid);
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


(function() {
  const dr = new NKC.modules.downloadResource();
  NKC.methods.openFilePanel = function(rid) {
    dr.open(rid);
  }

  // 监听评论盒子
  $("#wrap, .post").on("click", function(e) {
    let type = $(e.target).attr("data-type");
    if(type === "clickAttachmentTitle") {
      e.preventDefault();
      e.stopPropagation();
      let rid = $(e.target).attr("data-id");
      dr.open(rid);
      return false;
    }
  });
}());
