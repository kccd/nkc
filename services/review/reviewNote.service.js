const NoteContentModel = require('../../dataModels/NoteContentModel');
const socket = require('../../nkcModules/socket');
const SettingModel = require('../../dataModels/SettingModel');
const MessageModel = require('../../dataModels/MessageModel');
const UserModel = require('../../dataModels/UserModel');
const UsersScoreLogModel = require('../../dataModels/UsersScoreLogModel');
const apiFunction = require('../../nkcModules/apiFunction');
const { noteContentStatus, noteContentTypes } = require('../../settings/note');
const { reviewSources } = require('../../settings/review');
const { userInfoService } = require('../user/userInfo.service');
const { reviewFinderService } = require('./reviewFinder.service');
const { reviewModifierService } = require('./reviewModifier.service');
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

  markNoteReviewStatus = async (props) => {
    const { noteContent: noteContentProps, ctx } = props;
    const { noteContentId, operation, reason, remindUser, violation } =
      noteContentProps;
    const noteContent = await NoteContentModel.findOne({
      _id: Number(noteContentId),
      status: noteContentStatus.unknown,
    });
    if (!noteContent) {
      return;
    }

    if (operation === 'approve') {
      // 通过审核
      //note为通过的状态
      await NoteContentModel.updateOne(
        { _id: noteContentId },
        {
          $set: {
            status: noteContentStatus.normal,
          },
        },
      );
      await reviewModifierService.modifyReviewLogStatusToApproved({
        source: reviewSources.note,
        sid: noteContent._id,
        handlerId: ctx.state.uid,
      });
    } else {
      //note为屏蔽状态
      await NoteContentModel.updateOne(
        { _id: noteContentId },
        {
          $set: {
            status: noteContentStatus.disabled,
          },
        },
      );
      await reviewModifierService.modifyReviewLogStatusToDeleted({
        source: reviewSources.note,
        sid: noteContent._id,
        handlerId: ctx.state.uid,
        handlerReason: reason || '',
      });

      //如果标记用户违规就给该用户新增违规记录
      if (violation) {
        const noteContentUser = await UserModel.findOnly({
          uid: noteContent.uid,
        });
        //新增违规记录
        await UsersScoreLogModel.insertLog({
          user: noteContentUser,
          type: 'score',
          typeIdOfScoreChange: 'violation',
          port: ctx.port,
          ip: ctx.address,
          key: 'violationCount',
          description: reason,
          noteId: noteContent._id,
        });
      }
      //如果要提醒用户
      if (remindUser) {
        const message = await MessageModel({
          _id: await SettingModel.operateSystemID('messages', 1),
          r: noteContent.uid,
          ty: 'STU',
          c: {
            delType: 'disabled',
            violation,
            type: 'noteDisabled',
            noteId: noteContent._id,
            reason,
          },
        });
        await message.save();
        await socket.sendMessageToUser(message._id);
      }
    }
  };
}

module.exports = {
  reviewNoteService: new ReviewNoteService(),
};
