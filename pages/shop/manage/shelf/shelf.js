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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3AvbWFuYWdlL3NoZWxmL3NoZWxmLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7SUFFTyxNLEdBQTZCLEksQ0FBN0IsTTtJQUFRLFEsR0FBcUIsSSxDQUFyQixRO0lBQVUsTyxHQUFXLEksQ0FBWCxPO0FBRXpCLElBQU0sY0FBYyxHQUFHLEVBQXZCO0FBRUEsSUFBTSxhQUFhLEdBQUc7QUFDcEIsRUFBQSxNQUFNLEVBQUUsS0FEWTtBQUVwQixFQUFBLEtBQUssRUFBRTtBQUZhLENBQXRCO0FBS0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsR0FBbkIsQ0FBdUIsVUFBQSxDQUFDLEVBQUk7QUFDMUIsRUFBQSxDQUFDLENBQUMsVUFBRixHQUFlLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBSCxDQUF6QjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFFBQUYsR0FBYSxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQUgsQ0FBdkI7QUFDRCxDQUhEOztBQUtBLElBQUcsT0FBSCxFQUFZO0FBQ1YsRUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixHQUFwQixDQUF3QixVQUFBLENBQUM7QUFBQSxXQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBSCxDQUFkLEdBQTZCLENBQWpDO0FBQUEsR0FBekI7O0FBQ0EsTUFBRyxPQUFPLENBQUMsa0JBQVIsSUFBOEIsQ0FBQyxDQUFsQyxFQUFxQztBQUNuQyxJQUFBLGFBQWEsQ0FBQyxNQUFkLEdBQXVCLEtBQXZCO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsSUFBQSxhQUFhLENBQUMsTUFBZCxHQUF1QixJQUF2QjtBQUNBLElBQUEsYUFBYSxDQUFDLEtBQWQsR0FBc0IsT0FBTyxDQUFDLGtCQUE5QjtBQUNE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QUNWLFdBQUssZUFBTDtBQUNBLFdBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNELEtBeFVNO0FBeVVQLElBQUEsaUJBelVPLCtCQXlVYTtBQUNsQixXQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCO0FBQ2YsUUFBQSxLQUFLLEVBQUU7QUFEUSxPQUFqQjtBQUdELEtBN1VNO0FBOFVQLElBQUEsa0JBOVVPLGdDQThVYztBQUFBLFVBQ1osZUFEWSxHQUNPLElBRFAsQ0FDWixlQURZO0FBRW5CLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxVQUFHLENBQUMsZUFBZSxDQUFDLE1BQXBCLEVBQTRCLE9BQU8sVUFBVSxDQUFDLFlBQUQsQ0FBakI7QUFDNUIsTUFBQSxlQUFlLENBQUMsR0FBaEIsQ0FBb0IsVUFBQSxJQUFJLEVBQUk7QUFDMUIsUUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFkO0FBQ0QsT0FGRDtBQUdBLFdBQUssVUFBTCxHQUFrQixLQUFsQjtBQUNEO0FBdFZNO0FBMUhVLENBQVIsQ0FBYixDLENBb2RBOztBQUNBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLFlBQVc7QUFDakMsTUFBRyxHQUFHLENBQUMsYUFBUCxFQUFxQjtBQUNuQixXQUFPLDZCQUFQO0FBQ0Q7QUFDRixDQUpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcblxuY29uc3Qge2dyYWRlcywgZGVhbEluZm8sIHByb2R1Y3R9ID0gZGF0YTtcblxuY29uc3QgdmlwRGlzR3JvdXBPYmogPSB7fTtcblxuY29uc3QgcHVyY2hhc2VMaW1pdCA9IHtcbiAgc3RhdHVzOiBmYWxzZSxcbiAgY291bnQ6IDJcbn07XG5cbmRlYWxJbmZvLnRlbXBsYXRlcy5tYXAodCA9PiB7XG4gIHQuZmlyc3RQcmljZSA9IHBhcnNlRmxvYXQodC5maXJzdFByaWNlKTtcbiAgdC5hZGRQcmljZSA9IHBhcnNlRmxvYXQodC5hZGRQcmljZSk7XG59KVxuXG5pZihwcm9kdWN0KSB7XG4gIHByb2R1Y3QudmlwRGlzR3JvdXAubWFwKHYgPT4gdmlwRGlzR3JvdXBPYmpbdi52aXBMZXZlbF0gPSB2KTtcbiAgaWYocHJvZHVjdC5wdXJjaGFzZUxpbWl0Q291bnQgPT0gLTEpIHtcbiAgICBwdXJjaGFzZUxpbWl0LnN0YXR1cyA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHB1cmNoYXNlTGltaXQuc3RhdHVzID0gdHJ1ZTtcbiAgICBwdXJjaGFzZUxpbWl0LmNvdW50ID0gcHJvZHVjdC5wdXJjaGFzZUxpbWl0Q291bnQ7XG4gIH1cbiAgcHJvZHVjdC5pbWdJbnRyb2R1Y3Rpb25zLmxlbmd0aCA9IDU7XG4gIHByb2R1Y3QucHJvZHVjdFBhcmFtcy5tYXAocCA9PiB7XG4gICAgcC5wcmljZSA9IHAucHJpY2UgLyAxMDA7XG4gICAgcC5vcmlnaW5QcmljZSA9IHAub3JpZ2luUHJpY2UgLyAxMDA7XG4gIH0pO1xuICBwcm9kdWN0LmZyZWlnaHRUZW1wbGF0ZXMubWFwKHQgPT4ge1xuICAgIHQuZmlyc3RQcmljZSA9IHQuZmlyc3RQcmljZSAvIDEwMDtcbiAgICB0LmFkZFByaWNlID0gdC5hZGRQcmljZSAvIDEwMDtcbiAgfSk7XG59XG5cbmNvbnN0IHZpcERpc0dyb3VwID0gZ3JhZGVzLm1hcChnID0+IHtcbiAgY29uc3QgZ3JvdXAgPSB2aXBEaXNHcm91cE9ialtnLl9pZF07XG4gIHJldHVybiB7XG4gICAgdmlwTGV2ZWw6IGcuX2lkLFxuICAgIGdyYWRlOiBnLFxuICAgIHZpcE51bTogZ3JvdXA/IGdyb3VwLnZpcE51bTogMTAwXG4gIH07XG59KTtcblxuXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XG4gIGVsOiBcIiNhcHBcIixcbiAgZGF0YToge1xuXG4gICAgdHlwZTogcHJvZHVjdD8gXCJtb2RpZnlcIjogXCJjcmVhdGVcIiwgLy8g5paw5LiK5p6277yaY3JlYXRlLCDnvJbovpHvvJptb2RpZnlcblxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxuXG4gICAgc2hvd0Nsb3NlSW5mbzogdHJ1ZSxcblxuICAgIC8vIOaPkOS+m+mAieaLqeeahOS6pOaYk+adv+Wdl1xuICAgIHNob3BGb3J1bXM6IGRhdGEuc2hvcEZvcnVtVHlwZXMsXG4gICAgc2VsZWN0ZWRTaG9wRm9ydW1JZDogXCJcIixcbiAgICAvLyDovoXliqnmnb/lnZdcbiAgICBtYWluRm9ydW1zOiBbXSxcbiAgICAvLyDllYblk4HmoIfpopjjgIHmj4/ov7DjgIHlhbPplK7or41cbiAgICB0aXRsZTogXCJcIixcbiAgICBhYnN0cmFjdDogXCJcIixcbiAgICBjb250ZW50OiBcIlwiLFxuICAgIGtleXdvcmRzOiBbXSxcbiAgICAvLyDllYblk4Hku4vnu43lm75cbiAgICBpbWdJbnRyb2R1Y3Rpb25zOiBwcm9kdWN0PyBwcm9kdWN0LmltZ0ludHJvZHVjdGlvbnM6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcblxuICAgIC8vIOa3u+WKoOWkmuS4quinhOagvFxuICAgIHBhcmFtRm9ydW06IGZhbHNlLFxuXG4gICAgLy8g6KeE5qC85L+h5oGvXG4gICAgLy8g5bey5Yu+6YCJIOaWsOeahOinhOagvOWIhuexuyAg54us56uL6KeE5qC855u05o6l5paw5bu65q2k5pWw57uE5YaFXG4gICAgc2VsZWN0ZWRQYXJhbXM6IHByb2R1Y3Q/cHJvZHVjdC5wcm9kdWN0UGFyYW1zOltdLFxuICAgIC8vIOinhOagvOWQjSBcbiAgICAvKiBcbiAgICB7XG4gICAgICBuYW1lOiBcIuminOiJslwiLFxuICAgICAgdmFsdWVzOiBbXG4gICAgICAgIFwi57qiXCIsXG4gICAgICAgIFwi6buEXCIsXG4gICAgICAgIFwi6JOdXCJcbiAgICAgIF1cbiAgICB9IFxuICAgICovXG4gICAgcGFyYW1zOiBbXSxcbiAgICAvLyDkvJrlkZjmipjmiaNcbiAgICB2aXBEaXNHcm91cCxcbiAgICB2aXBEaXNjb3VudDogcHJvZHVjdD8hIXByb2R1Y3QudmlwRGlzY291bnQ6IGZhbHNlLFxuICAgIC8vIOWHj+W6k+WtmFxuICAgIHN0b2NrQ29zdE1ldGhvZDogcHJvZHVjdD8gcHJvZHVjdC5zdG9ja0Nvc3RNZXRob2Q6IFwib3JkZXJSZWR1Y2VTdG9ja1wiLCAvLyDkuIvljZXlh4/lupPlrZjvvJpvcmRlclJlZHVjZVN0b2Nr77yM5LuY5qy+5YeP5bqT5a2Y77yacGF5UmVkdWNlU3RvY2tcbiAgICAvLyDpmZDotK3nm7jlhbNcbiAgICBwdXJjaGFzZUxpbWl0LFxuICAgIC8vIOi0reS5sOaXtuaYr+WQpumcgOimgeS4iuS8oOWHreivgeOAgeWHreivgeivtOaYjlxuICAgIHVwbG9hZENlcnQ6IHByb2R1Y3Q/ICEhcHJvZHVjdC51cGxvYWRDZXJ0OiBmYWxzZSxcbiAgICB1cGxvYWRDZXJ0RGVzY3JpcHRpb246IHByb2R1Y3Q/IHByb2R1Y3QudXBsb2FkQ2VydERlc2NyaXB0aW9uOiBcIlwiLFxuXG4gICAgLy8g5Lu35qC85pi+56S655u45YWzIFxuICAgIHByb2R1Y3RTZXR0aW5nczogcHJvZHVjdD8gcHJvZHVjdC5wcm9kdWN0U2V0dGluZ3M6IHtcbiAgICAgIC8vIOa4uOWuouaYr+WQpuWPr+ingVxuICAgICAgcHJpY2VTaG93VG9WaXNpdDogdHJ1ZSxcbiAgICAgIC8vIOWBnOWUruWQjuaYr+WQpuWPr+ingVxuICAgICAgcHJpY2VTaG93QWZ0ZXJTdG9wOiB0cnVlXG4gICAgfSxcblxuICAgIC8vIOaYr+WQpuWFjemCrui0uVxuICAgIGlzRnJlZVBvc3Q6IHByb2R1Y3Q/ICEhcHJvZHVjdC5pc0ZyZWVQb3N0OiB0cnVlLFxuICAgIC8vIOi/kOi0ueaooeadv1xuICAgIGRlZmF1bHRUZW1wbGF0ZXM6IGRlYWxJbmZvLnRlbXBsYXRlcyxcbiAgICBmcmVpZ2h0VGVtcGxhdGVzOiBwcm9kdWN0PyBwcm9kdWN0LmZyZWlnaHRUZW1wbGF0ZXM6IFtdLFxuICAgIC8vIOS4iuaetuaXtumXtFxuICAgIHNoZWxmVHlwZTogXCJpbW1lZGlhdGVseVwiLCAvLyDnq4vljbPkuIrmnrbvvJppbW1lZGlhdGVsee+8jHRpbWluZzog5a6a5pe25LiK5p6277yMc2F2ZTog5pqC5a2Y5LiN5Y+R5biDXG4gICAgc2hlbGZUaW1lOiBcIlwiXG5cbiAgfSxcbiAgd2F0Y2g6IHtcbiAgICBzaGVsZlR5cGUoKSB7XG4gICAgICB0aGlzLmluaXRUaW1lKCk7XG4gICAgfVxuICB9LFxuICBtb3VudGVkKCkge1xuICAgIC8vIOe8lui+keWVhuWTgSDpooTliLblhoXlrrlcbiAgICBpZihwcm9kdWN0KSB7XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LkNvbW1vbk1vZGFsID0gbmV3IE5LQy5tb2R1bGVzLkNvbW1vbk1vZGFsKCk7XG4gICAgICB3aW5kb3cuU2VsZWN0Rm9ydW1zID0gbmV3IE5LQy5tb2R1bGVzLk1vdmVUaHJlYWQoKTtcbiAgICAgIHdpbmRvdy5lZGl0b3IgPSBVRS5nZXRFZGl0b3IoJ2NvbnRhaW5lcicsIE5LQy5jb25maWdzLnVlZGl0b3Iuc2hvcENvbmZpZ3MpO1xuICAgICAgdGhpcy5pbml0VGltZSgpO1xuICAgICAgdGhpcy5hZGRQYXJhbSgpO1xuICAgIH1cblxuICB9LFxuICBjb21wdXRlZDoge1xuICAgIHNlbGVjdGVkU2hvcEZvcnVtKCkge1xuICAgICAgaWYodGhpcy5zZWxlY3RlZFNob3BGb3J1bSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFNob3BGb3J1bS5maWQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbWdNYXN0ZXIoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbWdJbnRyb2R1Y3Rpb25zWzBdO1xuICAgIH0sXG4gICAgcGFyYW1BdHRyaWJ1dGVzKCkge1xuICAgICAgY29uc3Qge3BhcmFtc30gPSB0aGlzO1xuICAgICAgbGV0IGFyciA9IFtdO1xuICAgICAgcGFyYW1zLm1hcChwID0+IHtcbiAgICAgICAgcCA9IHAudmFsdWUucmVwbGFjZSgv77yML2csIFwiLFwiKTtcbiAgICAgICAgcCA9IHAuc3BsaXQoXCIsXCIpO1xuICAgICAgICBwID0gcC5tYXAodiA9PiAodiArIFwiXCIpLnRyaW0oKSlcbiAgICAgICAgcCA9IHAuZmlsdGVyKHYgPT4gISF2KTtcbiAgICAgICAgaWYocC5sZW5ndGgpIHtcbiAgICAgICAgICBhcnIucHVzaChwKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBhcnIgPSBOS0MubWV0aG9kcy5kb0V4Y2hhbmdlKGFycik7XG4gICAgICBhcnIgPSBhcnIubWFwKGEgPT4ge1xuICAgICAgICBpZihBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgICAgYSA9IGEuam9pbihcIiwgXCIpOyAgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBhcnJcbiAgICB9LFxuICAgIGZyZWlnaHRUZW1wbGF0ZU5hbWVzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJlaWdodFRlbXBsYXRlcy5tYXAoZiA9PiBmLm5hbWUpO1xuICAgIH1cbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHNhdmUoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGNvbnN0IHtjaGVja051bWJlciwgY2hlY2tTdHJpbmd9ID0gTktDLm1ldGhvZHMuY2hlY2tEYXRhO1xuICAgICAgY29uc3QgYm9keSA9IHt9O1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHNlbGYuc3VibWl0dGluZyA9IHRydWU7XG4gICAgICAgICAgaWYoc2VsZi50eXBlID09PSBcImNyZWF0ZVwiKSB7XG4gICAgICAgICAgICBzZWxmLmNvbnRlbnQgPSBlZGl0b3IuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgaWYoIXNlbGYuc2VsZWN0ZWRTaG9wRm9ydW1JZCkgdGhyb3cgXCLor7fpgInmi6nllYblk4HliIbnsbtcIjtcbiAgICAgICAgICAgIGlmKCFzZWxmLm1haW5Gb3J1bXMubGVuZ3RoKSB0aHJvdyBcIuivt+mAieaLqeWVhuWTgei+heWKqeWIhuexu1wiO1xuICAgICAgICAgICAgYm9keS5tYWluRm9ydW1zSWQgPSBbc2VsZi5zZWxlY3RlZFNob3BGb3J1bUlkXS5jb25jYXQoc2VsZi5tYWluRm9ydW1zLm1hcChmb3J1bSA9PiBmb3J1bS5maWQpKTtcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKHNlbGYudGl0bGUsIHtcbiAgICAgICAgICAgICAgbmFtZTogXCLllYblk4HmoIfpophcIixcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiA2LFxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDIwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBib2R5LnByb2R1Y3ROYW1lID0gc2VsZi50aXRsZTtcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKHNlbGYuYWJzdHJhY3QsIHtcbiAgICAgICAgICAgICAgbmFtZTogXCLllYblk4HnroDku4tcIixcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiA2LFxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJvZHkucHJvZHVjdERlc2NyaXB0aW9uID0gc2VsZi5hYnN0cmFjdDtcbiAgICAgICAgICAgIHNlbGYua2V5d29yZHMubWFwKGsgPT4ge1xuICAgICAgICAgICAgICBjaGVja1N0cmluZyhrLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCLlhbPplK7or41cIixcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYm9keS5hdHRlbnRpb24gPSBzZWxmLmtleXdvcmRzO1xuICAgICAgICAgICAgY2hlY2tTdHJpbmcoc2VsZi5jb250ZW50LCB7XG4gICAgICAgICAgICAgIG5hbWU6IFwi5Zu+5paH5o+P6L+wXCIsXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDAwMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYm9keS5wcm9kdWN0RGV0YWlscyA9IHNlbGYuY29udGVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8g5Yik5pat5ZWG5ZOB5Zu+XG4gICAgICAgICAgY29uc3QgcGljdHVyZXNJZCA9IHNlbGYuaW1nSW50cm9kdWN0aW9ucy5maWx0ZXIoaSA9PiAhIWkpO1xuICAgICAgICAgIGlmKCFwaWN0dXJlc0lkLmxlbmd0aCkgdGhyb3cgXCLor7foh7PlsJHpgInmi6nkuIDlvKDllYblk4Hlm75cIjtcbiAgICAgICAgICBib2R5LmltZ0ludHJvZHVjdGlvbnMgPSBwaWN0dXJlc0lkO1xuICAgICAgICAgIC8vIOWIpOaWreWVhuWTgeinhOagvFxuICAgICAgICAgIGxldCBwcm9kdWN0UGFyYW1zID0gW107XG4gICAgICAgICAgcHJvZHVjdFBhcmFtcyA9IHNlbGYuc2VsZWN0ZWRQYXJhbXM7XG4gICAgICAgICAgaWYoIXByb2R1Y3RQYXJhbXMubGVuZ3RoKSB0aHJvdyBcIuivt+iHs+Wwkea3u+WKoOS4gOS4quWVhuWTgeinhOagvFwiO1xuICAgICAgICAgIHByb2R1Y3RQYXJhbXMubWFwKHBhcmFtID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgbmFtZSwgb3JpZ2luUHJpY2UsXG4gICAgICAgICAgICAgIHByaWNlLCB1c2VEaXNjb3VudCxcbiAgICAgICAgICAgICAgc3RvY2tzVG90YWxcbiAgICAgICAgICAgIH0gPSBwYXJhbTtcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKG5hbWUsIHtcbiAgICAgICAgICAgICAgbmFtZTogXCLop4TmoLzlkI3np7BcIixcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGVja051bWJlcihzdG9ja3NUb3RhbCwge1xuICAgICAgICAgICAgICBuYW1lOiBcIuinhOagvOW6k+WtmFwiLFxuICAgICAgICAgICAgICBtaW46IDBcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2hlY2tOdW1iZXIob3JpZ2luUHJpY2UsIHtcbiAgICAgICAgICAgICAgbmFtZTogXCLop4TmoLzku7fmoLxcIixcbiAgICAgICAgICAgICAgbWluOiAwLjAxLFxuICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZih1c2VEaXNjb3VudCkge1xuICAgICAgICAgICAgICBjaGVja051bWJlcihwcmljZSwge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwi6KeE5qC85LyY5oOg5Lu3XCIsXG4gICAgICAgICAgICAgICAgbWluOiAwLjAxLFxuICAgICAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZihwcmljZSA+PSBvcmlnaW5QcmljZSkgdGhyb3cgXCLop4TmoLzkvJjmg6Dku7flv4XpobvlsI/kuo7ljp/ku7dcIjsgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJvZHkucHJvZHVjdFBhcmFtcyA9IHByb2R1Y3RQYXJhbXM7XG4gICAgICAgICAgYm9keS52aXBEaXNHcm91cCA9IFtdO1xuICAgICAgICAgIC8vIOS8muWRmOaKmOaJo1xuICAgICAgICAgIGlmKHNlbGYudmlwRGlzY291bnQpIHtcbiAgICAgICAgICAgIHNlbGYudmlwRGlzR3JvdXAubWFwKHYgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB7dmlwTnVtfSA9IHY7XG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKHZpcE51bSwge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwi5oqY5omj546HXCIsXG4gICAgICAgICAgICAgICAgbWluOiAxLFxuICAgICAgICAgICAgICAgIG1heDogMTAwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBib2R5LnZpcERpc0dyb3VwID0gc2VsZi52aXBEaXNHcm91cDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYm9keS52aXBEaXNjb3VudCA9IHNlbGYudmlwRGlzY291bnQ7XG4gICAgICAgICAgLy8g6L+Q6LS5XG4gICAgICAgICAgaWYoIXNlbGYuaXNGcmVlUG9zdCkge1xuICAgICAgICAgICAgaWYoIXNlbGYuZnJlaWdodFRlbXBsYXRlcy5sZW5ndGgpIHRocm93IFwi6K+36Iez5bCR5re75Yqg5LiA5p2h6L+Q6LS55L+h5oGvXCI7XG4gICAgICAgICAgICBzZWxmLmZyZWlnaHRUZW1wbGF0ZXMubWFwKGYgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB7bmFtZSwgZmlyc3RQcmljZSwgYWRkUHJpY2V9ID0gZjtcbiAgICAgICAgICAgICAgY2hlY2tTdHJpbmcobmFtZSwge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwi54mp5rWB5ZCN56ewXCIsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxuICAgICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjaGVja051bWJlcihmaXJzdFByaWNlLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCLnianmtYHpppbku7bku7fmoLxcIixcbiAgICAgICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKGFkZFByaWNlLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCLnianmtYHmr4/lop7liqDkuIDku7bnmoTku7fmoLxcIixcbiAgICAgICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJvZHkuZnJlaWdodFRlbXBsYXRlcyA9IHNlbGYuZnJlaWdodFRlbXBsYXRlcztcbiAgICAgICAgICB9XG4gICAgICAgICAgYm9keS5pc0ZyZWVQb3N0ID0gISFzZWxmLmlzRnJlZVBvc3Q7XG4gICAgICAgICAgLy8g5Lu35qC85pi+56S6XG4gICAgICAgICAgYm9keS5wcm9kdWN0U2V0dGluZ3MgPSBzZWxmLnByb2R1Y3RTZXR0aW5ncztcbiAgICAgICAgICAvLyDlupPlrZhcbiAgICAgICAgICBib2R5LnN0b2NrQ29zdE1ldGhvZCA9IHNlbGYuc3RvY2tDb3N0TWV0aG9kO1xuICAgICAgICAgIC8vIOi0reS5sOmZkOWItlxuICAgICAgICAgIGlmKHNlbGYucHVyY2hhc2VMaW1pdC5zdGF0dXMpIHtcbiAgICAgICAgICAgIGNoZWNrTnVtYmVyKHNlbGYucHVyY2hhc2VMaW1pdC5jb3VudCwge1xuICAgICAgICAgICAgICBuYW1lOiBcIumZkOi0reaVsOmHj1wiLFxuICAgICAgICAgICAgICBtaW46IDFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYm9keS5wdXJjaGFzZUxpbWl0Q291bnQgPSBzZWxmLnB1cmNoYXNlTGltaXQuY291bnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkucHVyY2hhc2VMaW1pdENvdW50ID0gLTE7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIOi0reS5sOWHreivgVxuICAgICAgICAgIGlmKHNlbGYudXBsb2FkQ2VydCkge1xuICAgICAgICAgICAgY2hlY2tTdHJpbmcoc2VsZi51cGxvYWRDZXJ0RGVzY3JpcHRpb24sIHtcbiAgICAgICAgICAgICAgbmFtZTogXCLlh63or4Hor7TmmI5cIixcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYm9keS51cGxvYWRDZXJ0RGVzY3JpcHRpb24gPSBzZWxmLnVwbG9hZENlcnREZXNjcmlwdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYm9keS51cGxvYWRDZXJ0ID0gc2VsZi51cGxvYWRDZXJ0O1xuICAgICAgICAgIGlmKHNlbGYudHlwZSA9PT0gXCJjcmVhdGVcIikge1xuICAgICAgICAgICAgLy8g5LiK5p625pe26Ze0XG4gICAgICAgICAgICBpZihzZWxmLnNoZWxmVHlwZSA9PT0gXCJpbW1lZGlhdGVseVwiKSB7XG4gICAgICAgICAgICAgIGJvZHkucHJvZHVjdFN0YXR1cyA9IFwiaW5zYWxlXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYoc2VsZi5zaGVsZlR5cGUgPT09IFwic2F2ZVwiKSB7XG4gICAgICAgICAgICAgIGJvZHkucHJvZHVjdFN0YXR1cyA9IFwibm90b25zaGVsZlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYm9keS5wcm9kdWN0U3RhdHVzID0gXCJub3RvbnNoZWxmXCI7XG4gICAgICAgICAgICAgIGNvbnN0IGRvbSA9ICQoXCIjc2hlbGZUaW1lXCIpO1xuICAgICAgICAgICAgICBsZXQgc2hlbGZUaW1lID0gbmV3IERhdGUoZG9tLnZhbCgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgIGJvZHkuc2hlbGZUaW1lID0gc2hlbGZUaW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkucHJvZHVjdElkID0gcHJvZHVjdC5wcm9kdWN0SWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvc2hvcC9tYW5hZ2Uvc2hlbGZcIiwgXCJQT1NUXCIsIHtwb3N0OiAgYm9keX0pO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmj5DkuqTmiJDlip9cIik7XG4gICAgICAgICAgc2VsZi5zdWJtaXR0aW5nID0gZmFsc2U7XG4gICAgICAgICAgc2VsZi5zaG93Q2xvc2VJbmZvID0gZmFsc2U7XG4gICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoXCIvc2hvcC9tYW5hZ2UvZ29vZHNcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIHNlbGYuc3VibWl0dGluZyA9IGZhbHNlO1xuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBkaXNhYmxlZFNlbGVjdFBhcmFtKHBhcmFtKSB7XG4gICAgICBpZighcGFyYW0uX2lkKSByZXR1cm47XG4gICAgICBpZihwYXJhbS5pc0VuYWJsZSkge1xuICAgICAgICBsZXQgdG90YWwgPSAwO1xuICAgICAgICB0aGlzLnNlbGVjdGVkUGFyYW1zLm1hcChwID0+IHtcbiAgICAgICAgICBpZihwLmlzRW5hYmxlKSB0b3RhbCArKztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmKHRvdGFsIDw9IDEpIHJldHVybiBzd2VldEVycm9yKFwi5LiN5YWB6K645bGP6JS95omA5pyJ6KeE5qC8XCIpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBwYXJhbS5pc0VuYWJsZSA9ICFwYXJhbS5pc0VuYWJsZTtcbiAgICB9LFxuICAgIGluaXRUaW1lKCkge1xuICAgICAgJCgnLnRpbWUnKS5kYXRldGltZXBpY2tlcih7XG4gICAgICAgIGxhbmd1YWdlOiAgJ3poLUNOJyxcbiAgICAgICAgZm9ybWF0OiAneXl5eS1tbS1kZCBoaDppaScsXG4gICAgICAgIGF1dG9jbG9zZTogdHJ1ZSxcbiAgICAgICAgdG9kYXlIaWdobGlnaHQ6IDEsXG4gICAgICAgIHN0YXJ0VmlldzogMixcbiAgICAgICAgbWluVmlldzogMCxcbiAgICAgICAgZm9yY2VQYXJzZTogMFxuICAgICAgfSk7XG4gICAgfSxcbiAgICBzZWxlY3RQaWN0dXJlcyhpbmRleCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBpZighd2luZG93LlNlbGVjdFJlc291cmNlKSB7XG4gICAgICAgIHdpbmRvdy5TZWxlY3RSZXNvdXJjZSA9IG5ldyBOS0MubW9kdWxlcy5TZWxlY3RSZXNvdXJjZSgpO1xuICAgICAgfVxuICAgICAgU2VsZWN0UmVzb3VyY2Uub3BlbihkYXRhID0+IHtcbiAgICAgICAgaWYoIVtcInBuZ1wiLCBcImpwZ1wiLCBcImpwZWdcIl0uaW5jbHVkZXMoZGF0YS5yZXNvdXJjZXNbMF0uZXh0KSkgcmV0dXJuIHN3ZWV0SW5mbyhcIuS7heaUr+aMgXBuZ+OAgWpwZ+WSjGpwZWfmoLzlvI/nmoTlm77niYdcIik7XG4gICAgICAgIFZ1ZS5zZXQoc2VsZi5pbWdJbnRyb2R1Y3Rpb25zLCBpbmRleCwgZGF0YS5yZXNvdXJjZXNJZFswXSk7XG4gICAgICB9LCB7XG4gICAgICAgIGFsbG93ZWRFeHQ6IFtcInBpY3R1cmVcIl0sXG4gICAgICAgIGNvdW50TGltaXQ6IDFcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjaGFuZ2VBcnJJbmRleChhcnIsIGluZGV4LCB0KSB7XG4gICAgICBjb25zdCBpID0gYXJyW2luZGV4XTtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IGFyci5sZW5ndGg7XG4gICAgICBsZXQgb3RoZXJJbmRleDtcbiAgICAgIGlmKHQgPT09IFwibGVmdFwiKSB7XG4gICAgICAgIGlmKGluZGV4ID09PSAwKSByZXR1cm47XG4gICAgICAgIG90aGVySW5kZXggPSBpbmRleCAtIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZihpbmRleCArIDEgPT09IGxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBvdGhlckluZGV4ID0gaW5kZXggKyAxO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3RoZXIgPSBhcnJbb3RoZXJJbmRleF07XG4gICAgICBWdWUuc2V0KGFyciwgaW5kZXgsIG90aGVyKTtcbiAgICAgIFZ1ZS5zZXQoYXJyLCBvdGhlckluZGV4LCBpKTtcbiAgICB9LFxuICAgIHJlbW92ZVBpY3R1cmUoaW5kZXgpIHtcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHliKDpmaTlvZPliY3llYblk4Hlm77niYfvvJ9cIilcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIFZ1ZS5zZXQodGhpcy5pbWdJbnRyb2R1Y3Rpb25zLCBpbmRleCwgXCJcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge30pXG4gICAgICBcbiAgICB9LFxuICAgIHJlbG9hZFRlbXBsYXRlKCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBua2NBUEkoXCIvc2hvcC9tYW5hZ2Uvc2V0dGluZ3NcIiwgXCJHRVRcIilcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgc2VsZi5kZWZhdWx0VGVtcGxhdGVzID0gZGF0YS5kZWFsSW5mby50ZW1wbGF0ZXM7XG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5Yi35paw5oiQ5YqfXCIpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XG4gICAgfSxcbiAgICBhZGRUZW1wbGF0ZSgpIHtcbiAgICAgIHRoaXMuZnJlaWdodFRlbXBsYXRlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogXCJcIixcbiAgICAgICAgZmlyc3RQcmljZTogXCJcIixcbiAgICAgICAgYWRkUHJpY2U6IFwiXCJcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVtb3ZlRnJvbUFycihhcnIsIGluZGV4KSB7XG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9LFxuICAgIHNlbGVjdFRlbXBsYXRlKHQpIHtcbiAgICAgIGlmKHRoaXMuZnJlaWdodFRlbXBsYXRlTmFtZXMuaW5jbHVkZXModC5uYW1lKSkgcmV0dXJuO1xuICAgICAgdGhpcy5mcmVpZ2h0VGVtcGxhdGVzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwgdCkpO1xuICAgIH0sXG4gICAgcmVtb3ZlS2V5d29yZChpbmRleCkge1xuICAgICAgdGhpcy5rZXl3b3Jkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0sXG4gICAgc2VsZWN0Rm9ydW0oKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIFNlbGVjdEZvcnVtcy5vcGVuKGRhdGEgPT4ge1xuICAgICAgICBzZWxmLm1haW5Gb3J1bXMgPSBkYXRhLm9yaWdpbkZvcnVtcztcbiAgICAgICAgU2VsZWN0Rm9ydW1zLmNsb3NlKCk7XG4gICAgICB9LCB7XG4gICAgICAgIGZvcnVtQ291bnRMaW1pdDogMSxcbiAgICAgICAgaGlkZU1vdmVUeXBlOiB0cnVlXG4gICAgICB9KVxuICAgIH0sXG4gICAgYWRkS2V5d29yZHMoKSB7XG4gICAgICBDb21tb25Nb2RhbC5vcGVuKGRhdGEgPT4ge1xuICAgICAgICBsZXQga2V5d29yZHMgPSBkYXRhWzBdLnZhbHVlO1xuICAgICAgICBrZXl3b3JkcyA9IGtleXdvcmRzLnJlcGxhY2UoL++8jC9nLCBcIixcIik7XG4gICAgICAgIGtleXdvcmRzID0ga2V5d29yZHMuc3BsaXQoXCIsXCIpO1xuICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAga2V5d29yZHMubWFwKGsgPT4ge1xuICAgICAgICAgIGsgPSBrIHx8IFwiXCI7XG4gICAgICAgICAgayA9IGsudHJpbSgpO1xuICAgICAgICAgIGlmKGsgJiYgIWFyci5pbmNsdWRlcyhrKSkge1xuICAgICAgICAgICAgYXJyLnB1c2goayk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmtleXdvcmRzID0gYXJyO1xuICAgICAgICBDb21tb25Nb2RhbC5jbG9zZSgpO1xuICAgICAgfSwge1xuICAgICAgICB0aXRsZTogXCLmt7vliqDlhbPplK7or41cIixcbiAgICAgICAgZGF0YTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRvbTogXCJ0ZXh0YXJlYVwiLFxuICAgICAgICAgICAgbGFiZWw6IFwi5aSa5Liq5YWz6ZSu6K+N5Lul6YCX5Y+35YiG6ZqUXCIsXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5rZXl3b3Jkcy5qb2luKFwiLCBcIilcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgfSxcbiAgICByZW1vdmVQYXJhbUF0dHJpYnV0ZShpbmRleCkge1xuICAgICAgdGhpcy5wYXJhbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9LFxuICAgIHJlc2V0UGFyYW1Gb3J1bSgpIHtcbiAgICAgIHRoaXMucGFyYW1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHZhbHVlOiBcIlwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHJlbW92ZVNlbGVjdFBhcmFtKGluZGV4KSB7XG4gICAgICB0aGlzLnNlbGVjdGVkUGFyYW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgfSxcbiAgICBhZGRQYXJhbShwYXJhbSkge1xuICAgICAgcGFyYW0gPSBwYXJhbSAmJiBwYXJhbS5uYW1lPyBwYXJhbSA6IHRoaXMubmV3UGFyYW0oKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRQYXJhbXMucHVzaChwYXJhbSk7XG4gICAgfSxcbiAgICBuZXdQYXJhbShuYW1lKSB7XG4gICAgICBpZighbmFtZSkge1xuICAgICAgICBpZighdGhpcy5zZWxlY3RlZFBhcmFtcy5sZW5ndGgpIG5hbWUgPSBcIum7mOiupFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmFtZSA9IFwiXCI7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBvcmlnaW5QcmljZTogXCJcIixcbiAgICAgICAgcHJpY2U6IFwiXCIsXG4gICAgICAgIGlzRW5hYmxlOiB0cnVlLFxuICAgICAgICB1c2VEaXNjb3VudDogZmFsc2UsXG4gICAgICAgIHN0b2Nrc1RvdGFsOiBcIlwiXG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRQYXJhbXMoKSB7XG4gICAgICB0aGlzLnJlc2V0UGFyYW1Gb3J1bSgpO1xuICAgICAgdGhpcy5wYXJhbUZvcnVtID0gdHJ1ZTtcbiAgICB9LFxuICAgIGFkZFBhcmFtQXR0cmlidXRlKCkge1xuICAgICAgdGhpcy5wYXJhbXMucHVzaCh7XG4gICAgICAgIHZhbHVlOiBcIlwiXG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNhdmVQYXJhbUF0dHJpYnV0ZSgpIHtcbiAgICAgIGNvbnN0IHtwYXJhbUF0dHJpYnV0ZXN9ID0gdGhpcztcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgaWYoIXBhcmFtQXR0cmlidXRlcy5sZW5ndGgpIHJldHVybiBzd2VldEVycm9yKFwi6K+36Iez5bCR5aGr5YaZ5LiA5Liq5bGe5oCn5YC8XCIpO1xuICAgICAgcGFyYW1BdHRyaWJ1dGVzLm1hcChuYW1lID0+IHtcbiAgICAgICAgc2VsZi5hZGRQYXJhbShzZWxmLm5ld1BhcmFtKG5hbWUpKTtcbiAgICAgIH0pXG4gICAgICB0aGlzLnBhcmFtRm9ydW0gPSBmYWxzZTtcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyDnm5HlkKzpobXpnaLlhbPpl63vvIzmj5DnpLrkv53lrZjojYnnqL9cbndpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZihhcHAuc2hvd0Nsb3NlSW5mbyl7XG4gICAgcmV0dXJuIFwi5YWz6Zet6aG16Z2i5ZCO77yM5bey5aGr5YaZ55qE5YaF5a655bCG5Lya5Lii5aSx44CC56Gu5a6a6KaB5YWz6Zet5b2T5YmN6aG16Z2i77yfXCJcbiAgfVxufTsiXX0=
