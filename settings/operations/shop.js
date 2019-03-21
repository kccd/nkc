module.exports = {
  GET: 'visitShopIndex',
  account: {
    GET: 'visitShopAccount'
  },
  product: {
    GET: 'visitProductIndex',
    PARAMETER: {
      GET: 'visitProductSingle'
    }
  },
  manage: {
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
        GET: 'visitShopInfoIndex',
        POST: 'modifyShopInfo'
      },
      decoration: {
        sign: {
          POST: 'modifyShopDecorationSign'
        },
        service: {
          POST: 'modifyShopDecorationService'
        },
        search: {
          POST: 'modifyShopDecorationSearch'
        },
        featured: {
          GET: "visitFeaturedProductList",
          POST: "modifyShopDecorationFeatured"
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
        GET: 'visitShopDecorationIndex',
        POST: 'modifyShopDecoration'
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
      cancel: {
        PATCH: "cancelUserOrder"
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
  }
};