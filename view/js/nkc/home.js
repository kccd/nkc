const data = NKC.methods.getDataById("data");
const modifyAd = (ad, type) => {
  ad.type = type;
};

for(let i = 0; i < data.ads.movable.length; i++) {
  const ad = data.ads.movable[i];
  modifyAd(ad, "movable");
}

for(let i = 0; i < data.ads.fixed.length; i++) {
  const ad = data.ads.fixed[i];
  modifyAd(ad, "fixed");
}

const app = new Vue({
  el: "#app",
  data: {
    ads: data.ads,
    recommendForums: data.recommendForums,
    columns: data.columns,
    goods: data.goods
  },
  mounted() {
    window.SelectImage = new NKC.methods.selectImage();
    window.MoveThread = new NKC.modules.MoveThread();
  },
  computed: {
    selectedRecommendForumsId() {
      return data.recommendForums.map(f => f.fid);
    }
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    getUrl: NKC.methods.tools.getUrl,
    floatUserInfo: NKC.methods.tools.floatUserInfo,
    visitUrl: NKC.methods.visitUrl,
    selectLocalFile(ad) {
      const options = {};
      if(ad.type === "movable") {
        options.aspectRatio = 800/336;
      } else {
        options.aspectRatio = 400/253;
      }
      SelectImage.show(data => {
        const formData = new FormData();
        formData.append("cover", data);
        formData.append("topType", ad.type);
        formData.append("tid", ad.tid);
        nkcUploadFile("/nkc/home", "POST", formData)
          .then(data => {
            ad.cover = data.coverHash;
          })
          .catch(sweetError);
        SelectImage.close();
      }, options);
    },
    move(ad, type) {
      let ads;
      if(ad.type === "movable") {
        ads = this.ads.movable;
      } else {
        ads = this.ads.fixed;
      }
      const index = ads.indexOf(ad);
      if((type === "left" && index === 0) || (type === "right" && index+1 === ads.length)) return;
      let newIndex;
      if(type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }
      const otherAd = ads[newIndex];
      ads.splice(index, 1, otherAd);
      ads.splice(newIndex, 1, ad);
    },
    saveAds(){
      const {movable, fixed} = this.ads;
      const self = this;
      Promise.resolve()
        .then(() => {
          movable.concat(fixed).map(ad => {
            self.checkString(ad.title, {
              name: "标题",
              minLength: 1,
              maxLength: 200
            });
            if(!ad.cover) throw "封面图不能为空";
            if(!ad.tid) throw "文章ID不能为空";
          });
          return nkcAPI("/nkc/home", "PATCH", {
            operation: "saveAds",
            movable,
            fixed
          });
        })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    remove(ads, index){
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          ads.splice(index, 1)
        })
        .catch(() => {})
      
    },
    addForum() {
      const self = this;
      MoveThread.open(data => {
        const {originForums} = data;
        originForums.map(forum => {
          if(!self.selectedRecommendForumsId.includes(forum.fid)) {
            self.recommendForums.push(forum)
          }
        });
        MoveThread.close();
      }, {
        hideMoveType: true
      })
    },
    moveForum(arr, f, type) {
      const index = arr.indexOf(f);
      if((type === "left" && index === 0) || (type === "right" && index+1 === arr.length)) return;
      let newIndex;
      if(type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }
      const otherAd = arr[newIndex];
      arr.splice(index, 1, otherAd);
      arr.splice(newIndex, 1, f);
    },
    removeForum(arr, index) {
      const self = this;
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          arr.splice(index, 1);
        })
        .catch(() => {})
    },
    saveRecommendForums() {
      const forumsId = this.recommendForums.map(forum => forum.fid);
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveRecommendForums",
        forumsId
      })
        .then(function() {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    saveColumns(){
      const columnsId = this.columns.map(c => c._id);
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveColumns",
        columnsId
      })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    saveGoods() {
      const goodsId = this.goods.map(g => g.productId);
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveGoods",
        goodsId
      })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    }
  }
});
