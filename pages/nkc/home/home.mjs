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
    page: {id: 'other', name: '其他'},
    recommendThreads: data.recommendThreads,
    ads: data.ads,
    recommendForums: data.recommendForums,
    columns: data.columns,
    goods: data.goods,
    toppedThreads: data.toppedThreads,
    latestToppedThreads: data.latestToppedThreads,
    showShopGoods: (data.showGoods? "t": ""),
    // 首页“最新原创”文章条目显示模式，为空就默认为简略显示
    originalThreadDisplayMode: data.originalThreadDisplayMode,
    // 是否在首页显示“活动”入口
    showActivityEnter: data.showActivityEnter ? "show" : "hidden",
    updating: false,
    columnListPosition: data.columnListPosition
  },
  mounted() {
    window.SelectImage = new NKC.methods.selectImage();
    window.MoveThread = new NKC.modules.MoveThread();
  },
  computed: {
    selectedRecommendForumsId() {
      return data.recommendForums.map(f => f.fid);
    },
    nav() {
      const {page} = this;
      const arr = [
        {
          id: 'other',
          name: '其他'
        },
        {
          id: 'movable',
          name: '轮播图'
        },
        {
          id: 'fixed',
          name: '固定图'
        }
      ];
      arr.map(a => {
        a.active = a.id === page.id;
      });
      return arr;
    },
    threadCount() {
      const {automaticProportion, count} = this.recommendThreads[this.page.id];
      const automaticCount = Math.round(count * automaticProportion / (automaticProportion + 1));
      return {
        automaticCount,
        manualCount: count - automaticCount
      };
    }
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    getUrl: NKC.methods.tools.getUrl,
    floatUserInfo: NKC.methods.tools.floatUserInfo,
    visitUrl: NKC.methods.visitUrl,
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    moveFromArr(arr, index, type) {
      const count = arr.length;
      if(index === 0 && type === 'left') return;
      if(index + 1 === count && type === 'right') return;
      let _index;
      if(type === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }
      const item = arr[index];
      const _item = arr[_index];
      Vue.set(arr, index, _item);
      Vue.set(arr, _index, item);
    },
    getRecommendTypeName(id) {
      return {
        movable: '轮播图',
        fixed: '固定图'
      }[id]
    },
    selectPage(page) {
      this.page = page;
    },
    saveRecommendThreads() {
      const {page} = this;
      const options = this.recommendThreads[page.id];
      nkcAPI(`/nkc/home`, 'PUT', {
        operation: 'saveRecommendThreads',
        type: page.id,
        options
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
    updateThreadList() {
      const {page} = this;
      this.updating = true;
      const pageId = page.id;
      const self = this;
      nkcAPI('/nkc/home', 'PUT', {
        operation: 'updateThreadList',
        type: pageId
      })
        .then(data => {
          self.recommendThreads[pageId].automaticallySelectedThreads = data.automaticallySelectedThreads;
          Vue.set(self.saveRecommendThreads);
          sweetSuccess('更新成功');
          self.updating = false;
        })
        .catch(err => {
          self.updating = false;
        });
    },
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
            console.log(ad.cover);
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
      const {movable, fixed, movableOrder, fixedOrder} = this.ads;
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
          return nkcAPI("/nkc/home", "PUT", {
            operation: "saveAds",
            movable,
            fixed,
            movableOrder,
            fixedOrder
          });
        })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    remove(ads, index){
      ads.splice(index, 1)
      /*sweetQuestion("确定要执行删除操作？")
        .then(() => {
          ads.splice(index, 1)
        })
        .catch(() => {})*/

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
      arr.splice(index, 1);
      /*const self = this;
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          arr.splice(index, 1);
        })
        .catch(() => {})*/
    },
    saveRecommendForums() {
      const forumsId = this.recommendForums.map(forum => forum.fid);
      nkcAPI("/nkc/home", "PUT", {
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
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveColumns",
        columnsId,
        columnListPosition: this.columnListPosition,
      })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    saveGoods() {
      const goodsId = this.goods.map(g => g.productId);
      const showShopGoods = !!this.showShopGoods;
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveGoods",
        goodsId,
        showShopGoods
      })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    saveToppedThreads() {
      const toppedThreadsId = this.toppedThreads.map(t => t.tid);
      const latestToppedThreadsId = this.latestToppedThreads.map(t => t.tid);
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveToppedThreads",
        toppedThreadsId,
        latestToppedThreadsId
      })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError)
    },
    saveOriginalThreadDisplayMode() {
      const originalThreadDisplayMode = this.originalThreadDisplayMode;
      nkcAPI("/nkc/home", "PUT", {
        operation: "saveOriginalThreadDisplayMode",
        originalThreadDisplayMode
      })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError)
    },
    saveShowActivityEnter() {
      let value = this.showActivityEnter === "show";
      nkcAPI("/nkc/home/showActivityEnter", "PUT", {
        showActivityEnter: value
      })
      .then(() => {
        sweetSuccess("保存成功");
      })
      .catch(sweetError)
    }
  }
});
