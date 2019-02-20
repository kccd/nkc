module.exports = {
  GET: 'visitShopIndex',
  product: {
		GET: 'visitProductIndex',
  },
  manage: {
    PARAMETER: {
      GET: 'visitManageIndex',
      home: {
        GET:'visitManageHome',
      },
      shelf: {
        GET: 'productUpperShelf'
      }
    },
  }
};