const settings = [
	'server',
	'fund',
	'kcb',
	'system',
	'score',
	'download',
	'log'
];
const defaultSettings = settings.map(n => {
	return require(`./${n}`);
});
module.exports = defaultSettings;