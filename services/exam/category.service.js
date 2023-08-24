const ExamsCategoryModel = require('../../dataModels/ExamsCategoryModel');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
class CategoryService {
  async getCategoryById(categoryId) {
    const category = await ExamsCategoryModel.findOne({ _id: categoryId });
    if (!category) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_QUESTION_TAG_ID, [
        categoryId,
      ]);
    }
    return category;
  }
}

module.exports = {
  categoryService: new CategoryService(),
};
