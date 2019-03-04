const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  goodsId: {
    type: String,
    index: 1,
    required: true
  }
}, {
  collection: 'shopCarts'
});
const ShopCartModel = mongoose.model('shopCarts', schema);
module.exports = ShopCartModel;