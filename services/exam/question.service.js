const {
  ThrowBadRequestResponseTypeError,
  ThrowForbiddenResponseTypeError,
} = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const { checkString } = require('../../nkcModules/checkData');
const QuestionModel = require('../../dataModels/QuestionModel');
const SettingModel = require('../../dataModels/SettingModel');
const { userInfoService } = require('../user/userInfo.service');
const { questionTagService } = require('./questionTag.service');
const { defaultCerts } = require('../../settings/userCerts');
const { DynamicOperations } = require('../../settings/operations');

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
      minTextLength: 1,
      maxTextLength: 2000,
    });
    checkString(contentDesc, {
      name: '试题题干说明',
      maxTextLength: 2000,
    });
  }
  async checkQuestionIsIndefinite(type, isIndefinite) {
    const { ans } = await QuestionModel.getQuestionType();
    if (type === ans && isIndefinite) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.IS_INDEFINITE_TYPE_IN_CORRECT,
      );
    }
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
          minTextLength: 1,
          maxTextLength: 2000,
        });
        checkString(item.desc, {
          name: '选项说明',
          maxTextLength: 2000,
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
        minTextLength: 1,
        maxTextLength: 2000,
      });
      checkString(answer[0].desc, {
        name: '答案说明',
        maxTextLength: 2000,
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
    const { type, volume, tags, content, contentDesc, answer, isIndefinite } =
      props;
    await this.checkQuestionType(type);
    await this.checkQuestionVolume(volume);
    await this.checkQuestionTag(tags);
    await this.checkQuestionContentAndContentDesc(content, contentDesc);
    await this.checkQuestionAnswer(type, answer);
    await this.checkQuestionIsIndefinite(type, isIndefinite);
  }
  async createQuestion(props) {
    const {
      type,
      volume,
      tags,
      content,
      contentDesc,
      answer,
      hasImage,
      uid,
      isIndefinite,
    } = props;
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
      isIndefinite,
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
      isIndefinite,
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
      isIndefinite,
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
  async hasPermissionToCreateQuestions(uid) {
    const { userPermissionService } = require('../user/userPermission.service');
    return !!(
      (await userPermissionService.isUserOwnsCert(uid, defaultCerts.scholar)) ||
      (await userPermissionService.isUserOwnsOperation(
        uid,
        DynamicOperations.modifyAllQuestions,
      ))
    );
  }
  async checkPermissionToCreateQuestions(uid) {
    const hasPermissionToCrateQuestions =
      await this.hasPermissionToCreateQuestions(uid);
    if (!hasPermissionToCrateQuestions) {
      ThrowForbiddenResponseTypeError(
        ResponseTypes.FORBIDDEN_TO_CREATE_QUESTION,
      );
    }
  }

  /*
   *@Parma
   *from --- 标签id和取的数量
   *condition 查询条件
   */
}

module.exports = {
  questionService: new QuestionService(),
};
