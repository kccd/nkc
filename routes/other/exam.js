const Router = require('koa-router');
const cookieSignature = require('cookie-signature');
const settings = require('../../settings');
const examRouter = new Router();
examRouter
  //选择考试科目页面
  .get('/', async (ctx, next) => {
  	const {data, query} = ctx;
  	const {type, info, status, isA} = query;
  	const {user} = data;
		if(!user) ctx.throw(403, '请登录后再参加考试。');
    data.type = 'chooseCategory';
    if(type === 'result') {
    	data.type = type;
    	data.info = decodeURI(info);
    	data.status = status;
    	data.isA = isA;
    } else {
	    if(user.volumeA && user.certs.includes('examinated')) {
		    ctx.throw(400, '您已通过A卷和B卷考试，不需要再参加考试了。');
	    }
    }
    ctx.template = 'interface_exam.pug';
    await next();
  })
  //获得试卷
  .get('/:category', async (ctx, next) => {
  	const {data, db, params} = ctx;
  	const {user} = data;
  	if(!user) ctx.throw(403, '请登录后再参加考试。');
  	const {category} = params;
  	let numberOfSubject = settings.exam.numberOfSubject;
  	let numberOfCommon = settings.exam.numberOfCommon;
  	if(category === 'mix') {
  		if(user.volumeA) ctx.throw(400, '您已通过A卷考试，不需要再参加A卷考试了。');
		  const answerSheets = await db.AnswerSheetModel.find({uid: user.uid, isA: true, toc: {$gt: Date.now() - 24*60*60*1000}}).sort({toc: -1});
		  if(answerSheets.length >= settings.exam.numberOfExam) ctx.throw(403, `抱歉！24小时内同一账号考A卷只有${settings.exam.numberOfExam}次考试机会。`);
			numberOfSubject = settings.exam.numberOfSubjectA;
			numberOfCommon = settings.exam.numberOfCommonA;
	  } else {
		  if(user.volumeB) ctx.throw(400, '您已通过B卷考试，不需要再参加B卷考试了。');
		  const answerSheets = await db.AnswerSheetModel.find({uid: user.uid, isA: false, toc: {$gt: Date.now() - 24*60*60*1000}}).sort({toc: -1});
		  if(answerSheets.length >= settings.exam.numberOfExam) ctx.throw(403, `抱歉！24小时内同一账号考B卷只有${settings.exam.numberOfExam}次考试机会。`);
	  }
	  const commonCount = await db.QuestionModel.count({category: 'common'});
  	const subjectCount = await db.QuestionModel.count({category});
  	if(commonCount < numberOfCommon) ctx.throw(500, `普通题数量不足。`);
  	if(subjectCount < numberOfSubject) ctx.throw(500, `专业题数量不足。`);
  	const {apiFunction} = ctx.nkcModules;
		const commonRandomNumber = apiFunction.getRandomNumber({min: 0, max: (commonCount-1), count: numberOfCommon, repeat: false});
	  const subjectRandomNumber = apiFunction.getRandomNumber({min: 0, max: (subjectCount-1), count: numberOfSubject, repeat: false});
	  const commonRandom = await Promise.all(commonRandomNumber.map(async number => {
		  const question = await db.QuestionModel.findOne({category: 'common'}).skip(number);
		  if(!question) ctx.throw(500, `组成试卷错误。`);
		  if(question.type === 'ch4') {
			  const {answer} = question;
			  const answerRandom = [];
			  const arr = apiFunction.getRandomNumber({min: 0, max: 3, count: 4, repeat: false});
			  for(let i = 0; i < answer.length; i++) {
				  answerRandom[arr[i]] = answer[i];
			  }
			  question.answer = answerRandom;
		  }
		  return question;
	  }));
	  const subjectRandom = await Promise.all(subjectRandomNumber.map(async number => {
		  const question = await db.QuestionModel.findOne({category}).skip(number);
		  if(!question) ctx.throw(500, `组成试卷错误。`);
		  if(question.type === 'ch4') {
			  const {answer} = question;
			  const answerRandom = [];
			  const arr = apiFunction.getRandomNumber({min: 0, max: 3, count: 4, repeat: false});
			  for(let i = 0; i < answer.length; i++) {
				  answerRandom[arr[i]] = answer[i];
			  }
			  question.answer = answerRandom;
		  }
		  return question;
	  }));
		const questions = commonRandom.concat(subjectRandom).map(q => {
			const obj = {
				question: q.question,
				type: q.type,
				qid: q.qid
			};
			if(q.type === 'ch4') {
				obj.choices = q.answer;
			}
			return obj;
		});
		const exam = {
			toc: Date.now(),
			qarr: questions
		};
		let signature = '';
		for(let question of questions) {
			signature += question.qid;
		}
		signature += exam.toc.toString();
		signature = cookieSignature.sign(signature, settings.cookie.secret);
		exam.signature = signature;
		data.exam = exam;
		data.category = category;
		data.type = 'getQuestions';
		ctx.template = 'interface_exam.pug';
		await next();
  })
  //提交试卷
  .post('/subject', async (ctx, next) => {
  	const {data, db, body} = ctx;
		const {user} = data;
		if(!user) ctx.throw(403, '请登录后再参加考试。');
	  const {settings} = ctx;
		const {exam, sheet, category} = body;
		if(!exam) ctx.throw(400, '缺少必要的参数。');
		let signature = '';
	  const qids = [];
	  for(let obj of exam.qarr) {
			signature += obj.qid;
			qids.push(obj.qid);
		}
		signature += exam.toc.toString();
		const unsignedSignature = cookieSignature.unsign(exam.signature, settings.cookie.secret);
	  if(unsignedSignature === false) ctx.throw (404, 'signature invalid. consider re-attend the exam.');
	  if(unsignedSignature !== signature) {
		  ctx.throw(400, 'signature problematic');
	  }
	  if(Date.now() - exam.toc > settings.exam.timeLimit) ctx.throw(400, 'overtime. please refresh');
		if(!sheet) ctx.throw(400, '缺少必要的参数。');
		if(sheet.length !== exam.qarr.length) ctx.throw(400, '缺少必要的参数。');
		const questionsOfDB = await Promise.all(qids.map(async qid => await db.QuestionModel.findOnly({qid})));
		const isA = questionsOfDB[0].category === 'mix';
	  data.isA = isA;
	  if(isA && user.volumeA) ctx.throw(400, '您已通过A卷考试，没有必要重新参加A卷考试。');
	  if(!isA && user.volumeB) ctx.throw(400, '您已通过B卷考试，没有必要重新参加B卷考试。');
	  const ip = ctx.address;
	  const answerSheets = await db.AnswerSheetModel.find({uid: user.uid, isA, toc: {$gt: Date.now() - 24*60*60*1000}}).sort({toc: -1});
	  if(answerSheets.length >= settings.exam.numberOfExam) ctx.throw(403, `抱歉！24小时内同一账号考${isA? 'A': 'B'}卷只有${settings.exam.numberOfExam}次考试机会。`);
	  let score = 0;
		const records = [];
		for(let i = 0; i < questionsOfDB.length; i++) {
			const question = questionsOfDB[i];
			let correctness;
			if(['', null, undefined].includes(sheet[i])) {
				correctness = false;
			} else {
				switch (question.type) {
					case 'ch4': {
						correctness = (exam.qarr[i].choices[sheet[i]] === question.answer[0]);
						break;
					}
					case 'ans': {
						correctness = (sheet[i] === question.answer);
						break;
					}
				}
			}
			records.push({
				qid: qids[i],
				correct: correctness
			});
			score += correctness? 1: 0;
		}
		const newAnswerSheet = db.AnswerSheetModel({
			ip,
			isA,
			score,
			category,
			records,
			uid: user.uid,
			toc: exam.toc,
			tsm: Date.now(),
		});
		await newAnswerSheet.save();
		if(score < settings.exam.passScore) {
			ctx.throw(400, '别气馁，请继续努力。');
		}
		if(!isA && !user.certs.includes('examinated')) {
			user.certs.push('examinated');
			user.volumeB = true;
		}
		user.volumeA = true;
		await user.save();
		await next();
  });

module.exports = examRouter;