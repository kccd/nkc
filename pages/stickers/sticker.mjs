const data = NKC.methods.getDataById("data");
data.ownStickers.map(s => {
  s.selected = false
});
const app = new Vue({
  el: "#app",
  data: {
    ownStickers: data.ownStickers,
    hotStickers: data.hotStickers,
    management: false
  },
  computed: {
    selectedStickers() {
      return this.ownStickers.filter(s => !!s.selected);
    }
  },
  mounted() {
    NKC.methods.initStickerViewer();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: NKC.methods.visitUrl,
    switchManagement() {
      this.management = !this.management;
      this.changeStickersStatus(false);
    },
    showReason(s) {
      sweetInfo(s.reason);
    },
    moveSticker() {
      const {selectedStickers} = this;
      if(!selectedStickers.length) return;
      const body = {
        type: "move",
        stickersId: selectedStickers.map(s => s._id)
      };
      nkcAPI("/sticker", "POST", body)
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError);
    },
    removeSticker() {
      const {selectedStickers} = this;
      if(!selectedStickers.length) return;
      sweetQuestion(`确定要删除已选中的${selectedStickers.length}个表情？`)
        .then(() => {
          const body = {
            type: "delete",
            stickersId: selectedStickers.map(s => s._id)
          };
          return nkcAPI("/sticker", "POST", body);
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError);
    },
    select(s) {
      s.selected = !s.selected;
    },
    changeStickersStatus(select) {
      this.ownStickers.map(s => s.selected = !!select);
    },
    selectAll() {
      let count = 0, select = true;
      for(const s of this.ownStickers) {
        if(s.selected) count ++;
      }
      if(count === this.ownStickers.length) {
        select = false;
      }
      this.changeStickersStatus(select);
    },
    shareSticker() {
      const {selectedStickers} = this;
      if(!selectedStickers.length) return;
      const body = {
        type: "share",
        stickersId: selectedStickers.map(s => s._id)
      };
      nkcAPI("/sticker", "POST", body)
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError);
    }
  }
});