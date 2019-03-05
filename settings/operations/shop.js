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
    GET: 'visitShopCart'
  }
};