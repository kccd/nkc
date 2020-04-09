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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3AvbWFuYWdlL3NoZWxmL3NoZWxmLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7SUFFTyxNLEdBQTZCLEksQ0FBN0IsTTtJQUFRLFEsR0FBcUIsSSxDQUFyQixRO0lBQVUsTyxHQUFXLEksQ0FBWCxPO0FBRXpCLElBQU0sY0FBYyxHQUFHLEVBQXZCO0FBRUEsSUFBTSxhQUFhLEdBQUc7QUFDcEIsRUFBQSxNQUFNLEVBQUUsS0FEWTtBQUVwQixFQUFBLEtBQUssRUFBRTtBQUZhLENBQXRCO0FBS0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsR0FBbkIsQ0FBdUIsVUFBQSxDQUFDLEVBQUk7QUFDMUIsRUFBQSxDQUFDLENBQUMsVUFBRixHQUFlLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBSCxDQUF6QjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFFBQUYsR0FBYSxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQUgsQ0FBdkI7QUFDRCxDQUhEOztBQUtBLElBQUcsT0FBSCxFQUFZO0FBQ1YsRUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixHQUFwQixDQUF3QixVQUFBLENBQUM7QUFBQSxXQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBSCxDQUFkLEdBQTZCLENBQWpDO0FBQUEsR0FBekI7O0FBQ0EsTUFBRyxPQUFPLENBQUMsa0JBQVIsSUFBOEIsQ0FBQyxDQUFsQyxFQUFxQztBQUNuQyxJQUFBLGFBQWEsQ0FBQyxNQUFkLEdBQXVCLEtBQXZCO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsSUFBQSxhQUFhLENBQUMsTUFBZCxHQUF1QixJQUF2QjtBQUNBLElBQUEsYUFBYSxDQUFDLEtBQWQsR0FBc0IsT0FBTyxDQUFDLGtCQUE5QjtBQUNE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QUNWLFdBQUssZUFBTDtBQUNBLFdBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNELEtBeFVNO0FBeVVQLElBQUEsaUJBelVPLCtCQXlVYTtBQUNsQixXQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCO0FBQ2YsUUFBQSxLQUFLLEVBQUU7QUFEUSxPQUFqQjtBQUdELEtBN1VNO0FBOFVQLElBQUEsa0JBOVVPLGdDQThVYztBQUFBLFVBQ1osZUFEWSxHQUNPLElBRFAsQ0FDWixlQURZO0FBRW5CLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxVQUFHLENBQUMsZUFBZSxDQUFDLE1BQXBCLEVBQTRCLE9BQU8sVUFBVSxDQUFDLFlBQUQsQ0FBakI7QUFDNUIsTUFBQSxlQUFlLENBQUMsR0FBaEIsQ0FBb0IsVUFBQSxJQUFJLEVBQUk7QUFDMUIsUUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFkO0FBQ0QsT0FGRDtBQUdBLFdBQUssVUFBTCxHQUFrQixLQUFsQjtBQUNEO0FBdFZNO0FBMUhVLENBQVIsQ0FBYixDLENBb2RBOztBQUNBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLFlBQVc7QUFDakMsTUFBRyxHQUFHLENBQUMsYUFBUCxFQUFxQjtBQUNuQixXQUFPLDZCQUFQO0FBQ0Q7QUFDRixDQUpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuXHJcbmNvbnN0IHtncmFkZXMsIGRlYWxJbmZvLCBwcm9kdWN0fSA9IGRhdGE7XHJcblxyXG5jb25zdCB2aXBEaXNHcm91cE9iaiA9IHt9O1xyXG5cclxuY29uc3QgcHVyY2hhc2VMaW1pdCA9IHtcclxuICBzdGF0dXM6IGZhbHNlLFxyXG4gIGNvdW50OiAyXHJcbn07XHJcblxyXG5kZWFsSW5mby50ZW1wbGF0ZXMubWFwKHQgPT4ge1xyXG4gIHQuZmlyc3RQcmljZSA9IHBhcnNlRmxvYXQodC5maXJzdFByaWNlKTtcclxuICB0LmFkZFByaWNlID0gcGFyc2VGbG9hdCh0LmFkZFByaWNlKTtcclxufSlcclxuXHJcbmlmKHByb2R1Y3QpIHtcclxuICBwcm9kdWN0LnZpcERpc0dyb3VwLm1hcCh2ID0+IHZpcERpc0dyb3VwT2JqW3YudmlwTGV2ZWxdID0gdik7XHJcbiAgaWYocHJvZHVjdC5wdXJjaGFzZUxpbWl0Q291bnQgPT0gLTEpIHtcclxuICAgIHB1cmNoYXNlTGltaXQuc3RhdHVzID0gZmFsc2U7XHJcbiAgfSBlbHNlIHtcclxuICAgIHB1cmNoYXNlTGltaXQuc3RhdHVzID0gdHJ1ZTtcclxuICAgIHB1cmNoYXNlTGltaXQuY291bnQgPSBwcm9kdWN0LnB1cmNoYXNlTGltaXRDb3VudDtcclxuICB9XHJcbiAgcHJvZHVjdC5pbWdJbnRyb2R1Y3Rpb25zLmxlbmd0aCA9IDU7XHJcbiAgcHJvZHVjdC5wcm9kdWN0UGFyYW1zLm1hcChwID0+IHtcclxuICAgIHAucHJpY2UgPSBwLnByaWNlIC8gMTAwO1xyXG4gICAgcC5vcmlnaW5QcmljZSA9IHAub3JpZ2luUHJpY2UgLyAxMDA7XHJcbiAgfSk7XHJcbiAgcHJvZHVjdC5mcmVpZ2h0VGVtcGxhdGVzLm1hcCh0ID0+IHtcclxuICAgIHQuZmlyc3RQcmljZSA9IHQuZmlyc3RQcmljZSAvIDEwMDtcclxuICAgIHQuYWRkUHJpY2UgPSB0LmFkZFByaWNlIC8gMTAwO1xyXG4gIH0pO1xyXG59XHJcblxyXG5jb25zdCB2aXBEaXNHcm91cCA9IGdyYWRlcy5tYXAoZyA9PiB7XHJcbiAgY29uc3QgZ3JvdXAgPSB2aXBEaXNHcm91cE9ialtnLl9pZF07XHJcbiAgcmV0dXJuIHtcclxuICAgIHZpcExldmVsOiBnLl9pZCxcclxuICAgIGdyYWRlOiBnLFxyXG4gICAgdmlwTnVtOiBncm91cD8gZ3JvdXAudmlwTnVtOiAxMDBcclxuICB9O1xyXG59KTtcclxuXHJcblxyXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuXHJcbiAgICB0eXBlOiBwcm9kdWN0PyBcIm1vZGlmeVwiOiBcImNyZWF0ZVwiLCAvLyDmlrDkuIrmnrbvvJpjcmVhdGUsIOe8lui+ke+8mm1vZGlmeVxyXG5cclxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxyXG5cclxuICAgIHNob3dDbG9zZUluZm86IHRydWUsXHJcblxyXG4gICAgLy8g5o+Q5L6b6YCJ5oup55qE5Lqk5piT5p2/5Z2XXHJcbiAgICBzaG9wRm9ydW1zOiBkYXRhLnNob3BGb3J1bVR5cGVzLFxyXG4gICAgc2VsZWN0ZWRTaG9wRm9ydW1JZDogXCJcIixcclxuICAgIC8vIOi+heWKqeadv+Wdl1xyXG4gICAgbWFpbkZvcnVtczogW10sXHJcbiAgICAvLyDllYblk4HmoIfpopjjgIHmj4/ov7DjgIHlhbPplK7or41cclxuICAgIHRpdGxlOiBcIlwiLFxyXG4gICAgYWJzdHJhY3Q6IFwiXCIsXHJcbiAgICBjb250ZW50OiBcIlwiLFxyXG4gICAga2V5d29yZHM6IFtdLFxyXG4gICAgLy8g5ZWG5ZOB5LuL57uN5Zu+XHJcbiAgICBpbWdJbnRyb2R1Y3Rpb25zOiBwcm9kdWN0PyBwcm9kdWN0LmltZ0ludHJvZHVjdGlvbnM6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcclxuXHJcbiAgICAvLyDmt7vliqDlpJrkuKrop4TmoLxcclxuICAgIHBhcmFtRm9ydW06IGZhbHNlLFxyXG5cclxuICAgIC8vIOinhOagvOS/oeaBr1xyXG4gICAgLy8g5bey5Yu+6YCJIOaWsOeahOinhOagvOWIhuexuyAg54us56uL6KeE5qC855u05o6l5paw5bu65q2k5pWw57uE5YaFXHJcbiAgICBzZWxlY3RlZFBhcmFtczogcHJvZHVjdD9wcm9kdWN0LnByb2R1Y3RQYXJhbXM6W10sXHJcbiAgICAvLyDop4TmoLzlkI0gXHJcbiAgICAvKiBcclxuICAgIHtcclxuICAgICAgbmFtZTogXCLpopzoibJcIixcclxuICAgICAgdmFsdWVzOiBbXHJcbiAgICAgICAgXCLnuqJcIixcclxuICAgICAgICBcIum7hFwiLFxyXG4gICAgICAgIFwi6JOdXCJcclxuICAgICAgXVxyXG4gICAgfSBcclxuICAgICovXHJcbiAgICBwYXJhbXM6IFtdLFxyXG4gICAgLy8g5Lya5ZGY5oqY5omjXHJcbiAgICB2aXBEaXNHcm91cCxcclxuICAgIHZpcERpc2NvdW50OiBwcm9kdWN0PyEhcHJvZHVjdC52aXBEaXNjb3VudDogZmFsc2UsXHJcbiAgICAvLyDlh4/lupPlrZhcclxuICAgIHN0b2NrQ29zdE1ldGhvZDogcHJvZHVjdD8gcHJvZHVjdC5zdG9ja0Nvc3RNZXRob2Q6IFwib3JkZXJSZWR1Y2VTdG9ja1wiLCAvLyDkuIvljZXlh4/lupPlrZjvvJpvcmRlclJlZHVjZVN0b2Nr77yM5LuY5qy+5YeP5bqT5a2Y77yacGF5UmVkdWNlU3RvY2tcclxuICAgIC8vIOmZkOi0reebuOWFs1xyXG4gICAgcHVyY2hhc2VMaW1pdCxcclxuICAgIC8vIOi0reS5sOaXtuaYr+WQpumcgOimgeS4iuS8oOWHreivgeOAgeWHreivgeivtOaYjlxyXG4gICAgdXBsb2FkQ2VydDogcHJvZHVjdD8gISFwcm9kdWN0LnVwbG9hZENlcnQ6IGZhbHNlLFxyXG4gICAgdXBsb2FkQ2VydERlc2NyaXB0aW9uOiBwcm9kdWN0PyBwcm9kdWN0LnVwbG9hZENlcnREZXNjcmlwdGlvbjogXCJcIixcclxuXHJcbiAgICAvLyDku7fmoLzmmL7npLrnm7jlhbMgXHJcbiAgICBwcm9kdWN0U2V0dGluZ3M6IHByb2R1Y3Q/IHByb2R1Y3QucHJvZHVjdFNldHRpbmdzOiB7XHJcbiAgICAgIC8vIOa4uOWuouaYr+WQpuWPr+ingVxyXG4gICAgICBwcmljZVNob3dUb1Zpc2l0OiB0cnVlLFxyXG4gICAgICAvLyDlgZzllK7lkI7mmK/lkKblj6/op4FcclxuICAgICAgcHJpY2VTaG93QWZ0ZXJTdG9wOiB0cnVlXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIOaYr+WQpuWFjemCrui0uVxyXG4gICAgaXNGcmVlUG9zdDogcHJvZHVjdD8gISFwcm9kdWN0LmlzRnJlZVBvc3Q6IHRydWUsXHJcbiAgICAvLyDov5DotLnmqKHmnb9cclxuICAgIGRlZmF1bHRUZW1wbGF0ZXM6IGRlYWxJbmZvLnRlbXBsYXRlcyxcclxuICAgIGZyZWlnaHRUZW1wbGF0ZXM6IHByb2R1Y3Q/IHByb2R1Y3QuZnJlaWdodFRlbXBsYXRlczogW10sXHJcbiAgICAvLyDkuIrmnrbml7bpl7RcclxuICAgIHNoZWxmVHlwZTogXCJpbW1lZGlhdGVseVwiLCAvLyDnq4vljbPkuIrmnrbvvJppbW1lZGlhdGVsee+8jHRpbWluZzog5a6a5pe25LiK5p6277yMc2F2ZTog5pqC5a2Y5LiN5Y+R5biDXHJcbiAgICBzaGVsZlRpbWU6IFwiXCJcclxuXHJcbiAgfSxcclxuICB3YXRjaDoge1xyXG4gICAgc2hlbGZUeXBlKCkge1xyXG4gICAgICB0aGlzLmluaXRUaW1lKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgLy8g57yW6L6R5ZWG5ZOBIOmihOWItuWGheWuuVxyXG4gICAgaWYocHJvZHVjdCkge1xyXG4gICAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdpbmRvdy5Db21tb25Nb2RhbCA9IG5ldyBOS0MubW9kdWxlcy5Db21tb25Nb2RhbCgpO1xyXG4gICAgICB3aW5kb3cuU2VsZWN0Rm9ydW1zID0gbmV3IE5LQy5tb2R1bGVzLk1vdmVUaHJlYWQoKTtcclxuICAgICAgd2luZG93LmVkaXRvciA9IFVFLmdldEVkaXRvcignY29udGFpbmVyJywgTktDLmNvbmZpZ3MudWVkaXRvci5zaG9wQ29uZmlncyk7XHJcbiAgICAgIHRoaXMuaW5pdFRpbWUoKTtcclxuICAgICAgdGhpcy5hZGRQYXJhbSgpO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBzZWxlY3RlZFNob3BGb3J1bSgpIHtcclxuICAgICAgaWYodGhpcy5zZWxlY3RlZFNob3BGb3J1bSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkU2hvcEZvcnVtLmZpZDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGltZ01hc3RlcigpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaW1nSW50cm9kdWN0aW9uc1swXTtcclxuICAgIH0sXHJcbiAgICBwYXJhbUF0dHJpYnV0ZXMoKSB7XHJcbiAgICAgIGNvbnN0IHtwYXJhbXN9ID0gdGhpcztcclxuICAgICAgbGV0IGFyciA9IFtdO1xyXG4gICAgICBwYXJhbXMubWFwKHAgPT4ge1xyXG4gICAgICAgIHAgPSBwLnZhbHVlLnJlcGxhY2UoL++8jC9nLCBcIixcIik7XHJcbiAgICAgICAgcCA9IHAuc3BsaXQoXCIsXCIpO1xyXG4gICAgICAgIHAgPSBwLm1hcCh2ID0+ICh2ICsgXCJcIikudHJpbSgpKVxyXG4gICAgICAgIHAgPSBwLmZpbHRlcih2ID0+ICEhdik7XHJcbiAgICAgICAgaWYocC5sZW5ndGgpIHtcclxuICAgICAgICAgIGFyci5wdXNoKHApXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcbiAgICAgIGFyciA9IE5LQy5tZXRob2RzLmRvRXhjaGFuZ2UoYXJyKTtcclxuICAgICAgYXJyID0gYXJyLm1hcChhID0+IHtcclxuICAgICAgICBpZihBcnJheS5pc0FycmF5KGEpKSB7XHJcbiAgICAgICAgICBhID0gYS5qb2luKFwiLCBcIik7ICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGE7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyXHJcbiAgICB9LFxyXG4gICAgZnJlaWdodFRlbXBsYXRlTmFtZXMoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZyZWlnaHRUZW1wbGF0ZXMubWFwKGYgPT4gZi5uYW1lKTtcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBjb25zdCB7Y2hlY2tOdW1iZXIsIGNoZWNrU3RyaW5nfSA9IE5LQy5tZXRob2RzLmNoZWNrRGF0YTtcclxuICAgICAgY29uc3QgYm9keSA9IHt9O1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHNlbGYuc3VibWl0dGluZyA9IHRydWU7XHJcbiAgICAgICAgICBpZihzZWxmLnR5cGUgPT09IFwiY3JlYXRlXCIpIHtcclxuICAgICAgICAgICAgc2VsZi5jb250ZW50ID0gZWRpdG9yLmdldENvbnRlbnQoKTtcclxuICAgICAgICAgICAgaWYoIXNlbGYuc2VsZWN0ZWRTaG9wRm9ydW1JZCkgdGhyb3cgXCLor7fpgInmi6nllYblk4HliIbnsbtcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYubWFpbkZvcnVtcy5sZW5ndGgpIHRocm93IFwi6K+36YCJ5oup5ZWG5ZOB6L6F5Yqp5YiG57G7XCI7XHJcbiAgICAgICAgICAgIGJvZHkubWFpbkZvcnVtc0lkID0gW3NlbGYuc2VsZWN0ZWRTaG9wRm9ydW1JZF0uY29uY2F0KHNlbGYubWFpbkZvcnVtcy5tYXAoZm9ydW0gPT4gZm9ydW0uZmlkKSk7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKHNlbGYudGl0bGUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIuWVhuWTgeagh+mimFwiLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogNixcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYm9keS5wcm9kdWN0TmFtZSA9IHNlbGYudGl0bGU7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKHNlbGYuYWJzdHJhY3QsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIuWVhuWTgeeugOS7i1wiLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogNixcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMDAsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LnByb2R1Y3REZXNjcmlwdGlvbiA9IHNlbGYuYWJzdHJhY3Q7XHJcbiAgICAgICAgICAgIHNlbGYua2V5d29yZHMubWFwKGsgPT4ge1xyXG4gICAgICAgICAgICAgIGNoZWNrU3RyaW5nKGssIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi5YWz6ZSu6K+NXCIsXHJcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDIwXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LmF0dGVudGlvbiA9IHNlbGYua2V5d29yZHM7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKHNlbGYuY29udGVudCwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi5Zu+5paH5o+P6L+wXCIsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwMDAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LnByb2R1Y3REZXRhaWxzID0gc2VsZi5jb250ZW50O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8g5Yik5pat5ZWG5ZOB5Zu+XHJcbiAgICAgICAgICBjb25zdCBwaWN0dXJlc0lkID0gc2VsZi5pbWdJbnRyb2R1Y3Rpb25zLmZpbHRlcihpID0+ICEhaSk7XHJcbiAgICAgICAgICBpZighcGljdHVyZXNJZC5sZW5ndGgpIHRocm93IFwi6K+36Iez5bCR6YCJ5oup5LiA5byg5ZWG5ZOB5Zu+XCI7XHJcbiAgICAgICAgICBib2R5LmltZ0ludHJvZHVjdGlvbnMgPSBwaWN0dXJlc0lkO1xyXG4gICAgICAgICAgLy8g5Yik5pat5ZWG5ZOB6KeE5qC8XHJcbiAgICAgICAgICBsZXQgcHJvZHVjdFBhcmFtcyA9IFtdO1xyXG4gICAgICAgICAgcHJvZHVjdFBhcmFtcyA9IHNlbGYuc2VsZWN0ZWRQYXJhbXM7XHJcbiAgICAgICAgICBpZighcHJvZHVjdFBhcmFtcy5sZW5ndGgpIHRocm93IFwi6K+36Iez5bCR5re75Yqg5LiA5Liq5ZWG5ZOB6KeE5qC8XCI7XHJcbiAgICAgICAgICBwcm9kdWN0UGFyYW1zLm1hcChwYXJhbSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgICBuYW1lLCBvcmlnaW5QcmljZSxcclxuICAgICAgICAgICAgICBwcmljZSwgdXNlRGlzY291bnQsXHJcbiAgICAgICAgICAgICAgc3RvY2tzVG90YWxcclxuICAgICAgICAgICAgfSA9IHBhcmFtO1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhuYW1lLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLop4TmoLzlkI3np7BcIixcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoZWNrTnVtYmVyKHN0b2Nrc1RvdGFsLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLop4TmoLzlupPlrZhcIixcclxuICAgICAgICAgICAgICBtaW46IDBcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNoZWNrTnVtYmVyKG9yaWdpblByaWNlLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLop4TmoLzku7fmoLxcIixcclxuICAgICAgICAgICAgICBtaW46IDAuMDEsXHJcbiAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmKHVzZURpc2NvdW50KSB7XHJcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIocHJpY2UsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi6KeE5qC85LyY5oOg5Lu3XCIsXHJcbiAgICAgICAgICAgICAgICBtaW46IDAuMDEsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmKHByaWNlID49IG9yaWdpblByaWNlKSB0aHJvdyBcIuinhOagvOS8mOaDoOS7t+W/hemhu+Wwj+S6juWOn+S7t1wiOyAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYm9keS5wcm9kdWN0UGFyYW1zID0gcHJvZHVjdFBhcmFtcztcclxuICAgICAgICAgIGJvZHkudmlwRGlzR3JvdXAgPSBbXTtcclxuICAgICAgICAgIC8vIOS8muWRmOaKmOaJo1xyXG4gICAgICAgICAgaWYoc2VsZi52aXBEaXNjb3VudCkge1xyXG4gICAgICAgICAgICBzZWxmLnZpcERpc0dyb3VwLm1hcCh2ID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB7dmlwTnVtfSA9IHY7XHJcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIodmlwTnVtLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuaKmOaJo+eOh1wiLFxyXG4gICAgICAgICAgICAgICAgbWluOiAxLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxMDBcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJvZHkudmlwRGlzR3JvdXAgPSBzZWxmLnZpcERpc0dyb3VwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYm9keS52aXBEaXNjb3VudCA9IHNlbGYudmlwRGlzY291bnQ7XHJcbiAgICAgICAgICAvLyDov5DotLlcclxuICAgICAgICAgIGlmKCFzZWxmLmlzRnJlZVBvc3QpIHtcclxuICAgICAgICAgICAgaWYoIXNlbGYuZnJlaWdodFRlbXBsYXRlcy5sZW5ndGgpIHRocm93IFwi6K+36Iez5bCR5re75Yqg5LiA5p2h6L+Q6LS55L+h5oGvXCI7XHJcbiAgICAgICAgICAgIHNlbGYuZnJlaWdodFRlbXBsYXRlcy5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qge25hbWUsIGZpcnN0UHJpY2UsIGFkZFByaWNlfSA9IGY7XHJcbiAgICAgICAgICAgICAgY2hlY2tTdHJpbmcobmFtZSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLnianmtYHlkI3np7BcIixcclxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIoZmlyc3RQcmljZSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLnianmtYHpppbku7bku7fmoLxcIixcclxuICAgICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIoYWRkUHJpY2UsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi54mp5rWB5q+P5aKe5Yqg5LiA5Lu255qE5Lu35qC8XCIsXHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYm9keS5mcmVpZ2h0VGVtcGxhdGVzID0gc2VsZi5mcmVpZ2h0VGVtcGxhdGVzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYm9keS5pc0ZyZWVQb3N0ID0gISFzZWxmLmlzRnJlZVBvc3Q7XHJcbiAgICAgICAgICAvLyDku7fmoLzmmL7npLpcclxuICAgICAgICAgIGJvZHkucHJvZHVjdFNldHRpbmdzID0gc2VsZi5wcm9kdWN0U2V0dGluZ3M7XHJcbiAgICAgICAgICAvLyDlupPlrZhcclxuICAgICAgICAgIGJvZHkuc3RvY2tDb3N0TWV0aG9kID0gc2VsZi5zdG9ja0Nvc3RNZXRob2Q7XHJcbiAgICAgICAgICAvLyDotK3kubDpmZDliLZcclxuICAgICAgICAgIGlmKHNlbGYucHVyY2hhc2VMaW1pdC5zdGF0dXMpIHtcclxuICAgICAgICAgICAgY2hlY2tOdW1iZXIoc2VsZi5wdXJjaGFzZUxpbWl0LmNvdW50LCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLpmZDotK3mlbDph49cIixcclxuICAgICAgICAgICAgICBtaW46IDFcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJvZHkucHVyY2hhc2VMaW1pdENvdW50ID0gc2VsZi5wdXJjaGFzZUxpbWl0LmNvdW50O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm9keS5wdXJjaGFzZUxpbWl0Q291bnQgPSAtMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIOi0reS5sOWHreivgVxyXG4gICAgICAgICAgaWYoc2VsZi51cGxvYWRDZXJ0KSB7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKHNlbGYudXBsb2FkQ2VydERlc2NyaXB0aW9uLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLlh63or4Hor7TmmI5cIixcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LnVwbG9hZENlcnREZXNjcmlwdGlvbiA9IHNlbGYudXBsb2FkQ2VydERlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYm9keS51cGxvYWRDZXJ0ID0gc2VsZi51cGxvYWRDZXJ0O1xyXG4gICAgICAgICAgaWYoc2VsZi50eXBlID09PSBcImNyZWF0ZVwiKSB7XHJcbiAgICAgICAgICAgIC8vIOS4iuaetuaXtumXtFxyXG4gICAgICAgICAgICBpZihzZWxmLnNoZWxmVHlwZSA9PT0gXCJpbW1lZGlhdGVseVwiKSB7XHJcbiAgICAgICAgICAgICAgYm9keS5wcm9kdWN0U3RhdHVzID0gXCJpbnNhbGVcIjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKHNlbGYuc2hlbGZUeXBlID09PSBcInNhdmVcIikge1xyXG4gICAgICAgICAgICAgIGJvZHkucHJvZHVjdFN0YXR1cyA9IFwibm90b25zaGVsZlwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGJvZHkucHJvZHVjdFN0YXR1cyA9IFwibm90b25zaGVsZlwiO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGRvbSA9ICQoXCIjc2hlbGZUaW1lXCIpO1xyXG4gICAgICAgICAgICAgIGxldCBzaGVsZlRpbWUgPSBuZXcgRGF0ZShkb20udmFsKCkpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICBib2R5LnNoZWxmVGltZSA9IHNoZWxmVGltZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJvZHkucHJvZHVjdElkID0gcHJvZHVjdC5wcm9kdWN0SWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKFwiL3Nob3AvbWFuYWdlL3NoZWxmXCIsIFwiUE9TVFwiLCB7cG9zdDogIGJvZHl9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5o+Q5Lqk5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgc2VsZi5zdWJtaXR0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBzZWxmLnNob3dDbG9zZUluZm8gPSBmYWxzZTtcclxuICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKFwiL3Nob3AvbWFuYWdlL2dvb2RzXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBzZWxmLnN1Ym1pdHRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBkaXNhYmxlZFNlbGVjdFBhcmFtKHBhcmFtKSB7XHJcbiAgICAgIGlmKCFwYXJhbS5faWQpIHJldHVybjtcclxuICAgICAgaWYocGFyYW0uaXNFbmFibGUpIHtcclxuICAgICAgICBsZXQgdG90YWwgPSAwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRQYXJhbXMubWFwKHAgPT4ge1xyXG4gICAgICAgICAgaWYocC5pc0VuYWJsZSkgdG90YWwgKys7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYodG90YWwgPD0gMSkgcmV0dXJuIHN3ZWV0RXJyb3IoXCLkuI3lhYHorrjlsY/olL3miYDmnInop4TmoLxcIik7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHBhcmFtLmlzRW5hYmxlID0gIXBhcmFtLmlzRW5hYmxlO1xyXG4gICAgfSxcclxuICAgIGluaXRUaW1lKCkge1xyXG4gICAgICAkKCcudGltZScpLmRhdGV0aW1lcGlja2VyKHtcclxuICAgICAgICBsYW5ndWFnZTogICd6aC1DTicsXHJcbiAgICAgICAgZm9ybWF0OiAneXl5eS1tbS1kZCBoaDppaScsXHJcbiAgICAgICAgYXV0b2Nsb3NlOiB0cnVlLFxyXG4gICAgICAgIHRvZGF5SGlnaGxpZ2h0OiAxLFxyXG4gICAgICAgIHN0YXJ0VmlldzogMixcclxuICAgICAgICBtaW5WaWV3OiAwLFxyXG4gICAgICAgIGZvcmNlUGFyc2U6IDBcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0UGljdHVyZXMoaW5kZXgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGlmKCF3aW5kb3cuU2VsZWN0UmVzb3VyY2UpIHtcclxuICAgICAgICB3aW5kb3cuU2VsZWN0UmVzb3VyY2UgPSBuZXcgTktDLm1vZHVsZXMuU2VsZWN0UmVzb3VyY2UoKTtcclxuICAgICAgfVxyXG4gICAgICBTZWxlY3RSZXNvdXJjZS5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIGlmKCFbXCJwbmdcIiwgXCJqcGdcIiwgXCJqcGVnXCJdLmluY2x1ZGVzKGRhdGEucmVzb3VyY2VzWzBdLmV4dCkpIHJldHVybiBzd2VldEluZm8oXCLku4XmlK/mjIFwbmfjgIFqcGflkoxqcGVn5qC85byP55qE5Zu+54mHXCIpO1xyXG4gICAgICAgIFZ1ZS5zZXQoc2VsZi5pbWdJbnRyb2R1Y3Rpb25zLCBpbmRleCwgZGF0YS5yZXNvdXJjZXNJZFswXSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBhbGxvd2VkRXh0OiBbXCJwaWN0dXJlXCJdLFxyXG4gICAgICAgIGNvdW50TGltaXQ6IDFcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBjaGFuZ2VBcnJJbmRleChhcnIsIGluZGV4LCB0KSB7XHJcbiAgICAgIGNvbnN0IGkgPSBhcnJbaW5kZXhdO1xyXG4gICAgICBjb25zdCBsZW5ndGggPSBhcnIubGVuZ3RoO1xyXG4gICAgICBsZXQgb3RoZXJJbmRleDtcclxuICAgICAgaWYodCA9PT0gXCJsZWZ0XCIpIHtcclxuICAgICAgICBpZihpbmRleCA9PT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIG90aGVySW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYoaW5kZXggKyAxID09PSBsZW5ndGgpIHJldHVybjtcclxuICAgICAgICBvdGhlckluZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG90aGVyID0gYXJyW290aGVySW5kZXhdO1xyXG4gICAgICBWdWUuc2V0KGFyciwgaW5kZXgsIG90aGVyKTtcclxuICAgICAgVnVlLnNldChhcnIsIG90aGVySW5kZXgsIGkpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZVBpY3R1cmUoaW5kZXgpIHtcclxuICAgICAgc3dlZXRRdWVzdGlvbihcIuehruWumuimgeWIoOmZpOW9k+WJjeWVhuWTgeWbvueJh++8n1wiKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIFZ1ZS5zZXQodGhpcy5pbWdJbnRyb2R1Y3Rpb25zLCBpbmRleCwgXCJcIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHt9KVxyXG4gICAgICBcclxuICAgIH0sXHJcbiAgICByZWxvYWRUZW1wbGF0ZSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIG5rY0FQSShcIi9zaG9wL21hbmFnZS9zZXR0aW5nc1wiLCBcIkdFVFwiKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZi5kZWZhdWx0VGVtcGxhdGVzID0gZGF0YS5kZWFsSW5mby50ZW1wbGF0ZXM7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLliLfmlrDmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkVGVtcGxhdGUoKSB7XHJcbiAgICAgIHRoaXMuZnJlaWdodFRlbXBsYXRlcy5wdXNoKHtcclxuICAgICAgICBuYW1lOiBcIlwiLFxyXG4gICAgICAgIGZpcnN0UHJpY2U6IFwiXCIsXHJcbiAgICAgICAgYWRkUHJpY2U6IFwiXCJcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlRnJvbUFycihhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdFRlbXBsYXRlKHQpIHtcclxuICAgICAgaWYodGhpcy5mcmVpZ2h0VGVtcGxhdGVOYW1lcy5pbmNsdWRlcyh0Lm5hbWUpKSByZXR1cm47XHJcbiAgICAgIHRoaXMuZnJlaWdodFRlbXBsYXRlcy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIHQpKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVLZXl3b3JkKGluZGV4KSB7XHJcbiAgICAgIHRoaXMua2V5d29yZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3RGb3J1bSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFNlbGVjdEZvcnVtcy5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHNlbGYubWFpbkZvcnVtcyA9IGRhdGEub3JpZ2luRm9ydW1zO1xyXG4gICAgICAgIFNlbGVjdEZvcnVtcy5jbG9zZSgpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgZm9ydW1Db3VudExpbWl0OiAxLFxyXG4gICAgICAgIGhpZGVNb3ZlVHlwZTogdHJ1ZVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGFkZEtleXdvcmRzKCkge1xyXG4gICAgICBDb21tb25Nb2RhbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIGxldCBrZXl3b3JkcyA9IGRhdGFbMF0udmFsdWU7XHJcbiAgICAgICAga2V5d29yZHMgPSBrZXl3b3Jkcy5yZXBsYWNlKC/vvIwvZywgXCIsXCIpO1xyXG4gICAgICAgIGtleXdvcmRzID0ga2V5d29yZHMuc3BsaXQoXCIsXCIpO1xyXG4gICAgICAgIGNvbnN0IGFyciA9IFtdO1xyXG4gICAgICAgIGtleXdvcmRzLm1hcChrID0+IHtcclxuICAgICAgICAgIGsgPSBrIHx8IFwiXCI7XHJcbiAgICAgICAgICBrID0gay50cmltKCk7XHJcbiAgICAgICAgICBpZihrICYmICFhcnIuaW5jbHVkZXMoaykpIHtcclxuICAgICAgICAgICAgYXJyLnB1c2goayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLmtleXdvcmRzID0gYXJyO1xyXG4gICAgICAgIENvbW1vbk1vZGFsLmNsb3NlKCk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCLmt7vliqDlhbPplK7or41cIixcclxuICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGRvbTogXCJ0ZXh0YXJlYVwiLFxyXG4gICAgICAgICAgICBsYWJlbDogXCLlpJrkuKrlhbPplK7or43ku6XpgJflj7fliIbpmpRcIixcclxuICAgICAgICAgICAgdmFsdWU6IHRoaXMua2V5d29yZHMuam9pbihcIiwgXCIpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIHJlbW92ZVBhcmFtQXR0cmlidXRlKGluZGV4KSB7XHJcbiAgICAgIHRoaXMucGFyYW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgcmVzZXRQYXJhbUZvcnVtKCkge1xyXG4gICAgICB0aGlzLnBhcmFtcyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB2YWx1ZTogXCJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFsdWU6IFwiXCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICByZW1vdmVTZWxlY3RQYXJhbShpbmRleCkge1xyXG4gICAgICB0aGlzLnNlbGVjdGVkUGFyYW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgYWRkUGFyYW0ocGFyYW0pIHtcclxuICAgICAgcGFyYW0gPSBwYXJhbSAmJiBwYXJhbS5uYW1lPyBwYXJhbSA6IHRoaXMubmV3UGFyYW0oKTtcclxuICAgICAgdGhpcy5zZWxlY3RlZFBhcmFtcy5wdXNoKHBhcmFtKTtcclxuICAgIH0sXHJcbiAgICBuZXdQYXJhbShuYW1lKSB7XHJcbiAgICAgIGlmKCFuYW1lKSB7XHJcbiAgICAgICAgaWYoIXRoaXMuc2VsZWN0ZWRQYXJhbXMubGVuZ3RoKSBuYW1lID0gXCLpu5jorqRcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuYW1lID0gXCJcIjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWUsXHJcbiAgICAgICAgb3JpZ2luUHJpY2U6IFwiXCIsXHJcbiAgICAgICAgcHJpY2U6IFwiXCIsXHJcbiAgICAgICAgaXNFbmFibGU6IHRydWUsXHJcbiAgICAgICAgdXNlRGlzY291bnQ6IGZhbHNlLFxyXG4gICAgICAgIHN0b2Nrc1RvdGFsOiBcIlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhZGRQYXJhbXMoKSB7XHJcbiAgICAgIHRoaXMucmVzZXRQYXJhbUZvcnVtKCk7XHJcbiAgICAgIHRoaXMucGFyYW1Gb3J1bSA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgYWRkUGFyYW1BdHRyaWJ1dGUoKSB7XHJcbiAgICAgIHRoaXMucGFyYW1zLnB1c2goe1xyXG4gICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmVQYXJhbUF0dHJpYnV0ZSgpIHtcclxuICAgICAgY29uc3Qge3BhcmFtQXR0cmlidXRlc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgaWYoIXBhcmFtQXR0cmlidXRlcy5sZW5ndGgpIHJldHVybiBzd2VldEVycm9yKFwi6K+36Iez5bCR5aGr5YaZ5LiA5Liq5bGe5oCn5YC8XCIpO1xyXG4gICAgICBwYXJhbUF0dHJpYnV0ZXMubWFwKG5hbWUgPT4ge1xyXG4gICAgICAgIHNlbGYuYWRkUGFyYW0oc2VsZi5uZXdQYXJhbShuYW1lKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIHRoaXMucGFyYW1Gb3J1bSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyDnm5HlkKzpobXpnaLlhbPpl63vvIzmj5DnpLrkv53lrZjojYnnqL9cclxud2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYoYXBwLnNob3dDbG9zZUluZm8pe1xyXG4gICAgcmV0dXJuIFwi5YWz6Zet6aG16Z2i5ZCO77yM5bey5aGr5YaZ55qE5YaF5a655bCG5Lya5Lii5aSx44CC56Gu5a6a6KaB5YWz6Zet5b2T5YmN6aG16Z2i77yfXCJcclxuICB9XHJcbn07Il19
