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
        PATCH: 'changeProductParams'
      },
      banSale: {
        PATCH: 'banSaleProductParams'
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
      PATCH: "modifyStoreInfo"
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
        PATCH: 'saveFreightTemplate'
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
          PATCH: 'addStoreClassFeatured'
        },
        delClass: {
          PATCH: 'delStoreClassFeatured'
        },
        singleClass: {
          GET: 'getStoreSingleClassify'
        },
        addSingleClass: {
          PATCH: 'addStoreSingleClassify'
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
          PATCH: 'sendGoods'
        },
        editGoods: {
          PATCH: 'editGoodsLogositics'
        },
        sendGoodsNoLog:{
          PATCH: "sendGoodsNoLog"
        },
        editOrder: {
          PATCH: 'editOrder'
        },      
        editOrderTrackNumber: {
          PATCH: 'editOrderTrackNumber'
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
          PATCH: "editSellMessage",
        },
        editCostRecord: {
          PATCH: "editCostRecord",
        },
        editOrderPrice: {
          PATCH: "editOrderPrice"
        },
        orderListToExcel: {
          GET: "orderListToExcel"
        }
      },
      goodslist: {
        GET: "visitStoreGoodsList",
        editParam: {
          GET: "visitStoreGoodsParamEdit",
          PATCH: "submitEditToParam"
        },
        editProduct: {
          GET: "visitStoreGoodsProductEdit",
          PATCH: "submitEditToProduct",
        },
        shelfRightNow: {
          PATCH: "productShelfRightNow"
        },
        productStopSale: {
          PATCH: "productStopSale"
        },
        productGoonSale: {
          PATCH: "productGoonSale"
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
      PATCH: 'modifyCartData',
      DELETE: 'modifyCartData'
    }
  },
  bill: {
    GET: 'visitShopBill',
    POST: 'submitShopBill',
    add: {
      PATCH: 'billParamAddOne',
    },
    plus: {
      PATCH: 'billParamPlusOne',
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
        PATCH: 'confirmOrderReceipt'
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
      GET: 'getAlipayUrl'
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
    PATCH: 'saveShopCerts',
    PARAMETER: {
      GET: 'shopGetCert',
      DELETE: 'shopDeleteCert'
    }
  }
};