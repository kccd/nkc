const DocumentModel = require('../../dataModels/DocumentModel');
class DocumentFinderService {
  getDocumentsMapByIds = async (documentsIds) => {
    const documents = await DocumentModel.find({
      _id: { $in: documentsIds },
    });
    const documentsMap = new Map();
    for (const document of documents) {
      documentsMap.set(document._id, document);
    }
    return documentsMap;
  };
}

module.exports = {
  documentFinderService: new DocumentFinderService(),
};
