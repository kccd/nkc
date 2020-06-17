(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var grades = data.grades,
    dealInfo = data.dealInfo,
    product = data.product;
var vipDisGroupObj = {};
var purchaseLimit = {
  status: false,
  count: 2
};
dealInfo.templates.map(function (t) {
  t.firstPrice = parseFloat(t.firstPrice);
  t.addPrice = parseFloat(t.addPrice);
});

if (product) {
  product.vipDisGroup.map(function (v) {
    return vipDisGroupObj[v.vipLevel] = v;
  });

  if (product.purchaseLimitCount == -1) {
    purchaseLimit.status = false;
  } else {
    purchaseLimit.status = true;
    purchaseLimit.count = product.purchaseLimitCount;
  }

  product.imgIntroductions.length = 5;
  product.productParams.map(function (p) {
    p.price = p.price / 100;
    p.originPrice = p.originPrice / 100;
  });
  product.freightTemplates.map(function (t) {
    t.firstPrice = t.firstPrice / 100;
    t.addPrice = t.addPrice / 100;
  });
}

var vipDisGroup = grades.map(function (g) {
  var group = vipDisGroupObj[g._id];
  return {
    vipLevel: g._id,
    grade: g,
    vipNum: group ? group.vipNum : 100
  };
});
window.app = new Vue({
  el: "#app",
  data: {
    type: product ? "modify" : "create",
    // 新上架：create, 编辑：modify
    submitting: false,
    showCloseInfo: true,
    // 提供选择的交易板块
    shopForums: data.shopForumTypes,
    selectedShopForumId: "",
    // 辅助板块
    mainForums: [],
    // 商品标题、描述、关键词
    title: "",
    "abstract": "",
    content: "",
    keywords: [],
    // 商品介绍图
    imgIntroductions: product ? product.imgIntroductions : ["", "", "", "", ""],
    // 添加多个规格
    paramForum: false,
    // 规格信息
    // 已勾选 新的规格分类  独立规格直接新建此数组内
    selectedParams: product ? product.productParams : [],
    // 规格名 

    /* 
    {
      name: "颜色",
      values: [
        "红",
        "黄",
        "蓝"
      ]
    } 
    */
    params: [],
    // 会员折扣
    vipDisGroup: vipDisGroup,
    vipDiscount: product ? !!product.vipDiscount : false,
    // 减库存
    stockCostMethod: product ? product.stockCostMethod : "orderReduceStock",
    // 下单减库存：orderReduceStock，付款减库存：payReduceStock
    // 限购相关
    purchaseLimit: purchaseLimit,
    // 购买时是否需要上传凭证、凭证说明
    uploadCert: product ? !!product.uploadCert : false,
    uploadCertDescription: product ? product.uploadCertDescription : "",
    // 价格显示相关 
    productSettings: product ? product.productSettings : {
      // 游客是否可见
      priceShowToVisit: true,
      // 停售后是否可见
      priceShowAfterStop: true
    },
    // 是否免邮费
    isFreePost: product ? !!product.isFreePost : true,
    // 运费模板
    defaultTemplates: dealInfo.templates,
    freightTemplates: product ? product.freightTemplates : [],
    // 上架时间
    shelfType: "immediately",
    // 立即上架：immediately，timing: 定时上架，save: 暂存不发布
    shelfTime: ""
  },
  watch: {
    shelfType: function shelfType() {
      this.initTime();
    }
  },
  mounted: function mounted() {
    // 编辑商品 预制内容
    if (product) {} else {
      window.CommonModal = new NKC.modules.CommonModal();
      window.SelectForums = new NKC.modules.MoveThread();
      window.editor = UE.getEditor('container', NKC.configs.ueditor.shopConfigs);
      this.initTime();
      this.addParam();
    }
  },
  computed: {
    selectedShopForum: function selectedShopForum() {
      if (this.selectedShopForum) {
        return this.selectedShopForum.fid;
      }
    },
    imgMaster: function imgMaster() {
      return this.imgIntroductions[0];
    },
    paramAttributes: function paramAttributes() {
      var params = this.params;
      var arr = [];
      params.map(function (p) {
        p = p.value.replace(/，/g, ",");
        p = p.split(",");
        p = p.map(function (v) {
          return (v + "").trim();
        });
        p = p.filter(function (v) {
          return !!v;
        });

        if (p.length) {
          arr.push(p);
        }

        ;
      });
      arr = NKC.methods.doExchange(arr);
      arr = arr.map(function (a) {
        if (Array.isArray(a)) {
          a = a.join(", ");
        }

        return a;
      });
      return arr;
    },
    freightTemplateNames: function freightTemplateNames() {
      return this.freightTemplates.map(function (f) {
        return f.name;
      });
    }
  },
  methods: {
    save: function save() {
      var self = this;
      var _NKC$methods$checkDat = NKC.methods.checkData,
          checkNumber = _NKC$methods$checkDat.checkNumber,
          checkString = _NKC$methods$checkDat.checkString;
      var body = {};
      Promise.resolve().then(function () {
        self.submitting = true;

        if (self.type === "create") {
          self.content = editor.getContent();
          if (!self.selectedShopForumId) throw "请选择商品分类";
          if (!self.mainForums.length) throw "请选择商品辅助分类";
          body.mainForumsId = [self.selectedShopForumId].concat(self.mainForums.map(function (forum) {
            return forum.fid;
          }));
          checkString(self.title, {
            name: "商品标题",
            minLength: 6,
            maxLength: 200
          });
          body.productName = self.title;
          checkString(self["abstract"], {
            name: "商品简介",
            minLength: 6,
            maxLength: 1000
          });
          body.productDescription = self["abstract"];
          self.keywords.map(function (k) {
            checkString(k, {
              name: "关键词",
              minLength: 1,
              maxLength: 20
            });
          });
          body.attention = self.keywords;
          checkString(self.content, {
            name: "图文描述",
            minLength: 1,
            maxLength: 100000
          });
          body.productDetails = self.content;
        } // 判断商品图


        var picturesId = self.imgIntroductions.filter(function (i) {
          return !!i;
        });
        if (!picturesId.length) throw "请至少选择一张商品图";
        body.imgIntroductions = picturesId; // 判断商品规格

        var productParams = [];
        productParams = self.selectedParams;
        if (!productParams.length) throw "请至少添加一个商品规格";
        productParams.map(function (param) {
          var name = param.name,
              originPrice = param.originPrice,
              price = param.price,
              useDiscount = param.useDiscount,
              stocksTotal = param.stocksTotal;
          checkString(name, {
            name: "规格名称",
            minLength: 1,
            maxLength: 100
          });
          checkNumber(stocksTotal, {
            name: "规格库存",
            min: 0
          }), checkNumber(originPrice, {
            name: "规格价格",
            min: 0.01,
            fractionDigits: 2
          });

          if (useDiscount) {
            checkNumber(price, {
              name: "规格优惠价",
              min: 0.01,
              fractionDigits: 2
            });
            if (price >= originPrice) throw "规格优惠价必须小于原价";
          }
        });
        body.productParams = productParams;
        body.vipDisGroup = []; // 会员折扣

        if (self.vipDiscount) {
          self.vipDisGroup.map(function (v) {
            var vipNum = v.vipNum;
            checkNumber(vipNum, {
              name: "折扣率",
              min: 1,
              max: 100
            });
          });
          body.vipDisGroup = self.vipDisGroup;
        }

        body.vipDiscount = self.vipDiscount; // 运费

        if (!self.isFreePost) {
          if (!self.freightTemplates.length) throw "请至少添加一条运费信息";
          self.freightTemplates.map(function (f) {
            var name = f.name,
                firstPrice = f.firstPrice,
                addPrice = f.addPrice;
            checkString(name, {
              name: "物流名称",
              minLength: 1,
              maxLength: 100
            });
            checkNumber(firstPrice, {
              name: "物流首件价格",
              min: 0,
              fractionDigits: 2
            });
            checkNumber(addPrice, {
              name: "物流每增加一件的价格",
              min: 0,
              fractionDigits: 2
            });
          });
          body.freightTemplates = self.freightTemplates;
        }

        body.isFreePost = !!self.isFreePost; // 价格显示

        body.productSettings = self.productSettings; // 库存

        body.stockCostMethod = self.stockCostMethod; // 购买限制

        if (self.purchaseLimit.status) {
          checkNumber(self.purchaseLimit.count, {
            name: "限购数量",
            min: 1
          });
          body.purchaseLimitCount = self.purchaseLimit.count;
        } else {
          body.purchaseLimitCount = -1;
        } // 购买凭证


        if (self.uploadCert) {
          checkString(self.uploadCertDescription, {
            name: "凭证说明",
            minLength: 1,
            maxLength: 1000
          });
          body.uploadCertDescription = self.uploadCertDescription;
        }

        body.uploadCert = self.uploadCert;

        if (self.type === "create") {
          // 上架时间
          if (self.shelfType === "immediately") {
            body.productStatus = "insale";
          } else if (self.shelfType === "save") {
            body.productStatus = "notonshelf";
          } else {
            body.productStatus = "notonshelf";
            var dom = $("#shelfTime");
            var shelfTime = new Date(dom.val()).getTime();
            body.shelfTime = shelfTime;
          }
        } else {
          body.productId = product.productId;
        }

        return nkcAPI("/shop/manage/shelf", "POST", {
          post: body
        });
      }).then(function (data) {
        sweetSuccess("提交成功");
        self.submitting = false;
        self.showCloseInfo = false;
        NKC.methods.visitUrl("/shop/manage/goods");
      })["catch"](function (err) {
        self.submitting = false;
        sweetError(err);
      });
    },
    disabledSelectParam: function disabledSelectParam(param) {
      if (!param._id) return;

      if (param.isEnable) {
        var total = 0;
        this.selectedParams.map(function (p) {
          if (p.isEnable) total++;
        });
        if (total <= 1) return sweetError("不允许屏蔽所有规格");
      }

      param.isEnable = !param.isEnable;
    },
    initTime: function initTime() {
      $('.time').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii',
        autoclose: true,
        todayHighlight: 1,
        startView: 2,
        minView: 0,
        forceParse: 0
      });
    },
    selectPictures: function selectPictures(index) {
      var self = this;

      if (!window.SelectResource) {
        window.SelectResource = new NKC.modules.SelectResource();
      }

      SelectResource.open(function (data) {
        if (!["png", "jpg", "jpeg"].includes(data.resources[0].ext)) return sweetInfo("仅支持png、jpg和jpeg格式的图片");
        Vue.set(self.imgIntroductions, index, data.resourcesId[0]);
      }, {
        allowedExt: ["picture"],
        countLimit: 1
      });
    },
    changeArrIndex: function changeArrIndex(arr, index, t) {
      var i = arr[index];
      var length = arr.length;
      var otherIndex;

      if (t === "left") {
        if (index === 0) return;
        otherIndex = index - 1;
      } else {
        if (index + 1 === length) return;
        otherIndex = index + 1;
      }

      var other = arr[otherIndex];
      Vue.set(arr, index, other);
      Vue.set(arr, otherIndex, i);
    },
    removePicture: function removePicture(index) {
      var _this = this;

      sweetQuestion("确定要删除当前商品图片？").then(function () {
        Vue.set(_this.imgIntroductions, index, "");
      })["catch"](function (err) {});
    },
    reloadTemplate: function reloadTemplate() {
      var self = this;
      nkcAPI("/shop/manage/settings", "GET").then(function (data) {
        self.defaultTemplates = data.dealInfo.templates;
        sweetSuccess("刷新成功");
      })["catch"](sweetError);
    },
    addTemplate: function addTemplate() {
      this.freightTemplates.push({
        name: "",
        firstPrice: "",
        addPrice: ""
      });
    },
    removeFromArr: function removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    selectTemplate: function selectTemplate(t) {
      if (this.freightTemplateNames.includes(t.name)) return;
      this.freightTemplates.push(Object.assign({}, t));
    },
    removeKeyword: function removeKeyword(index) {
      this.keywords.splice(index, 1);
    },
    selectForum: function selectForum() {
      var self = this;
      SelectForums.open(function (data) {
        self.mainForums = data.originForums;
        SelectForums.close();
      }, {
        forumCountLimit: 1,
        hideMoveType: true
      });
    },
    addKeywords: function addKeywords() {
      var _this2 = this;

      CommonModal.open(function (data) {
        var keywords = data[0].value;
        keywords = keywords.replace(/，/g, ",");
        keywords = keywords.split(",");
        var arr = [];
        keywords.map(function (k) {
          k = k || "";
          k = k.trim();

          if (k && !arr.includes(k)) {
            arr.push(k);
          }
        });
        _this2.keywords = arr;
        CommonModal.close();
      }, {
        title: "添加关键词",
        data: [{
          dom: "textarea",
          label: "多个关键词以逗号分隔",
          value: this.keywords.join(", ")
        }]
      });
    },
    removeParamAttribute: function removeParamAttribute(index) {
      this.params.splice(index, 1);
    },
    resetParamForum: function resetParamForum() {
      this.params = [{
        value: ""
      }, {
        value: ""
      }];
    },
    removeSelectParam: function removeSelectParam(index) {
      this.selectedParams.splice(index, 1);
    },
    addParam: function addParam(param) {
      param = param && param.name ? param : this.newParam();
      this.selectedParams.push(param);
    },
    newParam: function newParam(name) {
      if (!name) {
        if (!this.selectedParams.length) name = "默认";
      } else {
        name = "";
      }

      return {
        name: name,
        originPrice: "",
        price: "",
        isEnable: true,
        useDiscount: false,
        stocksTotal: ""
      };
    },
    addParams: function addParams() {
      this.resetParamForum();
      this.paramForum = true;
    },
    addParamAttribute: function addParamAttribute() {
      this.params.push({
        value: ""
      });
    },
    saveParamAttribute: function saveParamAttribute() {
      var paramAttributes = this.paramAttributes;
      var self = this;
      if (!paramAttributes.length) return sweetError("请至少填写一个属性值");
      paramAttributes.map(function (name) {
        self.addParam(self.newParam(name));
      });
      this.paramForum = false;
    }
  }
}); // 监听页面关闭，提示保存草稿

