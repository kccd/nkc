module.exports = {
  GET: 'visitShopIndex',
  product: {
    PARAMETER: {
      GET: 'visitProductSingle',
      top: {
        POST: "pushGoodsToHome",
        DELETE: "pushGoodsToHome"
      },
      changePara: {
        PUT: 'changeProductParams'
      },
      banSale: {
        PUT: 'banSaleProductParams'
      }
    }
  },
  manage: {
    GET: "visitManageRouter",
    // 订单管理
    order: {
      GET: "visitShopOrderIndex"
    },
    // 作为卖家编辑交易设置，包含全局公告、运费模板
    settings: {
      GET: "modifyStoreInfo",
      PUT: "modifyStoreInfo"
    },
    // 上架相关
    shelf: {
      GET: 'visitShelfIndex',
      POST: 'productToShelf'
    },
    home: {
      GET: 'visitManageHome',
    },
    PARAMETER: {
      GET: 'visitManageIndex',
      home: {
        GET:'visitManageHome',
      },
      info: {
        GET: 'visitStoreInfoIndex',
        POST: 'modifyStoreInfo'
      },
      template: {
        GET: 'visitFreightTemplate',
        PUT: 'saveFreightTemplate'
      },
      /* // 上架相关
      shelf: {
        GET: 'visitShelfIndex',
        POST: 'productToShelf'
      }, */
      decoration: {
        sign: {
          POST: 'modifyStoreDecorationSign'
        },
        service: {
          POST: 'modifyStoreDecorationService'
        },
        search: {
          POST: 'modifyStoreDecorationSearch'
        },
        featured: {
          GET: "visitFeaturedProductList",
          POST: "modifyStoreDecorationFeatured"
        },
        addClass: {
          PUT: 'addStoreClassFeatured'
        },
        delClass: {
          PUT: 'delStoreClassFeatured'
        },
        singleClass: {
          GET: 'getStoreSingleClassify'
        },
        addSingleClass: {
          PUT: 'addStoreSingleClassify'
        },
        GET: 'visitStoreDecorationIndex',
        POST: 'modifyStoreDecoration'
      },
      classify: {
        GET: 'visitShopClassifyIndex',
        add: {
          POST: 'addStoreClassify'
        },
        del: {
          POST: 'delStoreClassify'
        }
      },
      order: {
        GET: 'visitShopOrderIndex',
        sendGoods: {
          PUT: 'sendGoods'
        },
        editGoods: {
          PUT: 'editGoodsLogositics'
        },
        sendGoodsNoLog:{
          PUT: "sendGoodsNoLog"
        },
        editOrder: {
          PUT: 'editOrder'
        },
        editOrderTrackNumber: {
          PUT: 'editOrderTrackNumber'
        },
        detail: {
          GET: "visitStoreOrderDetail"
        },
        refund: {
          GET: 'visitStoreOrderRefund',
          POST: 'submitStoreOrderRefund'
        },
        logositics: {
          GET: 'visitStoreOrderLogositics'
        },
        cancel: {
          GET: "storeCancelOrder",
          POST: "storeCancelOrder"
        },
        editSellMessage: {
          PUT: "editSellMessage",
        },
        editCostRecord: {
          PUT: "editCostRecord",
        },
        editOrderPrice: {
          PUT: "editOrderPrice"
        },
        orderListToExcel: {
          GET: "orderListToExcel"
        }
      },
      goodslist: {
        GET: "visitStoreGoodsList",
        editParam: {
          GET: "visitStoreGoodsParamEdit",
          PUT: "submitEditToParam"
        },
        editProduct: {
          GET: "visitStoreGoodsProductEdit",
          PUT: "submitEditToProduct",
        },
        shelfRightNow: {
          PUT: "productShelfRightNow"
        },
        productStopSale: {
          PUT: "productStopSale"
        },
        productGoonSale: {
          PUT: "productGoonSale"
        }
      }
    },
  },
  openStore: {
    GET: 'visitOpenStoreIndex',
    POST: 'openStoreApply'
  },
  store: {
    PARAMETER:{
      GET: 'visitStoreIndex',
    }
  },
  cart: {
    POST: 'addProductToCart',
    GET: 'visitShopCart',
    PARAMETER: {
      PUT: 'modifyCartData',
      DELETE: 'modifyCartData'
    }
  },
  bill: {
    GET: 'visitShopBill',
    POST: 'submitShopBill',
    add: {
      PUT: 'billParamAddOne',
    },
    plus: {
      PUT: 'billParamPlusOne',
    }
  },
  order: {
    GET: 'visitUserOrder',
    POST: 'submitToPay',
    PARAMETER: {
      refund: {
        GET: 'visitUserOrderRefund'
      },
      logistics: {
        GET: "visitOrderLogistics"
      },
      receipt: {
        PUT: 'confirmOrderReceipt'
      },
      detail: {
        GET: 'visitSingleOrderDetail'
      }
    }
  },
  pay: {
    GET: 'visitShopPay',
    POST: 'kcbPay',
    alipay: {
      POST: 'getAlipayUrl'
    }
  },
  refund: {
    POST: 'userApplyRefund',
    PARAMETER: {
      POST: "userApplyRefund"
    }
  },
  cert: {
    POST: 'shopUploadCert',
    PUT: 'saveShopCerts',
    PARAMETER: {
      GET: 'shopGetCert',
      DELETE: 'shopDeleteCert'
    }
  }
};
