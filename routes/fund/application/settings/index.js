const Router = require('koa-router');
const settingsRouter = new Router();
const memberRouter = require('./member');
const postRouter = require('./post');
const giveUpRouter = require('./giveUp');
const deleteRouter = require('./delete');
const cheerio = require('cheerio');
settingsRouter
  .use('/', async (ctx, next) => {
    const {data, state} = ctx;
    const {applicationForm} = data;
    if(applicationForm.uid !== state.uid) ctx.throw(403, `权限不足`);
    await next();
  })
	.get('/', async (ctx, next) => {
		const {data, db, nkcModules} = ctx;
		data.nav = '填写申请表';
		const {user, applicationForm} = data;
		const {fund} = applicationForm;
		if(applicationForm.disabled) ctx.throw(403,'抱歉！该申请表已被屏蔽。');
		if(applicationForm.useless !== null) ctx.throw(403,'申请表已失效，无法完成该操作。');
		if(applicationForm.modifyCount >= fund.modifyCount) {
			await applicationForm.updateOne({useless: 'exceededModifyCount'});
			throw '抱歉！申请表的修改次数已超过限制，无法提交修改。';
		}
		const {lock} = applicationForm;
		if(user.uid !== applicationForm.uid) ctx.throw(403,'权限不足');
		if(lock.submitted) ctx.throw(400, '申请表已提交，无法修改。');
		let {s} = ctx.query;
		if(s) {
			s = parseInt(s);
		} else {
			s = 1;
		}
		if(applicationForm.status.submitted && s === 1) s = 2;
		if(s === 3) {
			await applicationForm.extendProject();
		}
		if(s === 4) {
      data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
      data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		}

		if(s === 5) {
			const project = await data.applicationForm.extendProject();
			project.c = nkcModules.nkcRender.renderHTML({
				type: "article",
				post: {
					c: project.c,
					resources: await db.ResourceModel.getResourcesByReference(`fund-${project._id}`)
				},
				user: data.user
			});
		}
		if(s > 5) ctx.throw(404, 'not found');
		data.s = s;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: applicationForm.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		ctx.template = 'fund/apply/editForm.pug';
		await applicationForm.updateOne({'lock.submitted': false});
		if(applicationForm.toObject) {
      data.applicationForm = applicationForm.toObject();
    }

    if(ctx.query.new) {
      ctx.template = 'fund/apply/apply.pug';
      const {db, nkcModules, data, params, state} = ctx;
      const applicationForm = await db.FundApplicationFormModel.findOnly({_id: params._id});
      const fund = await db.FundModel.findOnly({_id: applicationForm.fundId});
      const applicant = await applicationForm.extendApplicant();
      const members = await db.FundApplicationUserModel.find({
        applicationFormId: applicationForm._id,
        uid: {$ne: state.uid},
        removed: false
      }).sort({toc: 1});
      const usersId = members.map(m => m.uid);
      const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, avatar: 1, username: 1});
      const posts = await db.PostModel.find({type: 'thread', tid: {$in: applicationForm.threadsId.applying}});
      const forums = await db.ForumModel.find({fid: applicationForm.category}, {fid: 1, displayName: 1});
      const project = await applicationForm.extendProject();
      data.settingsData = {
        applicationForm,
        applicant,
        fund,
        users,
        posts,
        members,
        forums,
        project: project || {
          t: '',
          c: '',
          abstractEn: '',
          abstractCn: '',
          keyWordsCn: [],
          keyWordsEn: [],
        },
      };
    }
		await next();
	})
  .post('/', async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {
      fund, applicationForm
    } = data;
    const {form, applicant, project, type} = body;
    const {checkString, checkNumber} = nkcModules.checkData;
    const {
      account,
      from,
      projectCycle,
      budgetMoney,
      threadsId,
      category
    } = form;
    const {
      name,
      idCardNumber,
      mobile,
      description,
      lifePhotosId,
    } = applicant;
    const {
      t,
      c,
      abstractEn,
      abstractCn,
      keyWordsEn,
      keyWordsCn,
    } = project;
    const {
      paymentType,
      bankName,
      name: accountName,
      number,
    } = account;

    const _budgetMoney = [];

    for(let i = 0; i < budgetMoney.length; i++) {
      const {
        count,
        money,
        purpose,
        suggest,
        fact
      } = budgetMoney[i];

      _budgetMoney.push({
        count,
        money,
        purpose,
        /*total: Math.round(money * 100) * count / 100,
        suggest: suggest || null,
        fact: fact || null*/
      });
    }

    if(type === 'submit') {
      checkString(name, {
        name: '真实姓名',
        minLength: 1,
        maxLength: 30
      });
      checkString(idCardNumber, {
        name: '身份证号码',
        minLength: 18,
        maxLength: 18
      });
      checkString(mobile, {
        name: '联系电话',
        minLength: 5,
        maxLength: 30
      });
      if(paymentType === 'bankCard') {
        checkString(bankName, {
          name: '银行全称',
          minLength: 1,
          maxLength: 30
        });
      }
      checkString(accountName, {
        name: '户名',
        minLength: 1,
        maxLength: 30
      });
      checkString(number, {
        name: '收款账号',
        minLength: 1,
        maxLength: 30
      });
      checkString(description, {
        name: '自我介绍',
        minLength: 1,
        maxLength: 2000
      });
      if(fund.necessaryPhoto && lifePhotosId.length === 0) {
        ctx.throw(400, `请至少选择一张生活照`);
      }
      if(!['personal', 'team'].includes(from)) {
        ctx.throw(400, `请选择申请方式`)
      }
      checkNumber(projectCycle, {
        name: '研究周期',
        min: 1,
      });

      if(!applicationForm.fixedMoney) {
        let total = 0;
        if(_budgetMoney.length === 0) ctx.throw(400, `请输入资金预算`);
        for(let i = 0; i < _budgetMoney.length; i++) {
          const {
            count,
            money,
            purpose,
            suggest,
            fact
          } = _budgetMoney[i];
          const baseName = `资金预算第 ${i + 1} 项 - `;
          checkString(purpose, {
            name: baseName + '用途',
            minLength: 1,
            maxLength: 50
          });
          checkNumber(count, {
            name: baseName + '数量',
            min: 1,
          });
          checkNumber(money, {
            name: baseName + '单价',
            min: 0.01,
            fractionDigits: 2
          });
          _budgetMoney[i].total = Math.round(money * 100) * count / 100;
          _budgetMoney[i].suggest = suggest || null;
          _budgetMoney[i].fact = fact || null;
          total += _budgetMoney[i].total * 100;
        }
        if(total / 100 > fund.money.value) {
          ctx.throw(400, `资金预算总金额已超过该基金单笔申请的最大金额`);
        }
      }


      const agreeMembersId = await db.FundApplicationUserModel.getAgreeMembersId(applicationForm._id);
      const applicationFormUsersId = [applicationForm.uid].concat(agreeMembersId);
      const posts = await db.PostModel.find({
        type: 'thread',
        tid: {
          $in: threadsId.applying
        }
      }, {
        t: 1,
        uid: 1
      });
      if(posts.length !== threadsId.applying.length) ctx.throw(400, `技术文章 ID 错误，请重新选择`);
      for(const post of posts) {
        if(!applicationFormUsersId.includes(post.uid)) {
          ctx.throw(400, `技术文章「${post.t}」不属于你或你的组员，请删除`);
        }
      }
      if(posts.length < fund.thread.count) {
        ctx.throw(400, `请至少选择 ${fund.thread.count} 篇技术文章`);
      }
      if(!category) ctx.throw(400, `请选择学科分类`);
      const formForum = await db.ForumModel.findOne({fid: category}, {fid: 1});
      if(!formForum) ctx.throw(400, `学科分类错误，请重新选择`);

      // 项目信息
      checkString(t, {
        name: '项目名称',
        minLength: 1,
        maxLength: 500
      });
      checkString(abstractCn, {
        name: '中文摘要',
        minLength: 0,
        maxLength: 2000
      });
      checkString(abstractEn, {
        name: '英文摘要',
        minLength: 0,
        maxLength: 2000
      });
      for(const k of keyWordsCn) {
        checkString(k, {
          name: '中文关键词',
          minLength: 1,
          maxLength: 30
        });
      }
      for(const k of keyWordsEn) {
        checkString(k, {
          name: '英文关键词',
          minLength: 1,
          maxLength: 30
        });
      }
      checkString(c, {
        name: '项目内容',
        maxLength: 1000000
      });
      const content = cheerio.load(c);
      const count = content('body').text().length;
      if(count === 0) ctx.throw(400, `项目内容不能为空`);
      if(count > 100000) ctx.throw(400, `项目内容不能超过 10 万字`);

      // 组员

      const members = await db.FundApplicationUserModel.countDocuments({
        applicationFormId: applicationForm._id,
        uid: {$ne: applicationForm.uid},
        type: 'member',
        agree: null,
        removed: false,
      });
      if(members.length > 0) ctx.throw(400, `还有组员未上车，请等一等`);
      if(from === 'team' && agreeMembersId.length === 0) {
        ctx.throw(400, `请至少添加一个组员`);
      }
    }

    const formObj = {
      account: {
        paymentType,
        bankName,
        name: accountName,
        number
      },
      from,
      projectCycle,
      budgetMoney: _budgetMoney,
      'threadsId.applying': threadsId.applying,
      category
    };

    if(this.projectId) {
      const document = await db.FundDocumentModel.findOnly({_id: this.projectId});
      document.t = t;
      document.c = c;
      document.abstractEn = abstractEn;
      document.abstractCn = abstractCn;
      document.keyWordsCn = keyWordsCn;
      document.keyWordsEn = keyWordsEn;
      await document.save();
    } else {
      const documentId = await db.SettingModel.operateSystemID('fundDocuments', 1);
      const newDocument = db.FundDocumentModel({
        _id: documentId,
        uid: applicationForm.uid,
        applicationFormId: applicationForm._id,
        type: 'project',
        t,
        abstractCn,
        abstractEn,
        keyWordsCn,
        keyWordsEn,
        c
      });
      await newDocument.save();
      formObj.projectId = documentId;
    }

    let _applicant = await applicationForm.extendApplicant();
    await _applicant.updateOne({
      $set: {
        name,
        idCardNumber,
        mobile,
        description,
        lifePhotosId
      }
    });
    await db.FundApplicationFormModel.updateOne({_id: applicationForm._id}, {
      $set: formObj
    });
    await db.FundApplicationFormModel.updateMoneyByApplicationFormId(applicationForm._id);
    await next();
  })
  .use('/post', postRouter.routes(), postRouter.allowedMethods())
  .use('/member', memberRouter.routes(), memberRouter.allowedMethods())
  .use(['/delete', '/giveup'], async (ctx, next) => {
    if(ctx.data.applicationForm.useless !== null) {
      ctx.throw(400, `申请表已失效，无法完成该操作`);
    }
    await next();
  })
  .use('/delete', deleteRouter.routes(), deleteRouter.allowedMethods())
  .use('/giveup', giveUpRouter.routes(), giveUpRouter.allowedMethods());
module.exports = settingsRouter;