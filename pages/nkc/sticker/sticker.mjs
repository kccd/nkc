const data = NKC.methods.getDataById("data");
data.stickers.map(s => {
  if(s.reviewed === null) {
    s.status = true;
    s.size = "md";
  } else {
    s.size = ""
  }
});
const app = new Vue({
  el: "#app",
  data: {
    stickers: data.stickers
  },
  mounted() {
    floatUserPanel.initPanel();
    NKC.methods.initImageViewer(".sticker-image")
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    format: NKC.methods.format,
    visitUrl: NKC.methods.visitUrl,
    checkString: NKC.methods.checkData.checkString,
    setAll(t) {
      this.stickers.map(s => {
        if(s.reviewed === null) {
          s.status = !!t;
        }
      })
    },
    submit(stickers) {
      const self = this;
      stickers = stickers.filter(s => s.reviewed === null);
      sweetQuestion("确定要执行此操作？")
        .then(() => {
          const arr = [];
          for(const s of stickers) {
            const {_id, status, reason, size} = s;
            if(!status) {
              self.checkString(reason, {
                name: "原因",
                minLength: 0,
                maxLength: 500
              });
            }
            arr.push({
              _id,
              status,
              size,
              reason
            });
          }
          return nkcAPI("/nkc/sticker", "POST", {
            stickers: arr,
            type: "review"
          });
        })
        .then(() => {
          // stickers.map(s => s.reviewed = s.status);
          window.location.reload();
        })
        .catch(sweetError)
    },
    submitAll() {
      if(data.t === "unReviewed") {
        this.submit(this.stickers);
      } else if(data.t === "reviewed") {
        this.submitSize(this.stickers);
      }
    },
    submitSize(stickers) {
      sweetQuestion("确定要执行此操作？")
        .then(() => {
          const arr = [];
          for(const sticker of stickers) {
            if(sticker.reviewed === null) continue;
            const {_id, size} = sticker;
            if(!["md", "sm", "xs"].includes(size)) throw "请选择表情大小";
            arr.push({
              _id,
              size
            });
          }
          screenTopAlert("后台处理中，请稍候");
          return nkcAPI("/nkc/sticker", "POST", {
            stickers: arr,
            type: "modifySize"
          });
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError);
    },
    modifySize(size) {
      this.stickers.map(s => s.size = size);
    },
    disableSticker(s, d) {
      nkcAPI("/nkc/sticker", "POST", {
        stickers: [s],
        disabled: !!d,
        type: "disable"
      })
        .then(() => {
          s.disabled = !!d;
        })
        .catch(sweetError)
    }
  }
});