window.onbeforeunload = function () {
  if (app.showCloseInfo) {
    return "关闭页面后，已填写的内容将会丢失。确定要关闭当前页面？";
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zaG9wL21hbmFnZS9zaGVsZi9zaGVsZi5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0lBRU8sTSxHQUE2QixJLENBQTdCLE07SUFBUSxRLEdBQXFCLEksQ0FBckIsUTtJQUFVLE8sR0FBVyxJLENBQVgsTztBQUV6QixJQUFNLGNBQWMsR0FBRyxFQUF2QjtBQUVBLElBQU0sYUFBYSxHQUFHO0FBQ3BCLEVBQUEsTUFBTSxFQUFFLEtBRFk7QUFFcEIsRUFBQSxLQUFLLEVBQUU7QUFGYSxDQUF0QjtBQUtBLFFBQVEsQ0FBQyxTQUFULENBQW1CLEdBQW5CLENBQXVCLFVBQUEsQ0FBQyxFQUFJO0FBQzFCLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQUgsQ0FBekI7QUFDQSxFQUFBLENBQUMsQ0FBQyxRQUFGLEdBQWEsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFILENBQXZCO0FBQ0QsQ0FIRDs7QUFLQSxJQUFHLE9BQUgsRUFBWTtBQUNWLEVBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsR0FBcEIsQ0FBd0IsVUFBQSxDQUFDO0FBQUEsV0FBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQUgsQ0FBZCxHQUE2QixDQUFqQztBQUFBLEdBQXpCOztBQUNBLE1BQUcsT0FBTyxDQUFDLGtCQUFSLElBQThCLENBQUMsQ0FBbEMsRUFBcUM7QUFDbkMsSUFBQSxhQUFhLENBQUMsTUFBZCxHQUF1QixLQUF2QjtBQUNELEdBRkQsTUFFTztBQUNMLElBQUEsYUFBYSxDQUFDLE1BQWQsR0FBdUIsSUFBdkI7QUFDQSxJQUFBLGFBQWEsQ0FBQyxLQUFkLEdBQXNCLE9BQU8sQ0FBQyxrQkFBOUI7QUFDRDs7QUFDRCxFQUFBLE9BQU8sQ0FB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QUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDRCxLQXhVTTtBQXlVUCxJQUFBLGlCQXpVTywrQkF5VWE7QUFDbEIsV0FBSyxNQUFMLENBQVksSUFBWixDQUFpQjtBQUNmLFFBQUEsS0FBSyxFQUFFO0FBRFEsT0FBakI7QUFHRCxLQTdVTTtBQThVUCxJQUFBLGtCQTlVTyxnQ0E4VWM7QUFBQSxVQUNaLGVBRFksR0FDTyxJQURQLENBQ1osZUFEWTtBQUVuQixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsVUFBRyxDQUFDLGVBQWUsQ0FBQyxNQUFwQixFQUE0QixPQUFPLFVBQVUsQ0FBQyxZQUFELENBQWpCO0FBQzVCLE1BQUEsZUFBZSxDQUFDLEdBQWhCLENBQW9CLFVBQUEsSUFBSSxFQUFJO0FBQzFCLFFBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBZDtBQUNELE9BRkQ7QUFHQSxXQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDRDtBQXRWTTtBQTFIVSxDQUFSLENBQWIsQyxDQW9kQTs7QUFDQSxNQUFNLENBQUMsY0FBUCxHQUF3QixZQUFXO0FBQ2pDLE1BQUcsR0FBRyxDQUFDLGFBQVAsRUFBcUI7QUFDbkIsV0FBTyw2QkFBUDtBQUNEO0FBQ0YsQ0FKRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcblxyXG5jb25zdCB7Z3JhZGVzLCBkZWFsSW5mbywgcHJvZHVjdH0gPSBkYXRhO1xyXG5cclxuY29uc3QgdmlwRGlzR3JvdXBPYmogPSB7fTtcclxuXHJcbmNvbnN0IHB1cmNoYXNlTGltaXQgPSB7XHJcbiAgc3RhdHVzOiBmYWxzZSxcclxuICBjb3VudDogMlxyXG59O1xyXG5cclxuZGVhbEluZm8udGVtcGxhdGVzLm1hcCh0ID0+IHtcclxuICB0LmZpcnN0UHJpY2UgPSBwYXJzZUZsb2F0KHQuZmlyc3RQcmljZSk7XHJcbiAgdC5hZGRQcmljZSA9IHBhcnNlRmxvYXQodC5hZGRQcmljZSk7XHJcbn0pXHJcblxyXG5pZihwcm9kdWN0KSB7XHJcbiAgcHJvZHVjdC52aXBEaXNHcm91cC5tYXAodiA9PiB2aXBEaXNHcm91cE9ialt2LnZpcExldmVsXSA9IHYpO1xyXG4gIGlmKHByb2R1Y3QucHVyY2hhc2VMaW1pdENvdW50ID09IC0xKSB7XHJcbiAgICBwdXJjaGFzZUxpbWl0LnN0YXR1cyA9IGZhbHNlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBwdXJjaGFzZUxpbWl0LnN0YXR1cyA9IHRydWU7XHJcbiAgICBwdXJjaGFzZUxpbWl0LmNvdW50ID0gcHJvZHVjdC5wdXJjaGFzZUxpbWl0Q291bnQ7XHJcbiAgfVxyXG4gIHByb2R1Y3QuaW1nSW50cm9kdWN0aW9ucy5sZW5ndGggPSA1O1xyXG4gIHByb2R1Y3QucHJvZHVjdFBhcmFtcy5tYXAocCA9PiB7XHJcbiAgICBwLnByaWNlID0gcC5wcmljZSAvIDEwMDtcclxuICAgIHAub3JpZ2luUHJpY2UgPSBwLm9yaWdpblByaWNlIC8gMTAwO1xyXG4gIH0pO1xyXG4gIHByb2R1Y3QuZnJlaWdodFRlbXBsYXRlcy5tYXAodCA9PiB7XHJcbiAgICB0LmZpcnN0UHJpY2UgPSB0LmZpcnN0UHJpY2UgLyAxMDA7XHJcbiAgICB0LmFkZFByaWNlID0gdC5hZGRQcmljZSAvIDEwMDtcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgdmlwRGlzR3JvdXAgPSBncmFkZXMubWFwKGcgPT4ge1xyXG4gIGNvbnN0IGdyb3VwID0gdmlwRGlzR3JvdXBPYmpbZy5faWRdO1xyXG4gIHJldHVybiB7XHJcbiAgICB2aXBMZXZlbDogZy5faWQsXHJcbiAgICBncmFkZTogZyxcclxuICAgIHZpcE51bTogZ3JvdXA/IGdyb3VwLnZpcE51bTogMTAwXHJcbiAgfTtcclxufSk7XHJcblxyXG5cclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcblxyXG4gICAgdHlwZTogcHJvZHVjdD8gXCJtb2RpZnlcIjogXCJjcmVhdGVcIiwgLy8g5paw5LiK5p6277yaY3JlYXRlLCDnvJbovpHvvJptb2RpZnlcclxuXHJcbiAgICBzdWJtaXR0aW5nOiBmYWxzZSxcclxuXHJcbiAgICBzaG93Q2xvc2VJbmZvOiB0cnVlLFxyXG5cclxuICAgIC8vIOaPkOS+m+mAieaLqeeahOS6pOaYk+adv+Wdl1xyXG4gICAgc2hvcEZvcnVtczogZGF0YS5zaG9wRm9ydW1UeXBlcyxcclxuICAgIHNlbGVjdGVkU2hvcEZvcnVtSWQ6IFwiXCIsXHJcbiAgICAvLyDovoXliqnmnb/lnZdcclxuICAgIG1haW5Gb3J1bXM6IFtdLFxyXG4gICAgLy8g5ZWG5ZOB5qCH6aKY44CB5o+P6L+w44CB5YWz6ZSu6K+NXHJcbiAgICB0aXRsZTogXCJcIixcclxuICAgIGFic3RyYWN0OiBcIlwiLFxyXG4gICAgY29udGVudDogXCJcIixcclxuICAgIGtleXdvcmRzOiBbXSxcclxuICAgIC8vIOWVhuWTgeS7i+e7jeWbvlxyXG4gICAgaW1nSW50cm9kdWN0aW9uczogcHJvZHVjdD8gcHJvZHVjdC5pbWdJbnRyb2R1Y3Rpb25zOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXHJcblxyXG4gICAgLy8g5re75Yqg5aSa5Liq6KeE5qC8XHJcbiAgICBwYXJhbUZvcnVtOiBmYWxzZSxcclxuXHJcbiAgICAvLyDop4TmoLzkv6Hmga9cclxuICAgIC8vIOW3suWLvumAiSDmlrDnmoTop4TmoLzliIbnsbsgIOeLrOeri+inhOagvOebtOaOpeaWsOW7uuatpOaVsOe7hOWGhVxyXG4gICAgc2VsZWN0ZWRQYXJhbXM6IHByb2R1Y3Q/cHJvZHVjdC5wcm9kdWN0UGFyYW1zOltdLFxyXG4gICAgLy8g6KeE5qC85ZCNIFxyXG4gICAgLyogXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwi6aKc6ImyXCIsXHJcbiAgICAgIHZhbHVlczogW1xyXG4gICAgICAgIFwi57qiXCIsXHJcbiAgICAgICAgXCLpu4RcIixcclxuICAgICAgICBcIuiTnVwiXHJcbiAgICAgIF1cclxuICAgIH0gXHJcbiAgICAqL1xyXG4gICAgcGFyYW1zOiBbXSxcclxuICAgIC8vIOS8muWRmOaKmOaJo1xyXG4gICAgdmlwRGlzR3JvdXAsXHJcbiAgICB2aXBEaXNjb3VudDogcHJvZHVjdD8hIXByb2R1Y3QudmlwRGlzY291bnQ6IGZhbHNlLFxyXG4gICAgLy8g5YeP5bqT5a2YXHJcbiAgICBzdG9ja0Nvc3RNZXRob2Q6IHByb2R1Y3Q/IHByb2R1Y3Quc3RvY2tDb3N0TWV0aG9kOiBcIm9yZGVyUmVkdWNlU3RvY2tcIiwgLy8g5LiL5Y2V5YeP5bqT5a2Y77yab3JkZXJSZWR1Y2VTdG9ja++8jOS7mOasvuWHj+W6k+WtmO+8mnBheVJlZHVjZVN0b2NrXHJcbiAgICAvLyDpmZDotK3nm7jlhbNcclxuICAgIHB1cmNoYXNlTGltaXQsXHJcbiAgICAvLyDotK3kubDml7bmmK/lkKbpnIDopoHkuIrkvKDlh63or4HjgIHlh63or4Hor7TmmI5cclxuICAgIHVwbG9hZENlcnQ6IHByb2R1Y3Q/ICEhcHJvZHVjdC51cGxvYWRDZXJ0OiBmYWxzZSxcclxuICAgIHVwbG9hZENlcnREZXNjcmlwdGlvbjogcHJvZHVjdD8gcHJvZHVjdC51cGxvYWRDZXJ0RGVzY3JpcHRpb246IFwiXCIsXHJcblxyXG4gICAgLy8g5Lu35qC85pi+56S655u45YWzIFxyXG4gICAgcHJvZHVjdFNldHRpbmdzOiBwcm9kdWN0PyBwcm9kdWN0LnByb2R1Y3RTZXR0aW5nczoge1xyXG4gICAgICAvLyDmuLjlrqLmmK/lkKblj6/op4FcclxuICAgICAgcHJpY2VTaG93VG9WaXNpdDogdHJ1ZSxcclxuICAgICAgLy8g5YGc5ZSu5ZCO5piv5ZCm5Y+v6KeBXHJcbiAgICAgIHByaWNlU2hvd0FmdGVyU3RvcDogdHJ1ZVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyDmmK/lkKblhY3pgq7otLlcclxuICAgIGlzRnJlZVBvc3Q6IHByb2R1Y3Q/ICEhcHJvZHVjdC5pc0ZyZWVQb3N0OiB0cnVlLFxyXG4gICAgLy8g6L+Q6LS55qih5p2/XHJcbiAgICBkZWZhdWx0VGVtcGxhdGVzOiBkZWFsSW5mby50ZW1wbGF0ZXMsXHJcbiAgICBmcmVpZ2h0VGVtcGxhdGVzOiBwcm9kdWN0PyBwcm9kdWN0LmZyZWlnaHRUZW1wbGF0ZXM6IFtdLFxyXG4gICAgLy8g5LiK5p625pe26Ze0XHJcbiAgICBzaGVsZlR5cGU6IFwiaW1tZWRpYXRlbHlcIiwgLy8g56uL5Y2z5LiK5p6277yaaW1tZWRpYXRlbHnvvIx0aW1pbmc6IOWumuaXtuS4iuaetu+8jHNhdmU6IOaaguWtmOS4jeWPkeW4g1xyXG4gICAgc2hlbGZUaW1lOiBcIlwiXHJcblxyXG4gIH0sXHJcbiAgd2F0Y2g6IHtcclxuICAgIHNoZWxmVHlwZSgpIHtcclxuICAgICAgdGhpcy5pbml0VGltZSgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIC8vIOe8lui+keWVhuWTgSDpooTliLblhoXlrrlcclxuICAgIGlmKHByb2R1Y3QpIHtcclxuICAgICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cuQ29tbW9uTW9kYWwgPSBuZXcgTktDLm1vZHVsZXMuQ29tbW9uTW9kYWwoKTtcclxuICAgICAgd2luZG93LlNlbGVjdEZvcnVtcyA9IG5ldyBOS0MubW9kdWxlcy5Nb3ZlVGhyZWFkKCk7XHJcbiAgICAgIHdpbmRvdy5lZGl0b3IgPSBVRS5nZXRFZGl0b3IoJ2NvbnRhaW5lcicsIE5LQy5jb25maWdzLnVlZGl0b3Iuc2hvcENvbmZpZ3MpO1xyXG4gICAgICB0aGlzLmluaXRUaW1lKCk7XHJcbiAgICAgIHRoaXMuYWRkUGFyYW0oKTtcclxuICAgIH1cclxuXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgc2VsZWN0ZWRTaG9wRm9ydW0oKSB7XHJcbiAgICAgIGlmKHRoaXMuc2VsZWN0ZWRTaG9wRm9ydW0pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFNob3BGb3J1bS5maWQ7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBpbWdNYXN0ZXIoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmltZ0ludHJvZHVjdGlvbnNbMF07XHJcbiAgICB9LFxyXG4gICAgcGFyYW1BdHRyaWJ1dGVzKCkge1xyXG4gICAgICBjb25zdCB7cGFyYW1zfSA9IHRoaXM7XHJcbiAgICAgIGxldCBhcnIgPSBbXTtcclxuICAgICAgcGFyYW1zLm1hcChwID0+IHtcclxuICAgICAgICBwID0gcC52YWx1ZS5yZXBsYWNlKC/vvIwvZywgXCIsXCIpO1xyXG4gICAgICAgIHAgPSBwLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBwID0gcC5tYXAodiA9PiAodiArIFwiXCIpLnRyaW0oKSlcclxuICAgICAgICBwID0gcC5maWx0ZXIodiA9PiAhIXYpO1xyXG4gICAgICAgIGlmKHAubGVuZ3RoKSB7XHJcbiAgICAgICAgICBhcnIucHVzaChwKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgICBhcnIgPSBOS0MubWV0aG9kcy5kb0V4Y2hhbmdlKGFycik7XHJcbiAgICAgIGFyciA9IGFyci5tYXAoYSA9PiB7XHJcbiAgICAgICAgaWYoQXJyYXkuaXNBcnJheShhKSkge1xyXG4gICAgICAgICAgYSA9IGEuam9pbihcIiwgXCIpOyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGFyclxyXG4gICAgfSxcclxuICAgIGZyZWlnaHRUZW1wbGF0ZU5hbWVzKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5mcmVpZ2h0VGVtcGxhdGVzLm1hcChmID0+IGYubmFtZSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3Qge2NoZWNrTnVtYmVyLCBjaGVja1N0cmluZ30gPSBOS0MubWV0aG9kcy5jaGVja0RhdGE7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSB7fTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnN1Ym1pdHRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgaWYoc2VsZi50eXBlID09PSBcImNyZWF0ZVwiKSB7XHJcbiAgICAgICAgICAgIHNlbGYuY29udGVudCA9IGVkaXRvci5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLnNlbGVjdGVkU2hvcEZvcnVtSWQpIHRocm93IFwi6K+36YCJ5oup5ZWG5ZOB5YiG57G7XCI7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLm1haW5Gb3J1bXMubGVuZ3RoKSB0aHJvdyBcIuivt+mAieaLqeWVhuWTgei+heWKqeWIhuexu1wiO1xyXG4gICAgICAgICAgICBib2R5Lm1haW5Gb3J1bXNJZCA9IFtzZWxmLnNlbGVjdGVkU2hvcEZvcnVtSWRdLmNvbmNhdChzZWxmLm1haW5Gb3J1bXMubWFwKGZvcnVtID0+IGZvcnVtLmZpZCkpO1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhzZWxmLnRpdGxlLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLllYblk4HmoIfpophcIixcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDYsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJvZHkucHJvZHVjdE5hbWUgPSBzZWxmLnRpdGxlO1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhzZWxmLmFic3RyYWN0LCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLllYblk4HnroDku4tcIixcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDYsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDAwLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYm9keS5wcm9kdWN0RGVzY3JpcHRpb24gPSBzZWxmLmFic3RyYWN0O1xyXG4gICAgICAgICAgICBzZWxmLmtleXdvcmRzLm1hcChrID0+IHtcclxuICAgICAgICAgICAgICBjaGVja1N0cmluZyhrLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuWFs+mUruivjVwiLFxyXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYm9keS5hdHRlbnRpb24gPSBzZWxmLmtleXdvcmRzO1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhzZWxmLmNvbnRlbnQsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIuWbvuaWh+aPj+i/sFwiLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMDAwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYm9keS5wcm9kdWN0RGV0YWlscyA9IHNlbGYuY29udGVudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIOWIpOaWreWVhuWTgeWbvlxyXG4gICAgICAgICAgY29uc3QgcGljdHVyZXNJZCA9IHNlbGYuaW1nSW50cm9kdWN0aW9ucy5maWx0ZXIoaSA9PiAhIWkpO1xyXG4gICAgICAgICAgaWYoIXBpY3R1cmVzSWQubGVuZ3RoKSB0aHJvdyBcIuivt+iHs+WwkemAieaLqeS4gOW8oOWVhuWTgeWbvlwiO1xyXG4gICAgICAgICAgYm9keS5pbWdJbnRyb2R1Y3Rpb25zID0gcGljdHVyZXNJZDtcclxuICAgICAgICAgIC8vIOWIpOaWreWVhuWTgeinhOagvFxyXG4gICAgICAgICAgbGV0IHByb2R1Y3RQYXJhbXMgPSBbXTtcclxuICAgICAgICAgIHByb2R1Y3RQYXJhbXMgPSBzZWxmLnNlbGVjdGVkUGFyYW1zO1xyXG4gICAgICAgICAgaWYoIXByb2R1Y3RQYXJhbXMubGVuZ3RoKSB0aHJvdyBcIuivt+iHs+Wwkea3u+WKoOS4gOS4quWVhuWTgeinhOagvFwiO1xyXG4gICAgICAgICAgcHJvZHVjdFBhcmFtcy5tYXAocGFyYW0gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgICAgbmFtZSwgb3JpZ2luUHJpY2UsXHJcbiAgICAgICAgICAgICAgcHJpY2UsIHVzZURpc2NvdW50LFxyXG4gICAgICAgICAgICAgIHN0b2Nrc1RvdGFsXHJcbiAgICAgICAgICAgIH0gPSBwYXJhbTtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcobmFtZSwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi6KeE5qC85ZCN56ewXCIsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGVja051bWJlcihzdG9ja3NUb3RhbCwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi6KeE5qC85bqT5a2YXCIsXHJcbiAgICAgICAgICAgICAgbWluOiAwXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBjaGVja051bWJlcihvcmlnaW5QcmljZSwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi6KeE5qC85Lu35qC8XCIsXHJcbiAgICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZih1c2VEaXNjb3VudCkge1xyXG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKHByaWNlLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuinhOagvOS8mOaDoOS7t1wiLFxyXG4gICAgICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBpZihwcmljZSA+PSBvcmlnaW5QcmljZSkgdGhyb3cgXCLop4TmoLzkvJjmg6Dku7flv4XpobvlsI/kuo7ljp/ku7dcIjsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJvZHkucHJvZHVjdFBhcmFtcyA9IHByb2R1Y3RQYXJhbXM7XHJcbiAgICAgICAgICBib2R5LnZpcERpc0dyb3VwID0gW107XHJcbiAgICAgICAgICAvLyDkvJrlkZjmipjmiaNcclxuICAgICAgICAgIGlmKHNlbGYudmlwRGlzY291bnQpIHtcclxuICAgICAgICAgICAgc2VsZi52aXBEaXNHcm91cC5tYXAodiA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qge3ZpcE51bX0gPSB2O1xyXG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKHZpcE51bSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLmipjmiaPnjodcIixcclxuICAgICAgICAgICAgICAgIG1pbjogMSxcclxuICAgICAgICAgICAgICAgIG1heDogMTAwXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LnZpcERpc0dyb3VwID0gc2VsZi52aXBEaXNHcm91cDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJvZHkudmlwRGlzY291bnQgPSBzZWxmLnZpcERpc2NvdW50O1xyXG4gICAgICAgICAgLy8g6L+Q6LS5XHJcbiAgICAgICAgICBpZighc2VsZi5pc0ZyZWVQb3N0KSB7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLmZyZWlnaHRUZW1wbGF0ZXMubGVuZ3RoKSB0aHJvdyBcIuivt+iHs+Wwkea3u+WKoOS4gOadoei/kOi0ueS/oeaBr1wiO1xyXG4gICAgICAgICAgICBzZWxmLmZyZWlnaHRUZW1wbGF0ZXMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHtuYW1lLCBmaXJzdFByaWNlLCBhZGRQcmljZX0gPSBmO1xyXG4gICAgICAgICAgICAgIGNoZWNrU3RyaW5nKG5hbWUsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi54mp5rWB5ZCN56ewXCIsXHJcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKGZpcnN0UHJpY2UsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi54mp5rWB6aaW5Lu25Lu35qC8XCIsXHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKGFkZFByaWNlLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIueJqea1geavj+WinuWKoOS4gOS7tueahOS7t+agvFwiLFxyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJvZHkuZnJlaWdodFRlbXBsYXRlcyA9IHNlbGYuZnJlaWdodFRlbXBsYXRlcztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJvZHkuaXNGcmVlUG9zdCA9ICEhc2VsZi5pc0ZyZWVQb3N0O1xyXG4gICAgICAgICAgLy8g5Lu35qC85pi+56S6XHJcbiAgICAgICAgICBib2R5LnByb2R1Y3RTZXR0aW5ncyA9IHNlbGYucHJvZHVjdFNldHRpbmdzO1xyXG4gICAgICAgICAgLy8g5bqT5a2YXHJcbiAgICAgICAgICBib2R5LnN0b2NrQ29zdE1ldGhvZCA9IHNlbGYuc3RvY2tDb3N0TWV0aG9kO1xyXG4gICAgICAgICAgLy8g6LSt5Lmw6ZmQ5Yi2XHJcbiAgICAgICAgICBpZihzZWxmLnB1cmNoYXNlTGltaXQuc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTnVtYmVyKHNlbGYucHVyY2hhc2VMaW1pdC5jb3VudCwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi6ZmQ6LSt5pWw6YePXCIsXHJcbiAgICAgICAgICAgICAgbWluOiAxXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LnB1cmNoYXNlTGltaXRDb3VudCA9IHNlbGYucHVyY2hhc2VMaW1pdC5jb3VudDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJvZHkucHVyY2hhc2VMaW1pdENvdW50ID0gLTE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyDotK3kubDlh63or4FcclxuICAgICAgICAgIGlmKHNlbGYudXBsb2FkQ2VydCkge1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhzZWxmLnVwbG9hZENlcnREZXNjcmlwdGlvbiwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi5Yet6K+B6K+05piOXCIsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYm9keS51cGxvYWRDZXJ0RGVzY3JpcHRpb24gPSBzZWxmLnVwbG9hZENlcnREZXNjcmlwdGlvbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJvZHkudXBsb2FkQ2VydCA9IHNlbGYudXBsb2FkQ2VydDtcclxuICAgICAgICAgIGlmKHNlbGYudHlwZSA9PT0gXCJjcmVhdGVcIikge1xyXG4gICAgICAgICAgICAvLyDkuIrmnrbml7bpl7RcclxuICAgICAgICAgICAgaWYoc2VsZi5zaGVsZlR5cGUgPT09IFwiaW1tZWRpYXRlbHlcIikge1xyXG4gICAgICAgICAgICAgIGJvZHkucHJvZHVjdFN0YXR1cyA9IFwiaW5zYWxlXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihzZWxmLnNoZWxmVHlwZSA9PT0gXCJzYXZlXCIpIHtcclxuICAgICAgICAgICAgICBib2R5LnByb2R1Y3RTdGF0dXMgPSBcIm5vdG9uc2hlbGZcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBib2R5LnByb2R1Y3RTdGF0dXMgPSBcIm5vdG9uc2hlbGZcIjtcclxuICAgICAgICAgICAgICBjb25zdCBkb20gPSAkKFwiI3NoZWxmVGltZVwiKTtcclxuICAgICAgICAgICAgICBsZXQgc2hlbGZUaW1lID0gbmV3IERhdGUoZG9tLnZhbCgpKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgYm9keS5zaGVsZlRpbWUgPSBzaGVsZlRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBib2R5LnByb2R1Y3RJZCA9IHByb2R1Y3QucHJvZHVjdElkO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9zaG9wL21hbmFnZS9zaGVsZlwiLCBcIlBPU1RcIiwge3Bvc3Q6ICBib2R5fSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaPkOS6pOaIkOWKn1wiKTtcclxuICAgICAgICAgIHNlbGYuc3VibWl0dGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgc2VsZi5zaG93Q2xvc2VJbmZvID0gZmFsc2U7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChcIi9zaG9wL21hbmFnZS9nb29kc1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgc2VsZi5zdWJtaXR0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZGlzYWJsZWRTZWxlY3RQYXJhbShwYXJhbSkge1xyXG4gICAgICBpZighcGFyYW0uX2lkKSByZXR1cm47XHJcbiAgICAgIGlmKHBhcmFtLmlzRW5hYmxlKSB7XHJcbiAgICAgICAgbGV0IHRvdGFsID0gMDtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkUGFyYW1zLm1hcChwID0+IHtcclxuICAgICAgICAgIGlmKHAuaXNFbmFibGUpIHRvdGFsICsrO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmKHRvdGFsIDw9IDEpIHJldHVybiBzd2VldEVycm9yKFwi5LiN5YWB6K645bGP6JS95omA5pyJ6KeE5qC8XCIpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBwYXJhbS5pc0VuYWJsZSA9ICFwYXJhbS5pc0VuYWJsZTtcclxuICAgIH0sXHJcbiAgICBpbml0VGltZSgpIHtcclxuICAgICAgJCgnLnRpbWUnKS5kYXRldGltZXBpY2tlcih7XHJcbiAgICAgICAgbGFuZ3VhZ2U6ICAnemgtQ04nLFxyXG4gICAgICAgIGZvcm1hdDogJ3l5eXktbW0tZGQgaGg6aWknLFxyXG4gICAgICAgIGF1dG9jbG9zZTogdHJ1ZSxcclxuICAgICAgICB0b2RheUhpZ2hsaWdodDogMSxcclxuICAgICAgICBzdGFydFZpZXc6IDIsXHJcbiAgICAgICAgbWluVmlldzogMCxcclxuICAgICAgICBmb3JjZVBhcnNlOiAwXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdFBpY3R1cmVzKGluZGV4KSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBpZighd2luZG93LlNlbGVjdFJlc291cmNlKSB7XHJcbiAgICAgICAgd2luZG93LlNlbGVjdFJlc291cmNlID0gbmV3IE5LQy5tb2R1bGVzLlNlbGVjdFJlc291cmNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgU2VsZWN0UmVzb3VyY2Uub3BlbihkYXRhID0+IHtcclxuICAgICAgICBpZighW1wicG5nXCIsIFwianBnXCIsIFwianBlZ1wiXS5pbmNsdWRlcyhkYXRhLnJlc291cmNlc1swXS5leHQpKSByZXR1cm4gc3dlZXRJbmZvKFwi5LuF5pSv5oyBcG5n44CBanBn5ZKManBlZ+agvOW8j+eahOWbvueJh1wiKTtcclxuICAgICAgICBWdWUuc2V0KHNlbGYuaW1nSW50cm9kdWN0aW9ucywgaW5kZXgsIGRhdGEucmVzb3VyY2VzSWRbMF0pO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgYWxsb3dlZEV4dDogW1wicGljdHVyZVwiXSxcclxuICAgICAgICBjb3VudExpbWl0OiAxXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgY2hhbmdlQXJySW5kZXgoYXJyLCBpbmRleCwgdCkge1xyXG4gICAgICBjb25zdCBpID0gYXJyW2luZGV4XTtcclxuICAgICAgY29uc3QgbGVuZ3RoID0gYXJyLmxlbmd0aDtcclxuICAgICAgbGV0IG90aGVySW5kZXg7XHJcbiAgICAgIGlmKHQgPT09IFwibGVmdFwiKSB7XHJcbiAgICAgICAgaWYoaW5kZXggPT09IDApIHJldHVybjtcclxuICAgICAgICBvdGhlckluZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKGluZGV4ICsgMSA9PT0gbGVuZ3RoKSByZXR1cm47XHJcbiAgICAgICAgb3RoZXJJbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBvdGhlciA9IGFycltvdGhlckluZGV4XTtcclxuICAgICAgVnVlLnNldChhcnIsIGluZGV4LCBvdGhlcik7XHJcbiAgICAgIFZ1ZS5zZXQoYXJyLCBvdGhlckluZGV4LCBpKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVQaWN0dXJlKGluZGV4KSB7XHJcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHliKDpmaTlvZPliY3llYblk4Hlm77niYfvvJ9cIilcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBWdWUuc2V0KHRoaXMuaW1nSW50cm9kdWN0aW9ucywgaW5kZXgsIFwiXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7fSlcclxuICAgICAgXHJcbiAgICB9LFxyXG4gICAgcmVsb2FkVGVtcGxhdGUoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBua2NBUEkoXCIvc2hvcC9tYW5hZ2Uvc2V0dGluZ3NcIiwgXCJHRVRcIilcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYuZGVmYXVsdFRlbXBsYXRlcyA9IGRhdGEuZGVhbEluZm8udGVtcGxhdGVzO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5Yi35paw5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIGFkZFRlbXBsYXRlKCkge1xyXG4gICAgICB0aGlzLmZyZWlnaHRUZW1wbGF0ZXMucHVzaCh7XHJcbiAgICAgICAgbmFtZTogXCJcIixcclxuICAgICAgICBmaXJzdFByaWNlOiBcIlwiLFxyXG4gICAgICAgIGFkZFByaWNlOiBcIlwiXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZUZyb21BcnIoYXJyLCBpbmRleCkge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3RUZW1wbGF0ZSh0KSB7XHJcbiAgICAgIGlmKHRoaXMuZnJlaWdodFRlbXBsYXRlTmFtZXMuaW5jbHVkZXModC5uYW1lKSkgcmV0dXJuO1xyXG4gICAgICB0aGlzLmZyZWlnaHRUZW1wbGF0ZXMucHVzaChPYmplY3QuYXNzaWduKHt9LCB0KSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlS2V5d29yZChpbmRleCkge1xyXG4gICAgICB0aGlzLmtleXdvcmRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0Rm9ydW0oKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBTZWxlY3RGb3J1bXMub3BlbihkYXRhID0+IHtcclxuICAgICAgICBzZWxmLm1haW5Gb3J1bXMgPSBkYXRhLm9yaWdpbkZvcnVtcztcclxuICAgICAgICBTZWxlY3RGb3J1bXMuY2xvc2UoKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIGZvcnVtQ291bnRMaW1pdDogMSxcclxuICAgICAgICBoaWRlTW92ZVR5cGU6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBhZGRLZXl3b3JkcygpIHtcclxuICAgICAgQ29tbW9uTW9kYWwub3BlbihkYXRhID0+IHtcclxuICAgICAgICBsZXQga2V5d29yZHMgPSBkYXRhWzBdLnZhbHVlO1xyXG4gICAgICAgIGtleXdvcmRzID0ga2V5d29yZHMucmVwbGFjZSgv77yML2csIFwiLFwiKTtcclxuICAgICAgICBrZXl3b3JkcyA9IGtleXdvcmRzLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgICBrZXl3b3Jkcy5tYXAoayA9PiB7XHJcbiAgICAgICAgICBrID0gayB8fCBcIlwiO1xyXG4gICAgICAgICAgayA9IGsudHJpbSgpO1xyXG4gICAgICAgICAgaWYoayAmJiAhYXJyLmluY2x1ZGVzKGspKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKGspO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5rZXl3b3JkcyA9IGFycjtcclxuICAgICAgICBDb21tb25Nb2RhbC5jbG9zZSgpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwi5re75Yqg5YWz6ZSu6K+NXCIsXHJcbiAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBkb206IFwidGV4dGFyZWFcIixcclxuICAgICAgICAgICAgbGFiZWw6IFwi5aSa5Liq5YWz6ZSu6K+N5Lul6YCX5Y+35YiG6ZqUXCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLmtleXdvcmRzLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICByZW1vdmVQYXJhbUF0dHJpYnV0ZShpbmRleCkge1xyXG4gICAgICB0aGlzLnBhcmFtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIHJlc2V0UGFyYW1Gb3J1bSgpIHtcclxuICAgICAgdGhpcy5wYXJhbXMgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFsdWU6IFwiXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlU2VsZWN0UGFyYW0oaW5kZXgpIHtcclxuICAgICAgdGhpcy5zZWxlY3RlZFBhcmFtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIGFkZFBhcmFtKHBhcmFtKSB7XHJcbiAgICAgIHBhcmFtID0gcGFyYW0gJiYgcGFyYW0ubmFtZT8gcGFyYW0gOiB0aGlzLm5ld1BhcmFtKCk7XHJcbiAgICAgIHRoaXMuc2VsZWN0ZWRQYXJhbXMucHVzaChwYXJhbSk7XHJcbiAgICB9LFxyXG4gICAgbmV3UGFyYW0obmFtZSkge1xyXG4gICAgICBpZighbmFtZSkge1xyXG4gICAgICAgIGlmKCF0aGlzLnNlbGVjdGVkUGFyYW1zLmxlbmd0aCkgbmFtZSA9IFwi6buY6K6kXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmFtZSA9IFwiXCI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lLFxyXG4gICAgICAgIG9yaWdpblByaWNlOiBcIlwiLFxyXG4gICAgICAgIHByaWNlOiBcIlwiLFxyXG4gICAgICAgIGlzRW5hYmxlOiB0cnVlLFxyXG4gICAgICAgIHVzZURpc2NvdW50OiBmYWxzZSxcclxuICAgICAgICBzdG9ja3NUb3RhbDogXCJcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWRkUGFyYW1zKCkge1xyXG4gICAgICB0aGlzLnJlc2V0UGFyYW1Gb3J1bSgpO1xyXG4gICAgICB0aGlzLnBhcmFtRm9ydW0gPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGFkZFBhcmFtQXR0cmlidXRlKCkge1xyXG4gICAgICB0aGlzLnBhcmFtcy5wdXNoKHtcclxuICAgICAgICB2YWx1ZTogXCJcIlxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlUGFyYW1BdHRyaWJ1dGUoKSB7XHJcbiAgICAgIGNvbnN0IHtwYXJhbUF0dHJpYnV0ZXN9ID0gdGhpcztcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGlmKCFwYXJhbUF0dHJpYnV0ZXMubGVuZ3RoKSByZXR1cm4gc3dlZXRFcnJvcihcIuivt+iHs+WwkeWhq+WGmeS4gOS4quWxnuaAp+WAvFwiKTtcclxuICAgICAgcGFyYW1BdHRyaWJ1dGVzLm1hcChuYW1lID0+IHtcclxuICAgICAgICBzZWxmLmFkZFBhcmFtKHNlbGYubmV3UGFyYW0obmFtZSkpO1xyXG4gICAgICB9KVxyXG4gICAgICB0aGlzLnBhcmFtRm9ydW0gPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuLy8g55uR5ZCs6aG16Z2i5YWz6Zet77yM5o+Q56S65L+d5a2Y6I2J56i/XHJcbndpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmKGFwcC5zaG93Q2xvc2VJbmZvKXtcclxuICAgIHJldHVybiBcIuWFs+mXremhtemdouWQju+8jOW3suWhq+WGmeeahOWGheWuueWwhuS8muS4ouWkseOAguehruWumuimgeWFs+mXreW9k+WJjemhtemdou+8n1wiXHJcbiAgfVxyXG59OyJdfQ==
