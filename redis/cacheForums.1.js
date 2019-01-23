require('colors');
const {ForumModel, RoleModel, UsersGradeModel} = require('../dataModels');
const client = require('../settings/redisClient');

// 无法在父级显示的专业id
const canNotDisplayOnParentForumsId = [];
// 无法访问的专业id
const canNotAccessibleForumsId = [];
// 导航不可见的专业id
const canNotDisplayOnNavForumsId = [];
// 无权用户在导航可见的专业id
const canDisplayOnNavForumsIdNCC = [];

async function func() {

  const forums = await ForumModel.find();
  const rolesDB = await RoleModel.find();
  const gradesDB = await UsersGradeModel.find();

  const roles = {};
  const grades = {};
  const rolesAndGrades = {};
  const moderators = {};

  // 构建变量
  rolesDB.map(role => {
    roles[role._id] = [];
    gradesDB.map(grade => {
      grades[grade._id] = [];
      rolesAndGrades[`role-grade:${role._id}-${grade._id}`] = [];
    });
  });

  for(const forum of forums) {
    
    const {
      visibility,
      isVisibleForNCC,
      rolesId,
      gradesId,
      accessible, 
      displayOnParent,
      relation,
      fid,
      parentsId,
      relatedForumsId,
      forumTpye
    } = forum;

    // 专家
    forum.moderators.map(uid => {
      if(!moderators[uid]) {
        moderators[uid] = [];
      }
      if(!moderators[uid].includes(fid)) {
        moderators[uid].push(fid);
      }
    });

  }

  

}