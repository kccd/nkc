const settings = [
	'server',
	'fund',
	'kcb',
	'system',
	'score',
	'log'
];
const defaultSettings = settings.map(n => {
	return require(`./${n}`);
});
module.exports = defaultSettings;