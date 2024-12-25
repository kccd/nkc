const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitShopIndex,
  product: {
    PARAMETER: {
      GET: Operations.visitProductSingle,
      top: {
        POST: Operations.pushGoodsToHome,
        DELETE: Operations.pushGoodsToHome,
      },
      changePara: {
        PUT: Operations.changeProductParams,
      },
      banSale: {
        PUT: Operations.banSaleProductParams,
      },
    },
  },
  manage: {
    GET: Operations.visitManageHome,
    // 订单管理
    order: {
      GET: Operations.visitShopOrderIndex,
    },
    // 作为卖家编辑交易设置，包含全局公告、运费模板
    settings: {
      GET: Operations.modifyStoreInfo,
      PUT: Operations.modifyStoreInfo,
    },
    // 上架相关
    shelf: {
      GET: Operations.visitShelfIndex,
      POST: Operations.productToShelf,
    },
    home: {
      GET: Operations.visitManageHome,
    },
    goods: {
      GET: Operations.visitStoreGoodsList,
    },
    PARAMETER: {
      GET: Operations.visitManageIndex,
      home: {
        GET: Operations.visitManageHome,
      },
      info: {
        GET: Operations.visitStoreInfoIndex,
        POST: Operations.modifyStoreInfo,
      },
      template: {
        GET: Operations.visitFreightTemplate,
        PUT: Operations.saveFreightTemplate,
      },
      /* // 上架相关
      shelf: {
        GET: Operations.visitShelfIndex,
        POST: Operations.productToShelf
      }, */
      decoration: {
        sign: {
          POST: Operations.modifyStoreDecorationSign,
        },
        service: {
          POST: Operations.modifyStoreDecorationService,
        },
        search: {
          POST: Operations.modifyStoreDecorationSearch,
        },
        featured: {
          GET: Operations.visitFeaturedProductList,
          POST: Operations.modifyStoreDecorationFeatured,
        },
        addClass: {
          PUT: Operations.addStoreClassFeatured,
        },
        delClass: {
          PUT: Operations.delStoreClassFeatured,
        },
        singleClass: {
          GET: Operations.getStoreSingleClassify,
        },
        addSingleClass: {
          PUT: Operations.addStoreSingleClassify,
        },
        GET: Operations.visitStoreDecorationIndex,
        POST: Operations.modifyStoreDecoration,
      },
      classify: {
        GET: Operations.visitShopClassifyIndex,
        add: {
          POST: Operations.addStoreClassify,
        },
        del: {
          POST: Operations.delStoreClassify,
        },
      },
      order: {
        sendGoods: {
          PUT: Operations.sendGoods,
        },
        editGoods: {
          PUT: Operations.editGoodsLogositics,
        },
        sendGoodsNoLog: {
          PUT: Operations.sendGoodsNoLog,
        },
        editOrder: {
          PUT: Operations.editOrder,
        },
        editOrderTrackNumber: {
          PUT: Operations.editOrderTrackNumber,
        },
        detail: {
          GET: Operations.visitStoreOrderDetail,
        },
        refund: {
          GET: Operations.visitStoreOrderRefund,
          POST: Operations.submitStoreOrderRefund,
        },
        logositics: {
          GET: Operations.visitStoreOrderLogositics,
        },
        cancel: {
          GET: Operations.storeCancelOrder,
          POST: Operations.storeCancelOrder,
        },
        editSellMessage: {
          PUT: Operations.editSellMessage,
        },
        editCostRecord: {
          PUT: Operations.editCostRecord,
        },
        editOrderPrice: {
          PUT: Operations.editOrderPrice,
        },
        orderListToExcel: {
          GET: Operations.orderListToExcel,
        },
      },
      goodslist: {
        GET: Operations.visitStoreGoodsList,
        editParam: {
          GET: Operations.visitStoreGoodsParamEdit,
          PUT: Operations.submitEditToParam,
        },
        editProduct: {
          GET: Operations.visitStoreGoodsProductEdit,
          PUT: Operations.submitEditToProduct,
        },
        shelfRightNow: {
          PUT: Operations.productShelfRightNow,
        },
        productStopSale: {
          PUT: Operations.productStopSale,
        },
        productGoonSale: {
          PUT: Operations.productGoonSale,
        },
      },
    },
  },
  openStore: {
    GET: Operations.visitOpenStoreIndex,
    POST: Operations.openStoreApply,
  },
  store: {
    PARAMETER: {
      GET: Operations.visitStoreIndex,
    },
  },
  cart: {
    POST: Operations.addProductToCart,
    GET: Operations.visitShopCart,
    PARAMETER: {
      PUT: Operations.modifyCartData,
      DELETE: Operations.modifyCartData,
    },
  },
  bill: {
    GET: Operations.visitShopBill,
    POST: Operations.submitShopBill,
    add: {
      PUT: Operations.billParamAddOne,
    },
    plus: {
      PUT: Operations.billParamPlusOne,
    },
  },
  order: {
    GET: Operations.visitUserOrder,
    POST: Operations.submitToPay,
    PARAMETER: {
      refund: {
        GET: Operations.visitUserOrderRefund,
      },
      logistics: {
        GET: Operations.visitOrderLogistics,
      },
      receipt: {
        PUT: Operations.confirmOrderReceipt,
      },
      detail: {
        GET: Operations.visitSingleOrderDetail,
      },
      delivery: {
        PUT: Operations.modifyShopOrderDeliveryInfo,
      },
    },
  },
  pay: {
    GET: Operations.visitShopPay,
    POST: Operations.kcbPay,
  },
  refund: {
    POST: Operations.userApplyRefund,
    PARAMETER: {
      POST: Operations.userApplyRefund,
    },
  },
  cert: {
    POST: Operations.shopUploadCert,
    PUT: Operations.saveShopCerts,
    PARAMETER: {
      GET: Operations.shopGetCert,
      DELETE: Operations.shopDeleteCert,
    },
  },
};
