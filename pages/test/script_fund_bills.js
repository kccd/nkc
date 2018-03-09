const {FundBillModel} = require('../../dataModels');

(async () => {
	const bill_1 = FundBillModel({
		_id: "1518261624960",
		abstract: "拨款",
		notes: "2018H1第1期拨款",
		money: 900,
		toc: new Date('2018-2-10 19:20:24'),
		from: {
			type: "fund",
			id: "H"
		},
		to: {
			type: "user",
			id: "14058"
		},
		applicationFormId: 6,
		uid: "1"
	});
	const bill_2 = FundBillModel({
		_id: "1520252348160",
		abstract: "拨款",
		notes: "2018H2第1期拨款",
		money: 1000,
		toc: new Date('2018-3-5 20:19:08'),
		from: {
			type: "fund",
			id: "H"
		},
		to: {
			type: "user",
			id: "50827"
		},
		applicationFormId: 10,
		uid: "10"
	});
	await bill_1.save();
	await bill_2.save();
	console.log('存入完成。');
})();

