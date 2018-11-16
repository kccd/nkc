const settings = [
	'server',
	'fund',
	'kcb',
	'system',
	'score',
	'download',
	'log',
	'download',
	'home',
	'exam',
	'page',
	'forum',
	'sms',
  'xsf'
];
const defaultSettings = settings.map(n => {
	return require(`./${n}`);
});
module.exports = defaultSettings;