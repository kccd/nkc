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
var app = new Vue({
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
        name: "新建模板",
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
        if (!this.selectedParams.length) {
          name = "默认";
        } else {
          name = "新建规格";
        }
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