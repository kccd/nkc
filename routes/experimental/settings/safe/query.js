const SettingModel = require("../../../../dataModels/SettingModel");
const UsersPersonalModel = require("../../../../dataModels/UsersPersonalModel");
const nkcModules = require("../../../../nkcModules");

async function getEarliestDate() {
  const safeSetting = await SettingModel.getSettings("safe");
  const { enable, interval  } = safeSetting.phoneVerify;
  if(!enable) {
    throw new Error("未启用定时手机号验证功能");
  }
  // 现在的时间 - 间隔时间 => 最近应该进行验证的时间
  // 最后验证时间 < 最近应该进行验证的时间 说明验证过期了
  return new Date(Date.now() - interval * 60 * 60 * 1000);
}

async function unverifiedPhoneCount() {
  const earliestDate = await getEarliestDate();
  return await UsersPersonalModel.countDocuments({
    mobile: { $ne: "" },
    $or: [
      { lastVerifyPhoneNumberTime: null },
      { lastVerifyPhoneNumberTime: { $exists: false } },
      { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
    ]
  });
}

async function queryUnverifiedPhone(page) {
  const earliestDate = await getEarliestDate();
  const count = await unverifiedPhoneCount();
  const paging = nkcModules.apiFunction.paging(page, count);
  const personals = await UsersPersonalModel.aggregate([
    { $match: {
        mobile: { $ne: "" },
        $or: [
          { lastVerifyPhoneNumberTime: null },
          { lastVerifyPhoneNumberTime: { $exists: false } },
          { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
        ]
    } },
    { $sort: { lastVerifyPhoneNumberTime: -1 } },
    { $skip: paging.start },
    { $limit: paging.perpage },
    { $lookup: {
        from: "users",
        localField: "uid",
        foreignField: "uid",
        as: "userinfo"
    } },
    { $unwind: "$userinfo" },
    { $project: {
        uid: 1,
        lastVerifyPhoneNumberTime: 1,
        nationCode: 1,
        mobile: 1,
        _id: 0,
        "userinfo.username": 1,
        "userinfo.avatar": 1
    } },
  ]).exec();
  return {
    personals,
    paging
  }
}

async function queryUnverifiedPhoneByUsername(page, content) {
  const earliestDate = await getEarliestDate();
  const count = await unverifiedPhoneCount();
  const paging = nkcModules.apiFunction.paging(page, count);
  const personals = await UsersPersonalModel.aggregate([
    { $match: {
      mobile: { $ne: "" },
      $or: [
        { lastVerifyPhoneNumberTime: null },
        { lastVerifyPhoneNumberTime: { $exists: false } },
        { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
      ]
    } },
    { $lookup: {
        from: "users",
        localField: "uid",
        foreignField: "uid",
        as: "userinfo"
    } },
    { $unwind: "$userinfo" },
    { $match: {
      "userinfo.username": content
    } },
    { $project: {
          uid: 1,
          lastVerifyPhoneNumberTime: 1,
          nationCode: 1,
          mobile: 1,
          _id: 0,
          "userinfo.username": 1,
          "userinfo.avatar": 1
    } },
  ]).exec();
  return {
    personals,
    paging
  }
}

async function queryUnverifiedPhoneByPhone(page, phone) {
  const earliestDate = await getEarliestDate();
  const count = await unverifiedPhoneCount();
  const paging = nkcModules.apiFunction.paging(page, count);
  const personals = await UsersPersonalModel.aggregate([
    { $match: {
      mobile: { $ne: "" },
      $or: [
        { lastVerifyPhoneNumberTime: null },
        { lastVerifyPhoneNumberTime: { $exists: false } },
        { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
      ],
      mobile: phone
    } },
    { $lookup: {
        from: "users",
        localField: "uid",
        foreignField: "uid",
        as: "userinfo"
    } },
    { $unwind: "$userinfo" },
    { $project: {
          uid: 1,
          lastVerifyPhoneNumberTime: 1,
          nationCode: 1,
          mobile: 1,
          _id: 0,
          "userinfo.username": 1,
          "userinfo.avatar": 1
    } },
  ]).exec();
  return {
    personals,
    paging
  }
}

async function queryUnverifiedPhoneByUid(page, uid) {
  const earliestDate = await getEarliestDate();
  const count = await unverifiedPhoneCount();
  const paging = nkcModules.apiFunction.paging(page, count);
  const personals = await UsersPersonalModel.aggregate([
    { $match: {
      mobile: { $ne: "" },
      $or: [
        { lastVerifyPhoneNumberTime: null },
        { lastVerifyPhoneNumberTime: { $exists: false } },
        { lastVerifyPhoneNumberTime: { $lt: earliestDate } }
      ],
      uid: uid
    } },
    { $lookup: {
        from: "users",
        localField: "uid",
        foreignField: "uid",
        as: "userinfo"
    } },
    { $unwind: "$userinfo" },
    { $project: {
          uid: 1,
          lastVerifyPhoneNumberTime: 1,
          nationCode: 1,
          mobile: 1,
          _id: 0,
          "userinfo.username": 1,
          "userinfo.avatar": 1
    } },
  ]).exec();
  return {
    personals,
    paging
  }
}

module.exports = {
  getEarliestDate,
  unverifiedPhoneCount,
  queryUnverifiedPhone,
  queryUnverifiedPhoneByUsername,
  queryUnverifiedPhoneByPhone,
  queryUnverifiedPhoneByUid
};