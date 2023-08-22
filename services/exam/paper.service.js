const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const ExamsPaperModel = require('../../dataModels/ExamsPaperModel');
const ExamsCategoryModel = require('../../dataModels/ExamsCategoryModel');
const { ResponseTypes } = require('../../settings/response');
const {
  activationCodeSources,
  activationCodeValidityPeriod,
} = require('../../settings/activationCode');
const QuestionTagModel = require('../../dataModels/QuestionTagModel');
const QuestionModel = require('../../dataModels/QuestionModel');

class PaperService {
  async getPaperById(paperId) {
    const paper = await ExamsPaperModel.findOne({ _id: paperId });
    if (!paper) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_EXAM_PAPER_ID, [
        paperId,
      ]);
    }
    return paper;
  }
  async createActivationCodeByPaperId(paperId) {
    const {
      activationCodeService,
    } = require('../activationCode/activationCode.service');
    const paper = await this.getPaperById(paperId);
    return await activationCodeService.createActivationCode({
      source: activationCodeSources.examPaper,
      sid: paper._id,
      expiration: Date.now() + activationCodeValidityPeriod.examPaper,
    });
  }
  async setPaperUserId(paperId, uid) {
    await this.ExamsPaperModel.updateOne(
      {
        _id: paperId,
      },
      {
        $set: {
          uid,
        },
      },
    );
  }
  //检测生成考卷的题库数量是否足够
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
        ThrowBadRequestResponseTypeError(
          ResponseTypes.INSUFFICIENT_QUESTION_COUNT,
          [name],
        );
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
          ThrowBadRequestResponseTypeError(
            ResponseTypes.DUPLICATE_QUESTIONS_IN_SELECTED_BANKS,
            [name],
          );
        } else if (
          resHasRepetition.length > 0 &&
          resHasRepetition.length + number.length < count
        ) {
          ThrowBadRequestResponseTypeError(
            ResponseTypes.DUPLICATE_QUESTIONS_IN_SELECTED_BANKS,
            [name],
          );
        } else {
          //剩余重复的问题是否满足用户指定的数量
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
  //检测开卷的题是否满足需求
  async checkPaperLegal(pid, ip) {
    const paper = await ExamsPaperModel.findOnly({ _id: pid });
    if (ip !== paper.ip) {
      ThrowBadRequestResponseTypeError(ResponseTypes.QUESTION_DOES_NOT_EXIST);
    } else if (paper.submitted) {
      ThrowBadRequestResponseTypeError(ResponseTypes.EXAM_HAS_ENDED);
    }
    const category = await ExamsCategoryModel.findOnly({ _id: paper.cid });
    if (category.disabled) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_QUESTION_DISABLED,
      );
    }
  }
  //更新开卷考试用户的选择题填写状态
  //params: pid 试卷id index用户所做题目下标 selected 用户所选答案 bel 为题目是否正确
  async updatePaperCh4(pid, index, selected, bel = true) {
    await ExamsPaperModel.updateOne(
      { _id: pid },
      {
        $set: {
          [`record.${index}.correct`]: bel,
          ...selected.reduce((acc, selectedIndex) => {
            acc[`record.${index}.answer.${selectedIndex}.selected`] = true;
            return acc;
          }, {}),
        },
      },
    );
  }
  //更新开卷考试用户的填空题填写状态
  async updatePaperAns(pid, index, fill, bel = true) {
    await ExamsPaperModel.updateOne(
      { _id: pid },
      {
        $set: {
          [`record.${index}.correct`]: bel,
          [`record.${index}.answer.0.fill`]: fill,
        },
      },
    );
  }

  //检测用户是否已经做了试卷的哪些题目了
  async checkIsFinishPaper(pid) {
    const paper = await ExamsPaperModel.findOnly({ _id: pid });
    const { record } = paper;
    return record.findIndex((item) => !item.correct);
  }
}

module.exports = {
  paperService: new PaperService(),
};
