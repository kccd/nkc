const {ForumModel, RoleModel, UsersGradeModel} = require('../dataModels');
const client = require('../settings/redisClient');

const cacheForums = async () => {


  const t = Date.now();

  const forums = await ForumModel.find({});

  const canNotDisplayOnParentForumsId = [];
  const canNotAccessibleForumsId = [];
  // 导航不可见的专业ID
  const canNotDisplayOnNavForumsId = [];
  // 无权用户在导航可见的专业ID
  const canDisplayOnNavForumsIdNCC = [];

  const rolesDB = await RoleModel.find({});
  const gradesDB = await UsersGradeModel.find({});

  const roles = {};
  const grades = {};
  const rolesAndGrades = {};
  const moderators = {};

  for(const role of rolesDB) {
    roles[role._id] = [];
    for(const grade of gradesDB) {
      grades[grade._id] = [];
      rolesAndGrades[`role-grade:${role._id}-${grade._id}`] = [];
    }
  }



  for(const forum of forums) {
    /*-------------根据角色和等级组装数据--------------*/

    const {visibility, isVisibleForNCC, rolesId, gradesId, accessible, displayOnParent, relation, fid} = forum;

    // 专家
    for(const uid of forum.moderators) {
      if(!moderators[uid]) {
        moderators[uid] = [];
      }
      if(!moderators[uid].includes(fid)) {
        moderators[uid].push(fid);
      }
    }

    // 拓展上下级关系
    const childForums = [];
    const childForumsId = [];
    for(const f of forums) {
      if(f.parentId === forum.fid) {
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

    if(!displayOnParent) {
      // 记下不能在上级专业显示文章的专业ID
      canNotDisplayOnParentForumsId.push(forum.fid);
    }

    if(!accessible) {
      // 记下不能访问的专业ID
      canNotAccessibleForumsId.push(forum.fid);
    } else {
      // 若专业能访问，则根据角色和等级的关系构建数据
      if(relation === 'or') {
        // 若关系为or, 角色和等级都为空时该专业无法访问
        if(gradesId.length === 0 && rolesId.length === 0) continue;
        for(const roleId of rolesId) {
          if(!roles[roleId].includes(fid)) {
            roles[roleId].push(fid);
          }
        }
        for(const gradeId of gradesId) {
          if(!grades[gradeId].includes(fid)) {
            grades[gradeId].push(fid);
          }
        }
      } else {
        // 若关系为and，角色和等级之中有一个为空该专业都将无法访问
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

  // 清空redis 1号数据库
  await client.flushdbAsync();

  // 获取子专业
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
      if(!f.parentId) return;
      for(const f1 of forums) {
        if(f1.fid !== f.parentId) continue;
        parentForums.push(f1);
        parentForumsId.push(f1.fid);
        getParentForumId(f1);
        break;
      }
    };

    getChildForumId(forum);
    getParentForumId(forum);

    forum.allChildForumsId = allChildForumsId;
    forum.allChildForums = allChildForums;
    forum.parentForums = parentForums.reverse();
    forum.parentForumsId = parentForumsId;

  }

  for(const forum of forums) {
    let key;
    // 下层子专业
    key = `forum:${forum.fid}:childForumsId`;
    if (forum.childForumsId.length !== 0) {
      await client.saddAsync(key, forum.childForumsId);
    }

    // 所有子专业
    key = `forum:${forum.fid}:allChildForumsId`;
    if (forum.allChildForumsId.length !== 0) {
      await client.saddAsync(key, forum.allChildForumsId);
    }


    // 所有父级专业
    key = `forum:${forum.fid}:parentForumsId`;
    if (forum.parentForumsId.length !== 0) {
      await client.saddAsync(key, forum.parentForumsId);
    }
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

    const key = `role:${roleId}`;

    if(roles[roleId].length !== 0) {
      await client.saddAsync(key, roles[roleId]);
    }
  }

  for(const gradeId in grades) {

    if(!grades.hasOwnProperty(gradeId)) continue;

    const key = `grade:${gradeId}`;

    if(grades[gradeId].length !== 0) {
      await client.saddAsync(key, grades[gradeId]);
    }
  }

  for(const roleAndGrade in rolesAndGrades) {

    if(!rolesAndGrades.hasOwnProperty(roleAndGrade)) continue;

    let arr = roleAndGrade.split(':');
    arr = arr[1].split('-');

    rolesAndGrades[roleAndGrade] = rolesAndGrades[roleAndGrade].concat(roles[arr[0]]);
    rolesAndGrades[roleAndGrade] = rolesAndGrades[roleAndGrade].concat(grades[arr[1]]);

    const key = `${roleAndGrade}`;

    const data = await client.smembersAsync(key);

    if(data.length !== 0) {
      await client.sremAsync(key, data);
    }
    if(rolesAndGrades[roleAndGrade].length !== 0) {
      await client.saddAsync(key, rolesAndGrades[roleAndGrade]);
    }

  }

  for(const moderator in moderators) {

    if(!moderators.hasOwnProperty(moderator)) continue;

    const key = `moderator:${moderator}`;

    if(moderators[moderator].length !== 0) {
      await client.saddAsync(key, moderators[moderator]);
    }
  }

  let key = `canNotDisplayOnParentForumsId`;
  if(canNotDisplayOnParentForumsId.length !== 0) {
    await client.saddAsync(key, canNotDisplayOnParentForumsId);
  }

  key = `canNotAccessibleForumsId`;
  if(canNotAccessibleForumsId.length !== 0) {
    await client.saddAsync(key, canNotAccessibleForumsId);
  }

  key = `canDisplayOnNavForumsIdNCC`;
  if(canDisplayOnNavForumsIdNCC.length !== 0) {
    await client.saddAsync(key, canDisplayOnNavForumsIdNCC);
  }

  key = `canNotDisplayOnNavForumsId`;
  if(canNotDisplayOnNavForumsId.length !== 0) {
    await client.saddAsync(key, canNotDisplayOnNavForumsId);
  }

  /*console.log(roles);
  console.log(grades);
  console.log(rolesAndGrades);
  console.log(moderators);*/

  console.log(`更新缓存完成，耗时：${Date.now() - t}ms`);

};

module.exports = cacheForums;
