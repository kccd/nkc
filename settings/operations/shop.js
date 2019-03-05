module.exports = {
  GET: 'visitShopIndex',
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
        GET: 'visitShopDecorationIndex',
        POST: 'modifyShopDecoration'
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
  }
};