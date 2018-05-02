const {SettingModel} = require('../dataModels');

(async () => {
	console.log('initialize settings of kcb...');
	const newSetting = SettingModel({
		type: 'kcb',
		defaultUid: '5805',
		changeUsername: 200
	});
	await newSetting.save();
	console.log('done.');
})();
