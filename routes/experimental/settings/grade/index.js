const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.grades = await db.UsersGradeModel.find({}).sort({_id: 1});
		data.gradeSettings = await db.SettingModel.getSettings('grade');
		ctx.template = "experimental/settings/grade/grade.pug";
		await next();
	})
	.put("/", async (ctx, next) => {
		const {db, body, nkcModules, redis} = ctx;
		const {grades, gradeSettings} = body;
		const {checkString, checkNumber} = nkcModules.checkData;
		// 检查系数
		for(const key in gradeSettings.coefficients) {
			if(!gradeSettings.coefficients.hasOwnProperty(key)) continue;
			checkNumber(gradeSettings.coefficients[key], {
				name: '积分系数',
				fractionDigits: 2,
			});
		}
		await db.SettingModel.updateOne({_id: 'grade'}, {
			$set: {
				"c.coefficients": gradeSettings.coefficients
			}
		});
		await db.SettingModel.saveSettingsToRedis('grade');
		const names = [], scores = [];
		grades.map(g => {
			const {displayName, score} = g;
			checkString(displayName, {
				name: "等级名称",
				minLength: 1,
				maxLength: 20
			});
			checkNumber(score, {
				name: "积分值",
				min: 0
			});
			if(names.includes(displayName)) {
				ctx.throw(400, "等级名称重复");
			}
			if(scores.includes(score)) {
				ctx.throw(400, "积分值重复");
			}
			names.push(displayName);
			scores.push(score);
		});
		const grades_ = [];
		grades.map(g => {
			if(grades_.length === 0) {
				grades_.push(g);
			} else {
				let insert = false;
				for(let j = 0; j < grades_.length; j++) {
					const g_ = grades_[j];
					if(g.score < g_.score) {
						grades_.splice(j, 0, g);
						insert = true;
						break;
					}
				}
				if(!insert) grades_.push(g);
			}
		});
		await db.UsersGradeModel.remove({});
		for(let i = 0; i < grades_.length; i++) {
			let grade = grades_[i];
			grade._id = i;
			delete grade.__v;
			grade = db.UsersGradeModel(grade);
			await grade.save();
		}
		await redis.cacheForums();
		await next();
	});
module.exports = router;
