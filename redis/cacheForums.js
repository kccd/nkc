require('colors');
const {ForumModel, RoleModel, UsersGradeModel} = require('../dataModels');
const client = require('../settings/redisClient');

async function func() {

  // 无法在父级显示的专业id
  const canNotDisplayOnParentForumsId = [];
  // 无法访问的专业id
  const canNotAccessibleForumsId = [];
  // 导航不可见的专业id
  const canNotDisplayOnNavForumsId = [];
  // 无权用户在导航可见的专业id
  const canDisplayOnNavForumsIdNCC = [];


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
      // rolesId,
      // gradesId,
      accessible,
      displayOnParent,
      // relation,
      fid
    } = forum;

    const {rolesId, gradesId, relation} = forum.permission.read;

    // 专家
    forum.moderators.map(uid => {
      if(!moderators[uid]) {
        moderators[uid] = [];
      }
      if(!moderators[uid].includes(fid)) {
        moderators[uid].push(fid);
      }
    });

    const childForums = [];
    const childForumsId = [];

    // 拓展下级专业
    for(const f of forums) {
      if(f.parentsId.includes(fid)) {
        childForums.push(f);
        childForumsId.push(f.fid);
      }
    }
    forum.childForums = childForums;
    forum.childForumsId = childForumsId;

    // 导航不可见
    if(!visibility) {
      canNotDisplayOnNavForumsId.push(fid);
    }

    // 无权用户可见
    if(isVisibleForNCC) {
      canDisplayOnNavForumsIdNCC.push(fid);
    }

    // 无法在上级专业显示文章的专业
    if(!displayOnParent) {
      canNotDisplayOnParentForumsId.push(forum.fid);
    }

    // 已关闭的专业
    if(!accessible) {
      canNotAccessibleForumsId.push(forum.fid);
      canNotDisplayOnNavForumsId.push(fid);
      canNotDisplayOnParentForumsId.push(forum.fid);
    } else {
      if(relation === 'or') {
        if(gradesId.length === 0 && rolesId.length === 0) continue;
        for(const roleId of rolesId) {
          if(!roles[roleId].includes(fid)) {
            roles[roleId].push(fid);
          }
        }
        for(const gradeId of gradesId) {
          if(grades[gradeId] && !grades[gradeId].includes(fid)) {
            grades[gradeId].push(fid);
          }
        }
      } else {
        if(gradesId.length === 0 || rolesId.length === 0) continue;
        for(const r of rolesId) {
          for(const g of gradesId) {
            const key = `role-grade:${r}-${g}`;
            if(!rolesAndGrades[key].includes(fid)) {
              rolesAndGrades[key].push(fid);
            }
          }
        }
      }
    }
  }

  // 获取下级专业
  for(const forum of forums) {

    const allChildForumsId = [];
    const allChildForums = [];
    const parentForumsId = [];
    const parentForums = [];

    // 获取子专业
    const getChildForumId = (f) => {
      for(const childForum of f.childForums) {
        if(allChildForumsId.includes(childForum.fid)) continue;
        allChildForumsId.push(childForum.fid);
        allChildForums.push(childForum);
        getChildForumId(childForum);
      }
    };

    // 获取父专业
    const getParentForumId = (f) => {
      if(f.parentsId.length === 0) return;
      for(const pfid of f.parentsId) {
        for(const f1 of forums) {
          if(f1.fid === pfid) {
            parentForums.push(f1);
            parentForumsId.push(f1.fid);
            getParentForumId(f1);
            break;
          }
        }
      }
    };

    getChildForumId(forum);
    getParentForumId(forum);

    forum.allChildForumsId = allChildForumsId;
    forum.allChildForums = allChildForums;
    forum.parentForums = parentForums;
    forum.parentForumsId = parentForumsId;

  }

  for(const forum of forums) {
    let key;
    // 下层子专业
    key = `forum:${forum.fid}:childForumsId`;
    await client.resetSetAsync(key, forum.childForumsId);

    // 所有子专业
    key = `forum:${forum.fid}:allChildForumsId`;
    await client.resetSetAsync(key, forum.allChildForumsId);


    // 所有父级专业
    key = `forum:${forum.fid}:parentForumsId`;
    await client.resetSetAsync(key, forum.parentForumsId);
  }

  /*
  * 1. 下层子专业 forum:forumId:childForumsId
  * 2. 所有子专业 forum:forumId:addChildForumsId
  * 3. 所有父专业 forum:forumId:parentForumsId
  * 4. 版主管理的专业 moderator:uid
  * 5. 无法在上级显示的专业 canNotDisplayOnParentForumsId:canNotDisplayOnParentForumsId
  * 6. 角色有权 role:roleId
  * 7. 等级有权 grade:gradeId
  * 8. 角色和等级 role-grade:roleId-gradeId
  * 9. 无法访问的专业 canNotAccessibleForumsId:canNotAccessibleForumsId
  * */

  for(const roleId in roles) {

    if(!roles.hasOwnProperty(roleId)) continue;
    const key = `role:${roleId}:forumsId`;

    await client.resetSetAsync(key, roles[roleId]);
  }

  for(const gradeId in grades) {

    if(!grades.hasOwnProperty(gradeId)) continue;

    const key = `grade:${gradeId}:forumsId`;

    await client.resetSetAsync(key, grades[gradeId]);
  }

  for(const roleAndGrade in rolesAndGrades) {

    if(!rolesAndGrades.hasOwnProperty(roleAndGrade)) continue;

    let arr = roleAndGrade.split(':');
    arr = arr[1].split('-');

    rolesAndGrades[roleAndGrade] = rolesAndGrades[roleAndGrade].concat(roles[arr[0]]);
    rolesAndGrades[roleAndGrade] = rolesAndGrades[roleAndGrade].concat(grades[arr[1]]);

    const key = `${roleAndGrade}:forumsId`;

    await client.resetSetAsync(key, rolesAndGrades[roleAndGrade]);

  }

  for(const moderator in moderators) {

    if(!moderators.hasOwnProperty(moderator)) continue;

    const key = `moderator:${moderator}:forumsId`;

    await client.resetSetAsync(key, moderators[moderator]);
  }

  let key = `canNotDisplayOnParentForumsId`;
  await client.resetSetAsync(key, canNotDisplayOnParentForumsId);

  key = `canNotAccessibleForumsId`;
  await client.resetSetAsync(key, canNotAccessibleForumsId);

  key = `canDisplayOnNavForumsIdNCC`;
  await client.resetSetAsync(key, canDisplayOnNavForumsIdNCC);

  key = `canNotDisplayOnNavForumsId`;
  await client.resetSetAsync(key, canNotDisplayOnNavForumsId);

  console.log(`专业缓存更新完成`.green);

}

module.exports = func;
