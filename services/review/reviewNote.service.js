const NoteContentModel = require('../../dataModels/NoteContentModel');
const apiFunction = require('../../nkcModules/apiFunction');
const { noteContentStatus, noteContentTypes } = require('../../settings/note');
const { reviewSources } = require('../../settings/review');
const { userInfoService } = require('../user/userInfo.service');
const { reviewFinderService } = require('./reviewFinder.service');
class ReviewNoteService {
  getPendingReviewNotes = async (props) => {
    const { page, perPage } = props;
    const match = {
      status: noteContentStatus.unknown,
      type: noteContentTypes.post,
    };
    const noteCount = await NoteContentModel.countDocuments(match);
    const paging = apiFunction.paging(page, noteCount, perPage);
    const noteContents = await NoteContentModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const usersId = new Set();
    const noteContentIds = new Set();
    for (const noteContent of noteContents) {
      usersId.add(noteContent.uid);
      noteContentIds.add(noteContent._id);
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds([
      ...usersId,
    ]);
    const reviewReasonsMap = await reviewFinderService.getReviewReasonsMap(
      reviewSources.note,
      [...noteContentIds],
    );
    const results = [];
    for (const noteContent of noteContents) {
      const user = usersObject[noteContent.uid];
      const content = {
        note: noteContent.content,
        url: `/note/${noteContent.noteId}`,
      };
      const reviewReason = reviewReasonsMap.get(noteContent._id) || '';
      results.push({
        type: 'note',
        note: noteContent,
        content,
        user,
        reason: reviewReason,
      });
    }
    return {
      data: results,
      paging,
    };
  };
}

module.exports = {
  reviewNoteService: new ReviewNoteService(),
};
