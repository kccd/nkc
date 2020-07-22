const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const downloadSettings = await db.SettingModel.getSettings("download");
    const {options} = downloadSettings;
    const roles = await db.RoleModel.find({_id: {$nin: ["default", "banned"]}}).sort({toc: 1});
    const grades = await db.UsersGradeModel.find().sort({toc: 1});
    const optionsObj = {};
    options.map(option => {
      optionsObj[`${option.type}_${option.id}`] = option;
    });
    data.roleOptions = [];
    data.gradeOptions = [];
    roles.map(role => {
      let option = optionsObj[`role_${role._id}`];
      if(!option) {
        option = {
          id: role._id,
          type: "role",
          fileCountOneDay: 0,
          speed: 1
        };
      }
      option.name = role.displayName;
      data.roleOptions.push(option);
    });
    grades.map(grade => {
      let option = optionsObj[`grade_${grade._id}`];
      if(!option) {
        option = {
          id: grade._id,
          type: "grade",
          fileCountOneDay: 0,
          speed: 1
        };
      }
      option.name = grade.displayName;
      data.gradeOptions.push(option);
    });
		ctx.template = 'experimental/settings/download.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {options} = body;
    const options_ = [];
    const {checkNumber} = nkcModules.checkData;
    for(const option of options) {
      const {type, id, fileCountOneDay, speed} = option;
      checkNumber(fileCountOneDay, {
        name: "每天下载附件个数",
        min: 0
      });
      checkNumber(speed, {
        name: "下载速度",
        min: 1
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
        speed
      });
    }
    await db.SettingModel.updateOne({_id: "download"}, {
      $set: {
        "c.options": options_
      }
    });
    await db.SettingModel.saveSettingsToRedis("download");
		await next();
	});
module.exports = router;
