const SettingModel = require('../../dataModels/SettingModel');
const QuestionModel = require('../../dataModels/QuestionModel');
const QuestionTagModel = require('../../dataModels/QuestionTagModel');
const ExamsCategoryModel = require('../../dataModels/ExamsCategoryModel');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const { checkString } = require('../../nkcModules/checkData');

class QuestionTagService {
  async checkTagName(name, ignoredId) {
    const match = {
      name,
    };
    if (ignoredId) {
      match._id = {
        $ne: ignoredId,
      };
    }
    const tag = await QuestionTagModel.findOne(match);
    if (tag) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USED_QUESTION_TAG_NAME);
    }
  }

  async checkNameDescFormat(name, desc) {
    checkString(name, {
      name: '标签名',
      minLength: 1,
      maxLength: 20,
    });
    checkString(desc, {
      name: '标签简介',
      maxLength: 200,
    });
  }

  async getTagById(_id) {
    const tag = await QuestionTagModel.findOne({ _id });
    if (!tag) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_QUESTION_TAG_ID,
        _id,
      );
    }
    return tag;
  }

  async createQuestionTag(props) {
    const { name, desc } = props;
    const _id = await SettingModel.operateSystemID('questionTags', 1);
    const tag = new QuestionTagModel({
      _id,
      name,
      desc,
    });
    await tag.save();
    return tag;
  }

  async modifyQuestionTag(props) {
    const { _id, name, desc } = props;
    const tag = await this.getTagById(_id);
    tag.name = name;
    tag.desc = name;
    await tag.updateOne({
      $set: {
        name,
        desc,
      },
    });
    return tag;
  }

  async deleteQuestionTag(_id) {
    const tag = await this.getTagById(_id);
    const questionCount = await QuestionModel.countDocuments({ tags: tag._id });
    if (questionCount > 0) {
      ThrowBadRequestResponseTypeError(ResponseTypes.TAG_HAS_QUESTIONS_ERROR);
    }
    const examsCategoriesCount = await ExamsCategoryModel.countDocuments({
      from: {
        $elemMatch: {
          tag: tag._id,
        },
      },
    });
    if (examsCategoriesCount > 0) {
      ThrowBadRequestResponseTypeError(ResponseTypes.TAG_HAS_QUESTIONS_ERROR);
    }
    await tag.remove();
  }

  async getAllTag() {
    return QuestionTagModel.find(
      {},
      {
        _id: 1,
        name: 1,
        desc: 1,
        toc: 1,
      },
    ).sort({ toc: 1 });
  }

  async getTagsById(tagsId) {
    const tags = await QuestionTagModel.find(
      { _id: { $in: tagsId } },
      {
        _id: 1,
        name: 1,
        desc: 1,
        toc: 1,
      },
    );
    const tagsObj = {};
    for (const tag of tags) {
      tagsObj[tag._id] = {
        _id: tag._id,
        name: tag.name,
        desc: tag.desc,
        toc: tag.toc,
      };
    }
    const targetTags = [];
    for (const tagId of tagsId) {
      const tag = tagsObj[tagId];
      targetTags.push(tag);
    }
    return targetTags;
  }
}

module.exports = {
  questionTagService: new QuestionTagService(),
};
