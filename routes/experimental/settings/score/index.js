const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {t} = query;
		data.t = t;
		data.scoreSettings = await db.SettingModel.getSettings('score');
		data.scoreSettings.operations.map(o => {
			o.name = ctx.state.lang('kcbsTypes', o.type);
		});
		ctx.template = 'experimental/settings/score/score.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body, nkcModules} = ctx;
		const {checkNumber, checkString} = nkcModules.checkData;
		const {files, fields} = body;
		const scoreSettings = JSON.parse(fields.scoreSettings);
		const {
			creditMin, creditMax, nkcBankName,
			scores
		} = scoreSettings;
		const operationScores = {
			attachmentScore: '附件交易',
			shopScore: '商品交易',
			usernameScore: '用户名修改',
			watermarkScore: '去图片/视频水印',
			postRewardScore: '随机红包',
			digestRewardScore: '精选稿费',
			shareRewardScore: '分享奖励',
			surveyRewardScore: '问卷调查奖励',
			creditScore: '鼓励转账'
		};
		checkString(nkcBankName, {
			name: '系统账户名称',
			minLength: 1,
			maxLength: 20
		});
		const enabledScoreTypes = [];
		for(const scoreType in scores) {
			if(!scores.hasOwnProperty(scoreType)) continue;
			if(scores[scoreType].enabled) enabledScoreTypes.push(scoreType);
		}
		for(const operationName in operationScores) {
			if(!operationScores.hasOwnProperty(operationName)) continue;
			if(!enabledScoreTypes.includes(scoreSettings[operationName])) {
				ctx.throw(400, `「${operationScores[operationName]}」积分类型设置错误，请检查`);
			}
		}


		for(const operation of scoreSettings.operations) {
			const {count, cycle} = operation;
			if(!['day'].includes(cycle)) ctx.throw(400, '积分策略中的周期设置错误')
			checkNumber(count, {
				name: '积分策略中的次数'
			});
			if(count < 0 && count !== -1) ctx.throw(400, '积分策略中的次数只能为-1或非负整数');
			for(const scoreType in scores) {
				if(!scores.hasOwnProperty(scoreType)) continue;
				checkNumber(operation[scoreType], {
					name: '积分策略中的加减积分值',
					fractionDigits: 2
				});
			}
		}

		checkNumber(creditMin, {
			name: '最小鼓励金额',
			min: 1,
			fractionDigits: 2,
		});
		checkNumber(creditMax, {
			name: '最大鼓励金额',
			min: 1,
			fractionDigits: 2,
		});
		if(creditMin > creditMax) ctx.throw(400, '鼓励金额设置错误');

		await db.SettingModel.updateOne({_id: 'score'}, {
			$set: {
				c: scoreSettings
			}
		});
		await db.SettingModel.saveSettingsToRedis('score');
		for(let i = 1; i <= 5; i++) {
			const scoreType = `score${i}`;
			const file = files[scoreType];
			if(!file) continue;
			await db.AttachmentModel.saveScoreIcon(file, scoreType);
		}
		await next();
	})
module.exports = router;
