const Router = require("koa-router");
const router = new Router();
router
  .use("/", async (ctx, next) => {
    const {db, params, data} = ctx;
    const {surveyId} = params;
    const survey = await db.SurveyModel.findOne({_id: surveyId});
    if(!survey) ctx.throw(400, `未找到ID为${surveyId}的表单`);
    if(survey.disabled) ctx.throw(403, "表单已屏蔽");
    data.survey = survey;
    await next();
  })
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {survey} = data;
    data.havePermission = false;
    data.users = await survey.getPostUsers();
    data.allowedUsers = await db.UserModel.find({uid: {$in: survey.permission.uid}});
    data.targetUser = await db.UserModel.findOnly({uid: survey.uid});
    if(data.user) {
      data.surveyPost = await db.SurveyPostModel.findOne({uid: data.user.uid, surveyId: survey._id});
      try{
        await survey.checkUserPermission(data.user.uid);
        data.havePermission = true;
      } catch(err) {
        console.log(err);
      }
    } else {
      data.surveyPost = await db.SurveyPostModel.findOne({surveyId: survey._id, ip: ctx.address});
      try{
        await survey.checkUserPermission("", ctx.address);
        data.havePermission = true;
      } catch(err) {
        console.log(err);
      }
    }
    // 获取投票结果
    if(
      survey.showResult === "all" ||
      data.user && data.user.uid === survey.uid ||
      ctx.permission("showSecretSurvey") ||
      survey.showResult === "posted" && data.surveyPost
    ) {
      data.showResult = true;
    } else {
      for(const option of survey.options) {
        delete option.postCount;
        for(const answer of option.answers) {
          delete answer.postScore;
          delete answer.postCount;
          delete answer.postMinScore;
          delete answer.postMaxScore;
        }
      }
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {checkString, checkNumber} = nkcModules.checkData;
    const {survey, user} = data;
    let {options} = body;
    await survey.ensurePostPermission(user?user.uid:"", ctx.address);

    const errorInfo = "数据异常，可能是发布者修改了选项信息。请刷新后重试。";

    if(survey.type === "vote") {
      survey.options = [survey.options[0]];
    }


    const checkOption = (o) => {
      const {optionId, answerId} = o;
      for(const option of survey.options) {
        if(option._id !== optionId) continue;
        for(const answer of option.answers) {
          if(answer._id === answerId) {
            return;
          }
        }
        ctx.throw(400, errorInfo);
      }
      ctx.throw(400, errorInfo);
    };

    let answerCount = 0;
    for(const option of survey.options) {
      answerCount += option.answers.length;
    }
    // 提交的选项数与调查表的选线数不相等，
    // 以后可能允许选填
    // 目前为必填
    // if(!options.length || options.length !== answerCount) ctx.throw(400, errorInfo);

    // 每个调查内容最大选择数和实际选择数
    const selectedCount = {};
    for(const option of survey.options) {
      selectedCount[option._id] = {
        maxVoteCount: option.maxVoteCount,
        minVoteCount: option.minVoteCount,
        selectedCount: 0
      };
    }

    for(let i = 0; i < options.length; i++) {
      const option = options[i];
      checkOption(option);
      const answer = survey.getAnswerById(option.optionId, option.answerId);
      if(survey.type === "score") {
        let score = option.score;
        if(score === "") ctx.throw(400, "还有未打分的选项，请检查");
        try{
          checkNumber(score, {
            name: `打分`,
            min: answer.minScore,
            max: answer.maxScore,
            fractionDigits: 2
          });
        } catch(err) {
          console.log(err)
          ctx.throw(400, "打分分值不在规定的范围内，请检查");
        }
        option[i] = {
          optionId: option.optionId,
          answerId: option.answerId,
          score,
          selected: false
        }
      } else {
        // 检测多选是否超出设置
        if(!!option.selected) {
          const sc = selectedCount[option.optionId];
          if(sc.selectedCount >= sc.maxVoteCount) {
            ctx.throw(400, "勾选选项的数目超过限制，请检查");
          } else {
            sc.selectedCount ++;
          }
        }
        option[i] = {
          optionId: option.optionId,
          answerId: option.answerId,
          score: "",
          selected: !!option.selected
        }
      }
    }

    // 检测多选是否超出设置
    if(survey.type !== "score") {
      for(const key in selectedCount) {
        if(!selectedCount.hasOwnProperty(key)) continue;
        const sc = selectedCount[key];
        if(sc.selectedCount < sc.minVoteCount) ctx.throw(400, "勾选选项的数目未达最低要求，请检查");
      }
    }

    const surveyPost = db.SurveyPostModel({
      _id: await db.SettingModel.operateSystemID("surveyPosts", 1),
      surveyId: survey._id,
      ip: ctx.address,
      port: ctx.port,
      surveyType: survey.type,
      uid: user?user.uid:"",
      options
    });
    await surveyPost.save();
    await survey.computePostCount();

    // 给予奖励
    if(data.user) {
      const lock = await nkcModules.redLock.lock(`surveyPost:${survey._id}`, 10000);
      const record = await db.SurveyPostModel.rewardPost( {
        surveyId: survey._id,
        uid: data.user.uid,
        ip: ctx.address,
        port: ctx.port
      });
      if(record && record.num !== undefined) data.rewardNum = record.num;
      try{
        await lock.unlock();
      } catch(err) {console.log(err.message || err)}
    }
    data.surveyPost = surveyPost;
    await next();
  });
module.exports = router;