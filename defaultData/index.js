const defaultData = {};
defaultData.init = async () => {
  const settings = require('./settings');
  const db = require('../dataModels');
  for(const setting of settings) {
    let settingDB = await db.SettingModel.findOne({_id: setting._id});
    if(!settingDB) {
      settingDB = db.SettingModel(setting);
      await settingDB.save();
      console.log(`inserting settings '${setting._id}' into database`);
    }
  }
  const roles = require('./roles');
  for(const role of roles) {
    let roleDB = await db.RoleModel.findOne({_id: role._id});
    if(!roleDB) {
      roleDB = db.RoleModel(role);
      await roleDB.save();
      console.log(`inserting role '${role._id}' into database`);
    }
  }
  const usersGrades = require('./usersGrades');
  for(const grade of usersGrades) {
    let gradeDB = await db.UsersGradeModel.findOne({_id: grade._id});
    if(!gradeDB) {
      gradeDB = db.UsersGradeModel(grade);
      await gradeDB.save();
      console.log(`inserting users grade '${grade._id}' into database`);
    }
  }
  const kcbsRecordsTypes = require('./kcbsRecordsType');
  for(const type of kcbsRecordsTypes) {
    let typeDB = await db.KcbsTypeModel.findOne({_id: type._id});
    if(!typeDB) {
      typeDB = db.KcbsTypeModel(type);
      await typeDB.save();
      console.log(`inserting kcbs records type '${type._id}' into database`);
    }
  }

  const {forumAvailable, normal} = require("./scoreOperation");
  const scoreOperations = forumAvailable.concat(normal);
  for(const so of scoreOperations) {
    let scoreOperation = await db.ScoreOperationModel.findOne({
      type: so,
      from: 'default',
    });
    if(!scoreOperation) {
      scoreOperation = db.ScoreOperationModel({
        _id: await db.SettingModel.operateSystemID('scoreOperations', 1),
        type: so,
        forumAvailable: forumAvailable.includes(so),
        from: 'default'
      });
      await scoreOperation.save();
      console.log(`inserting score operation ${so}`);
    }
  }

  const permission = require('../nkcModules/permission');
  const operationsId = permission.getOperationsId();
  for(let operationId of operationsId) {
    const operationDB = await db.OperationModel.findOne({_id: operationId});
    if(!operationDB) {
      const newOperation = db.OperationModel({
        _id: operationId,
        errInfo: '权限不足'
      });
      await newOperation.save();
      console.log(`inserting operation '${operationId}' into database`);
    }
  }
  const operationsDB = await db.OperationModel.find();
  for(const operation of operationsDB) {
    if(!operationsId.includes(operation._id)) {
      await operation.remove();
      console.log(`removing operation '${operation._id}' from database`);
    }
  }
  const forums = require('./forums');
  const forumsCount = await db.ForumModel.count();
  if(forumsCount === 0) {
    for(const forum of forums) {
      const f = db.ForumModel(forum);
      await f.save();
      console.log(`inserting forum '${forum.displayName}' into database`);
    }
  }
  const messageTypes = require('./messageTypes');
  const messageTypesCount = await db.MessageTypeModel.count();
  if(messageTypesCount === 0) {
    const f = db.MessageTypeModel(messageTypes);
    await f.save();
    console.log(`inserting messageTypes '${messageTypes._id}' into database`);
  }
};

module.exports = defaultData;
