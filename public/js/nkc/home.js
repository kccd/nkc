"use strict";

var data = NKC.methods.getDataById("data");

var modifyAd = function modifyAd(ad, type) {
  ad.type = type;
};

for (var i = 0; i < data.ads.movable.length; i++) {
  var ad = data.ads.movable[i];
  modifyAd(ad, "movable");
}

for (var _i = 0; _i < data.ads.fixed.length; _i++) {
  var _ad = data.ads.fixed[_i];
  modifyAd(_ad, "fixed");
}

var app = new Vue({
  el: "#app",
  data: {
    ads: data.ads,
    recommendForums: data.recommendForums,
    columns: data.columns,
    goods: data.goods
  },
  mounted: function mounted() {
    window.SelectImage = new NKC.methods.selectImage();
    window.MoveThread = new NKC.modules.MoveThread();
  },
  computed: {
    selectedRecommendForumsId: function selectedRecommendForumsId() {
      return data.recommendForums.map(function (f) {
        return f.fid;
      });
    }
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    getUrl: NKC.methods.tools.getUrl,
    floatUserInfo: NKC.methods.tools.floatUserInfo,
    visitUrl: NKC.methods.visitUrl,
    selectLocalFile: function selectLocalFile(ad) {
      var options = {};

      if (ad.type === "movable") {
        options.aspectRatio = 800 / 336;
      } else {
        options.aspectRatio = 400 / 253;
      }

      SelectImage.show(function (data) {
        var formData = new FormData();
        formData.append("cover", data);
        formData.append("topType", ad.type);
        formData.append("tid", ad.tid);
        nkcUploadFile("/nkc/home", "POST", formData).then(function (data) {
          ad.cover = data.coverHash;
        })["catch"](sweetError);
        SelectImage.close();
      }, options);
    },
    move: function move(ad, type) {
      var ads;

      if (ad.type === "movable") {
        ads = this.ads.movable;
      } else {
        ads = this.ads.fixed;
      }

      var index = ads.indexOf(ad);
      if (type === "left" && index === 0 || type === "right" && index + 1 === ads.length) return;
      var newIndex;

      if (type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      var otherAd = ads[newIndex];
      ads.splice(index, 1, otherAd);
      ads.splice(newIndex, 1, ad);
    },
    saveAds: function saveAds() {
      var _this$ads = this.ads,
          movable = _this$ads.movable,
          fixed = _this$ads.fixed;
      var self = this;
      Promise.resolve().then(function () {
        movable.concat(fixed).map(function (ad) {
          self.checkString(ad.title, {
            name: "标题",
            minLength: 1,
            maxLength: 200
          });
          if (!ad.cover) throw "封面图不能为空";
          if (!ad.tid) throw "文章ID不能为空";
        });
        return nkcAPI("/nkc/home", "PATCH", {
          operation: "saveAds",
          movable: movable,
          fixed: fixed
        });
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    remove: function remove(ads, index) {
      sweetQuestion("确定要执行删除操作？").then(function () {
        ads.splice(index, 1);
      })["catch"](function () {});
    },
    addForum: function addForum() {
      var self = this;
      MoveThread.open(function (data) {
        var originForums = data.originForums;
        originForums.map(function (forum) {
          if (!self.selectedRecommendForumsId.includes(forum.fid)) {
            self.recommendForums.push(forum);
          }
        });
        MoveThread.close();
      }, {
        hideMoveType: true
      });
    },
    moveForum: function moveForum(arr, f, type) {
      var index = arr.indexOf(f);
      if (type === "left" && index === 0 || type === "right" && index + 1 === arr.length) return;
      var newIndex;

      if (type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      var otherAd = arr[newIndex];
      arr.splice(index, 1, otherAd);
      arr.splice(newIndex, 1, f);
    },
    removeForum: function removeForum(arr, index) {
      var self = this;
      sweetQuestion("确定要执行删除操作？").then(function () {
        arr.splice(index, 1);
      })["catch"](function () {});
    },
    saveRecommendForums: function saveRecommendForums() {
      var forumsId = this.recommendForums.map(function (forum) {
        return forum.fid;
      });
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveRecommendForums",
        forumsId: forumsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveColumns: function saveColumns() {
      var columnsId = this.columns.map(function (c) {
        return c._id;
      });
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveColumns",
        columnsId: columnsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveGoods: function saveGoods() {
      var goodsId = this.goods.map(function (g) {
        return g.productId;
      });
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveGoods",
        goodsId: goodsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    }
  }
});