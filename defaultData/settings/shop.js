module.exports = {
  _id: 'shop',
  c: {
    refund: {
      agree: 48,
      buyerTrack: 48,
      sellerReceive: 192,
      buyerReceive: 192,
      cert: 48,
      pay: 0.5,
      sellerTrack: 48
    },
    closeSale: {
      lastVisitTime: 7, // 用户7天未活动，则其他人无法购买他的商品
      description: '卖家较长时间未登录，暂停接单'
    }
  }
};
