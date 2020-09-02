NKC.modules.downloadResource = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleDownloadResource");
    self.app = new Vue({
      el: "#moduleDownloadResourceApp",
      data: {
        rid: "",
        fileName: "未知",
        type: "",
        size: 0,
        costs: [],
        hold: [],
        loadding: true
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
          const height = "20rem";
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
          let infoUrl = `/r/${rid}?t=attachment`;
          let dataUrl = `/r/${rid}?t=attachment&c=download&random=${Math.random()}`;
          // 下载此附件是否需要积分
          nkcAPI(`/r/${rid}/q?random=${Math.random()}`, "GET", {})
            .then(data => {
              if(!data.need) {
                let downloadLink = $("<a></a>");
                downloadLink.attr("href", dataUrl);
                downloadLink[0].click();
                self.close();
              } else {
                return nkcAPI(infoUrl, "GET", {})
              }
            })
            .then(data => {
              if(!data) return;
              self.loadding = false;
              self.rid = data.rid;
              self.fileName = data.resource.oname;
              self.type = data.resource.ext;
              self.size = NKC.methods.getSize(data.resource.size);
              let myAllScore = data.myAllScore;
              self.costs = myAllScore.map(score => {
                return {
                  name: score.name,
                  number: score.addNumber / 100 * -1
                }
              });
              self.hold = myAllScore.map(score => {
                return {
                  name: score.name,
                  number: score.number / 100
                }
              });
            })
            .catch(data => {
              self.close();
              sweetError(data);
            })
        },
        open(rid) {
          this.loadding = true;
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
  let attachments = [].slice.call($("[data-tag='nkcsource'][data-type='attachment']"));
  attachments.forEach(attachment => {
    $(attachment).find(".article-attachment-name").on("click", e => {
      e.preventDefault();
      e.stopPropagation();
      let rid = $(attachment).attr("data-id");
      dr.open(rid);
      return false;
    })
  })
}());