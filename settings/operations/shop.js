module.exports = {
  GET: 'visitShopIndex',
  account: {
    GET: 'visitShopAccount'
  },
  product: {
    PARAMETER: {
      GET: 'visitProductSingle',
      changePara: {
        PATCH: 'changeProductParams'
      }
    }
  },
  manage: {
    GET: "visitManageRouter",
    PARAMETER: {
      GET: 'visitManageIndex',
      home: {
        GET:'visitManageHome',
      },
      shelf: {
        GET: 'visitShelfIndex',
        POST: 'productToShelf'
      },
      info: {
        GET: 'visitStoreInfoIndex',
        POST: 'modifyStoreInfo'
      },
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
        editOrder: {
          PATCH: 'editOrder'
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
    POST: 'submitShopBill'
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