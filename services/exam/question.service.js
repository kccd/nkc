const {
  ThrowBadRequestResponseTypeError,
  ThrowError,
} = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const { checkString } = require('../../nkcModules/checkData');
const QuestionModel = require('../../dataModels/QuestionModel');
const SettingModel = require('../../dataModels/SettingModel');
const QuestionTagModel = require('../../dataModels/QuestionTagModel');
const { userInfoService } = require('../user/userInfo.service');
const { questionTagService } = require('./questionTag.service');

class QuestionService {
  questionTypes = {
    ans: 'ans',
    ch4: 'ch4',
  };
  questionVolumes = {
    A: 'A',
    B: 'B',
  };
  checkQuestionType(type) {
    if (!Object.values(this.questionTypes).includes(type)) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_QUESTION_TYPE, [
        type,
      ]);
    }
  }
  checkQuestionVolume(volume) {
    if (!Object.values(this.questionVolumes).includes(volume)) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_QUESTION_VOLUME, [
        volume,
      ]);
    }
  }
  checkQuestionContentAndContentDesc(content = '', contentDesc = '') {
    checkString(content, {
      name: '试题题干内容',
      minLength: 1,
      maxLength: 500,
    });
    checkString(contentDesc, {
      name: '试题题干说明',
      maxLength: 500,
    });
  }
  checkQuestionAnswer(type, answer) {
    if (type === this.questionTypes.ch4) {
      if (answer.length <= 1) {
        ThrowBadRequestResponseTypeError(
          ResponseTypes.INVALID_CH4_QUESTION_ANSWER_COUNT,
        );
      }
      let hasCorrectAnswer = false;
      for (const item of answer) {
        checkString(item.text, {
          name: '选项内容',
          minLength: 1,
          maxLength: 200,
        });
        checkString(item.desc, {
          name: '选项说明',
          maxLength: 200,
        });
        if (item.correct) {
          hasCorrectAnswer = true;
        }
      }
      if (!hasCorrectAnswer) {
        ThrowBadRequestResponseTypeError(
          ResponseTypes.INVALID_CH4_QUESTION_CORRECT_ANSWER_COUNT,
        );
      }
    } else {
      if (answer.length !== 1) {
        ThrowBadRequestResponseTypeError(
          ResponseTypes.INVALID_ANS_QUESTION_ANSWER_COUNT,
        );
      }
      checkString(answer[0].text, {
        name: '答案内容',
        minLength: 1,
        maxLength: 200,
      });
      checkString(answer[0].desc, {
        name: '答案说明',
        maxLength: 200,
      });
    }
  }
  async checkQuestionTag(tagsId) {
    const { questionTagService } = require('./questionTag.service');
    const tags = await questionTagService.getTagsById(tagsId);
    // 存在无效的标签ID
    if (tags.length !== tagsId.length) {
      const existTagsId = tags.map((tag) => tag._id);
      const invalidTagsId = tagsId.filter(
        (tagId) => !existTagsId.includes(tagId),
      );
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_QUESTION_TAG_ID, [
        invalidTagsId.join(','),
      ]);
    }
    // 标签个数问题
    if (tagsId.length === 0) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_QUESTION_TAG_COUNT,
      );
    }
  }
  async checkQuestionInfo(props) {
    const { type, volume, tags, content, contentDesc, answer } = props;
    await this.checkQuestionType(type);
    await this.checkQuestionVolume(volume);
    await this.checkQuestionTag(tags);
    await this.checkQuestionContentAndContentDesc(content, contentDesc);
    await this.checkQuestionAnswer(type, answer);
  }
  async createQuestion(props) {
    const { type, volume, tags, content, contentDesc, answer, hasImage, uid } =
      props;
    const _id = await SettingModel.operateSystemID('questions', 1);
    const question = new QuestionModel({
      _id,
      type,
      volume,
      tags,
      content,
      contentDesc,
      answer: answer.map((item) => {
        return {
          text: item.text,
          desc: item.desc,
          correct: item.correct,
        };
      }),
      hasImage,
      uid,
    });
    await question.save();
    return question;
  }
  async modifyQuestion(props) {
    const {
      _id,
      type,
      oldAuth,
      volume,
      tags,
      content,
      contentDesc,
      answer,
      hasImage,
    } = props;
    const updateBody = {
      tags,
      content,
      contentDesc,
      answer: answer.map((item) => {
        return {
          text: item.text,
          desc: item.desc,
          correct: item.correct,
        };
      }),
      hasImage,
    };
    if (oldAuth !== true) {
      updateBody.type = type;
      updateBody.volume = volume;
    }
    // 如果之前的审核状态为审核未通过，则在编辑后审核状态自动变为待审核
    if (oldAuth === false) {
      updateBody.auth = null;
    }
    await QuestionModel.updateOne(
      { _id },
      {
        $set: updateBody,
      },
    );
    return await this.getQuestionById(_id);
  }

  async getQuestionById(questionId) {
    const question = await QuestionModel.findOne({ _id: questionId });
    if (!question) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_QUESTION_ID, [
        questionId,
      ]);
    }
    return question;
  }
  async extendQuestions(questions) {
    const usersId = [];
    const tagsId = [];
    for (const question of questions) {
      usersId.push(question.uid);
      tagsId.push(...question.tags);
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
      usersId,
    );
    const tagsObject = await questionTagService.getTagsObjectById(tagsId);
    const targetQuestions = [];
    for (const question of questions) {
      const targetQuestion = question.toObject();
      const user = usersObject[targetQuestion.uid];
      const tags = [];
      for (const tagId of targetQuestion.tags) {
        const tag = tagsObject[tagId];
        tags.push(tag);
      }
      targetQuestion.tags = tags;
      targetQuestion.user = user;
      targetQuestions.push(targetQuestion);
    }
    return targetQuestions;
  }
  async markQuestionsAsViewed(questionsId) {
    await QuestionModel.updateMany(
      {
        _id: {
          $in: questionsId,
        },
        viewed: false,
      },
      {
        $set: {
          viewed: true,
        },
      },
    );
  }

  /*
   *@Parma
   *from --- 标签id和取的数量
   *condition 查询条件
   */
  async canTakeQuestionNumbers(from, condition) {
    const allTag = await QuestionTagModel.find({}, { name: 1 }).lean();
    const questionId = [];
    for (const f of from) {
      const { tag } = f;
      condition.tags = { $in: [tag] };
      const question = await QuestionModel.find(condition, { _id: 1 }).lean();
      question.forEach((item) => {
        questionId.push(item._id);
      });
    }
    //重复的问题id
    const repetitionId = questionId.filter(
      (item, index) => questionId.indexOf(item) !== index,
    );
    //深拷贝这个数组用于递减
    let newRepetitionId = repetitionId.map((item) => item);
    for (const f of from) {
      const { tag, count } = f;
      condition.tags = { $in: [tag] };
      const question = await QuestionModel.find(condition, { _id: 1 }).lean();
      const qId = question.map((item) => item._id);
      //当前标签存在重复问题的id
      const hasRepetition = qId.filter((item) => repetitionId.includes(item));
      const { name } = allTag.find((item) => item._id === tag);
      //问题数量少于用户指定数量
      if (question.length < count) {
        ThrowError(400, `${name}题库试题总数目不满足用户指定数量`);
      }
      //存在重复问题
      else if (hasRepetition.length > 0) {
        //还剩下哪些可以选择的重复问题id
        const resHasRepetition = hasRepetition.filter((item) =>
          newRepetitionId.includes(item),
        );
        //找出过滤掉重复问题之后还剩下的题数
        const number = qId.filter((item) => !hasRepetition.includes(item));
        //如果重复但已经没有可以选的重复问题
        if (resHasRepetition.length === 0 && number.length < count) {
          ThrowError(
            400,
            `${name}当前题库与其他所选题库存在重复，导致题库数量不足`,
          );
        } else if (
          resHasRepetition.length > 0 &&
          resHasRepetition.length + number.length < count
        ) {
          ThrowError(400, `${name}题库试题数目不足`);
        } else {
          let num = resHasRepetition.length - count;
          if (num <= 0) {
            newRepetitionId = newRepetitionId.filter(
              (item) => !hasRepetition.includes(item),
            );
          } else {
            const selectedElements = hasRepetition.slice(0, num);
            newRepetitionId = newRepetitionId.filter(
              (item) => !selectedElements.includes(item),
            );
          }
        }
      }
    }
  }
}

module.exports = {
  questionService: new QuestionService(),
};
