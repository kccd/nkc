const DocumentModel = require('../../dataModels/DocumentModel');
class DocumentFinderService {
  getDocumentsMapByIds = async (documentsIds) => {
    const documents = await DocumentModel.find({
      did: { $in: documentsIds },
    });
    const documentsMap = new Map();
    for (const document of documents) {
      documentsMap.set(document.did, document);
    }
    return documentsMap;
  };
}

module.exports = {
  documentFinderService: new DocumentFinderService(),
};
