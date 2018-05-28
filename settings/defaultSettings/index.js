const settings = [
	'server',
	'fund',
	'kcb',
	'system',
	'score'
];
const defaultSettings = settings.map(n => {
	return require(`./${n}`);
});
module.exports = defaultSettings;