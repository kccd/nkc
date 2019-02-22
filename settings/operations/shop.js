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
      }
    },
  }
};