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
		const _files = [];
		const scoreSettings = JSON.parse(fields.scoreSettings);
		const {
			moneyWeight, withdrawEnabled, withdrawMin, withdrawMax,
			withdrawCountOneDay, withdrawTimeBegin, withdrawTimeEnd,
			withdrawFee, creditMin, creditMax, mainScore, attachmentScore, shopScore,
			scores
		} = scoreSettings;
		checkNumber(withdrawMin, {
			name: '最小提现金额',
			min: 0.01,
			max: withdrawMax,
			fractionDigits: 2,
		});
		checkNumber(withdrawMax, {
			name: '最大提现金额',
			min: withdrawMin,
			fractionDigits: 2,
		});
		checkNumber(withdrawCountOneDay, {
			name: '每天最大提现次数',
			min: 0,
		});
		checkNumber(withdrawTimeBegin, {
			name: '提现时间段',
			min: 0,
			max: withdrawTimeEnd,
		});
		checkNumber(withdrawTimeEnd, {
			name: '提现时间段',
			min: withdrawTimeBegin,
		});
		checkNumber(withdrawFee, {
			name: '提现手续费',
			min: 0,
			max: 100,
			fractionDigits: 4,
		});
		checkNumber(creditMin, {
			name: '最小提现金额',
			min: 0.01,
			max: creditMax,
			fractionDigits: 2,
		});
		checkNumber(creditMax, {
			name: '最大提现金额',
			min: creditMin,
			fractionDigits: 2,
		});
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
