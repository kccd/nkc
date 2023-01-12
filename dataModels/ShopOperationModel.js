const mongoose = require('mongoose');

const collectionName = 'shopOperations';

let ShopOperationModel;

const operationTypes = {
  modify_order_receive_mobile: 'modify_order_receive_mobile',
  modify_order_receive_name: 'modify_order_receive_name',
  modify_order_receive_address: 'modify_order_receive_address',
};
const sources = {
  order: 'order',
};

const schema = new mongoose.Schema({
  toc: {
    type: Date,
    required: true,
    index: 1,
  },
  type: {
    type: String,
    required: true,
    index: 1
  },
  source: {
    type: String,
    required: true,
    index: 1,
  },
  sid: {
    type: String,
    required: true,
    index: 1,
  },
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  oldData: {
    type: String,
    default: '',
  },
  newData: {
    type: String,
    default: ''
  }
}, {
  collection: collectionName
});

schema.statics.getOperationTypes = () => {
  return {...operationTypes};
};

schema.statics.getOperationSources = () => {
  return {...sources};
};

schema.statics.saveOperation = async (props) => {
  const {
    toc,
    type,
    source,
    sid,
    uid,
    oldData,
    newData,
  } = props;
  const operation = new ShopOperationModel({
    toc,
    type,
    source,
    sid,
    uid,
    oldData,
    newData,
  });
  await operation.save();
  return operation;
}

ShopOperationModel = mongoose.model(collectionName, schema);

module.exports = ShopOperationModel;
