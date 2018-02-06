const {
  PermissionModel,
  CertificateModel,
  ContentClassModel
} = require('../dataModels');

const parameter = Symbol('parameter');
const GET = Symbol('GET');
const POST = Symbol('POST');
const DELETE = Symbol('DELETE');
const PATCH = Symbol('PATCH');
const OPTIONS = Symbol('OPTIONS');
const PUT = Symbol('PUT');
const name = Symbol('name');

const _hour = 3600*1000;
const _day = _hour*24;
const _month = _day*30;
const _year = _month*12;

const methodEnum = {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS
};

const certificates = {};
let certs;

function constructTree(obj, arr) {
  {}
}

CertificateModel.find({})
  .then(docs => Promise.all(docs.map(doc => {
    const _doc = doc.toObject();
    _doc._id = undefined;
    certificates[doc._id] = _doc;
    const _cer = certificates[doc._id];
    return PermissionModel.find({belongTo: doc._id})
      .then(rs => {
        rs.filter(e => !e.parent)
          .forEach(e => {
            const key = e.path;
            po[key] =
          })
      })
  })));

module.exports = async (ctx, next) => {

};