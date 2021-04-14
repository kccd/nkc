const path = require("path");
const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const encryption = require("../tools/encryption");
const { dictionary } = require("../tools/weakPasswordChecker");
const { isMainThread, Worker } = require("worker_threads");
const UsersPersonalModel = require("./UsersPersonalModel");

const schema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
  toc: {
    type: Date,
    default: Date.now
  }
});

let checkWorker = null;

schema.statics.isChecking = function() {
  return !!checkWorker;
}

schema.statics.weakPasswordCheck = async function() {
  if(isMainThread) {
    if(!checkWorker) {
      checkWorker = new Worker(path.resolve(__dirname, "../tools/weakPasswordChecker/worker.js"));
      checkWorker.on("exit", () => checkWorker = null);
      checkWorker.on("error", () => checkWorker = null);
      return;
    } else {
      throw new Error("检测尚未结束，请稍后查看结果");
    }
  }
  const WeakPasswordResultModel = mongoose.model("weakPasswordResult");
  await WeakPasswordResultModel.deleteOne({});
  const {
    encryptInMD5WithSalt,
    encryptInSHA256HMACWithSalt,
  } = encryption;
  const count = await UsersPersonalModel.countDocuments();
  const chunkSize = 5000, everyCastTime = 6;
  const chunkCount = Math.ceil(count / chunkSize);
  for(let i = 0; i < chunkCount; i++) {
    const personals = await UsersPersonalModel.find({}, { uid: 1, password: 1, hashType: 1 }).skip(chunkSize * i).limit(chunkSize);
    console.log(`弱密码检测: offset: ${chunkSize * i}， length: ${personals.length}`);
    for(const person of personals) {
      const { password, uid, hashType } = person;
      const { hash, salt } = password;
      if(hashType === "pw9") {
        const preset = dictionary.find(preset => encryptInMD5WithSalt(preset, salt) === hash);
        if(preset) {
          console.log(`检测到弱密码:  password: ${preset}   uid: ${uid}`);
          await WeakPasswordResultModel({
            uid,
            password: preset
          }).save();
        }
      } else if(hashType === "sha256HMAC") {
        const preset = dictionary.find(preset => encryptInSHA256HMACWithSalt(preset, salt) === hash);
        if(preset) {
          console.log(`检测到弱密码:  password: ${preset}   uid: ${uid}`);
          await WeakPasswordResultModel({
            uid,
            password: preset
          }).save();
        }
      }
    }
  }
  console.log("检测完毕");
}

module.exports = mongoose.model("weakPasswordResult", schema);
