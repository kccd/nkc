const {ForumModel, RoleModel, GradeModel} = require('../dataModels');
const client = require('../settings/redisClient');

const cacheForums = async () => {


  const t = Date.now();
  console.log(`开始缓存专业信息`);

  const forums_ = await ForumModel.find({});
  const forums = [];

  const canNotDisplayInParentForumsId = [];

  for(const forum of forums_) {
    const childForums = [];
    const childForumsId = [];
    for(const f of forums_) {
      if(f.parentId === forum.fid) {
        childForums.push(f);
        childForumsId.push(f.fid);
      }
    }
    forum.childForums = childForums;
    forum.childForumsId = childForumsId;
    forums.push(forum);

    if(!forum.displayOnParent) {
      canNotDisplayInParentForumsId.push(forum.fid);
    }

  }

  const forumsTree = [];

  // 获取子专业
  for(const forum of forums) {
    const allChildForumsId = [];
    const allChildForums = [];
    const parentForumsId = [];
    const parentForums = [];

    // 获取子专业
    const getChildForumId = (f) => {
      if(f.childForums.length === 0) return;
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
        getParentForumId(f1.parentId);
        break;
      }
    };

    getChildForumId(forum);
    getParentForumId(forum);

    forum.allChildForumsId = allChildForumsId;
    forum.allChildForums = allChildForums;
    forum.parentForums = parentForums.reverse();
    forum.parentForumsId = parentForumsId;






    if(!forum.parentId) {
      forumsTree.push(forum);
    }

  }


  /*
  * 1. 下层子专业 forum:forumId:childForumsId
  * 2. 所有子专业 forum:forumId:addChildForumsId
  * 3. 所有父专业 forum:forumId:parentForumsId
  * 4. 版主管理的专业 moderator:uid:accessibleForumsId
  * 5. 无法在上级显示的专业 canNotDisplayInParentForumsId
  * */


  await client.flushdbAsync();

  for(const forum of forums) {

    let key, data;
    // 下层子专业
    key = `forum:${forum.fid}:childForumsId`;
    if(forum.childForumsId.length !== 0) {
      await client.saddAsync(key, forum.childForumsId);
    }

    // 所有子专业
    key = `forum:${forum.fid}:allChildForumsId`;
    if(forum.allChildForumsId.length !== 0) {
      await client.saddAsync(key, forum.allChildForumsId);
    }


    // 所有父级专业
    key = `forum:${forum.fid}:parentForumsId`;
    if(forum.parentForumsId.length !== 0) {
      await client.saddAsync(key, forum.parentForumsId);
    }

  }

  const rolesDB = await RoleModel.find({});
  const gradesDB = await RoleModel.find({});

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


  for (const forum of forumsTree) {
    // 角色能访问的专业
    const getAccessibleForumsId = (forum) => {
      const {accessible, relation, gradesId, rolesId, fid} = forum;
      if(!accessible) return;
      const allowedRoles = rolesId;
      const allowedGrades = gradesId;
      if(relation === 'or') {
        for(const roleId of rolesId) {
          if(!roles[roleId]) {
            roles[roleId] = [];
          }
          if(!roles[roleId].includes(fid)) {
            roles[roleId].push(fid);
          }
        }
        for(const gradeId of gradesId) {
          if(!grades[gradeId]) {
            grades[gradeId] = [];
          }
          if(!grades[gradeId].includes(fid)) {
            grades[gradeId].push(fid);
          }
        }
      } else {
        for(const r of rolesId) {
          for(const g of gradesId) {
            const key = `role-grade:${r}-${g}`;
            if(!rolesAndGrades[key]) {
              rolesAndGrades[key] = [];
            }
            if(!rolesAndGrades[key].includes(fid)) {
              rolesAndGrades[key].push(fid);
            }
          }
        }
      }
      for(const f of forum.childForums){

        // 若上级版块的角色与等级关系为and，则本级版块的角色与等级关系也应该为and
        // 移除上级版块没有的角色和等级
        const {accessible, gradesId, rolesId} = f;
        if(!accessible) continue;
        if(relation === 'and') f.relation = 'and';
        for(let i = 0; i < gradesId.length; i++) {
          if(!allowedGrades.includes(gradesId[i])) {
            gradesId.splice(i, 1);
          }
        }
        for(let i = 0; i < rolesId.length; i++) {
          if(!allowedRoles.includes(rolesId[i])) {
            rolesId.splice(i, 1);
          }
        }
        getAccessibleForumsId(f);
      }
    };
    getAccessibleForumsId(forum);

    // 版主
    const getForumsOfModerators = (forum) => {
      if(!forum.accessible) return;
      for(const uid of forum.moderators) {
        if(!moderators[uid]) {
          moderators[uid] = [];
        }
        if(!moderators[uid].includes(forum.fid)) {
          moderators[uid].push(forum.fid);
        }
        const fn = (f) => {
          for(const f_ of f.childForums) {
            if(!f_.accessible) continue;
            moderators[uid].push(f_.fid);
            fn(f_);
          }
        };
        fn(forum);
      }
      for(const f of forum.childForums) {
        getForumsOfModerators(f);
      }
    };
    getForumsOfModerators(forum);
  }
  console.log(roles)

  for(const roleId in roles) {

    if(!roles.hasOwnProperty(roleId)) continue;

    const key = `role:${roleId}:accessibleForumsId`;

    if(roles[roleId].length !== 0) {
      await client.saddAsync(key, roles[roleId]);
    }
  }

  for(const gradeId in grades) {

    if(!grades.hasOwnProperty(gradeId)) continue;

    const key = `grade:${gradeId}:accessibleForumsId`;

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

    const key = `role-grade:${roleAndGrade}:accessibleForumsId`;

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

    const key = `moderator:${moderator}:accessibleForumsId`;

    if(moderators[moderator].length !== 0) {
      await client.saddAsync(key, moderators[moderator]);
    }
  }

  const key = `canNotDisplayInParentForumsId`;
  if(canNotDisplayInParentForumsId.length !== 0) {
    await client.saddAsync(key, canNotDisplayInParentForumsId);
  }



  console.log(`缓存完成，耗时：${Date.now() - t}ms`);
};

module.exports = cacheForums;
