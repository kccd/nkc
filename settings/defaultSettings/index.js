const settings = [
	'server',
	'fund',
	'kcb',
	'system',
	'score',
	'log',
	'download'
];
const defaultSettings = settings.map(n => {
	return require(`./${n}`);
});
module.exports = defaultSettings;