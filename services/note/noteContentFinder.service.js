const NoteContentModel = require('../../dataModels/NoteContentModel');

class NoteContentFinderService {
  getNoteContentsMapByIds = async (noteContentIds) => {
    const noteContents = await NoteContentModel.find({
      _id: { $in: noteContentIds },
    });
    const notesMap = new Map();
    for (const noteContent of noteContents) {
      notesMap.set(noteContent._id, noteContent);
    }
    return notesMap;
  };
}

module.exports = {
  noteContentFinderService: new NoteContentFinderService(),
};
