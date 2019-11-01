const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {options} = await db.SettingModel.getSettings("upload");
    let roleOptions = [], gradeOptions = [];
    const roles = await db.RoleModel.find({_id: {$nin: ["default", "banned", "visitor"]}}).sort({toc: 1});
    const grades = await db.UsersGradeModel.find().sort({toc: 1});
    let optionsObj = {};
    for(const option of options) {
      optionsObj[`${option.type}_${option.id}`] = option;
    }
    for(const role of roles) {
      let option = optionsObj[`role_${role._id}`];
      if(!option) {
        option = {
          type: "role",
          id: role._id,
          fileCountOneDay: 0,
          blackExtensions: []
        }
      }
      option.name = role.displayName;
      option.blackExtensions = option.blackExtensions.join(", ");
      roleOptions.push(option);
    }
    for(const grade of grades) {
      let option = optionsObj[`grade_${grade._id}`];
      if(!option) {
        option = {
          type: "grade",
          id: grade._id,
          fileCountOneDay: 0,
          blackExtensions: []
        }
      }
      option.name = grade.displayName;
      option.blackExtensions = option.blackExtensions.join(", ");
      gradeOptions.push(option);
    }
    data.gradeOptions = gradeOptions;
    data.roleOptions = roleOptions;
    ctx.template = "experimental/settings/upload/upload.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {options} = body;
    const options_ = [];
    const {checkNumber} = nkcModules.checkData;
    for(const option of options) {
      const {type, id, fileCountOneDay, blackExtensions} = option;
      const bs = [];
      blackExtensions.split(",").map(b => {
        b = b.trim();
        b = b.toLowerCase();
        if(b) bs.push(b);
      });
      checkNumber(fileCountOneDay, {
        name: "每天下载附件个数",
        min: 0
      });
      if(type === "role") {
        const role = await db.RoleModel.findOne({_id: id});
        if(!role) continue;
      } else {
        const grade = await db.UsersGradeModel.findOne({_id: id});
        if(!grade) continue;
      }
      options_.push({
        type,
        id, 
        fileCountOneDay,
        blackExtensions: bs
      });
    }
    await db.SettingModel.updateOne({_id: "upload"}, {
      $set: {
        "c.options": options_
      }
    });
    await db.SettingModel.saveSettingsToRedis("upload");
		await next();
  });
module.exports = router;