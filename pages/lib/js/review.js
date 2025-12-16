import { nkcAPI } from './netAPI';
class ReviewActions {
  // post 通过审核
  approvePostReview = async (props) => {
    const { postsId } = props;
    return nkcAPI('/review/post', 'PUT', {
      postsId: postsId,
    });
  };

  // post 未通过审核，删除
  rejectPostReviewAndDelete = async (props) => {
    const { postsId, reason, remindUser, violation } = props;
    return nkcAPI('/threads/recycle', 'POST', {
      postsId: postsId,
      reason,
      remindUser,
      violation,
    });
  };
  // post 未通过审核，退回修改
  rejectPostReviewAndReturn = async (props) => {
    const { postsId, reason, remindUser, violation } = props;
    return nkcAPI('/threads/draft', 'POST', {
      postsId: postsId,
      reason,
      remindUser,
      violation,
    });
  };

  // document 通过审核
  approveDocumentReview = async (props) => {
    const { docId } = props;
    return nkcAPI('/review/document', 'PUT', {
      docId: docId,
      operation: 'approve',
    });
  };
  // document 未通过审核，删除
  rejectDocumentReviewAndDelete = async (props) => {
    const { docId, reason, remindUser, violation } = props;
    return nkcAPI('/review/document', 'PUT', {
      docId: docId,
      operation: 'disabled',
      reason,
      remindUser,
      violation,
    });
  };
  // document 未通过审核，退回修改
  rejectDocumentReviewAndReturn = async (props) => {
    const { docId, reason, remindUser, violation } = props;
    return nkcAPI('/review/document', 'PUT', {
      docId: docId,
      operation: 'faulty',
      reason,
      remindUser,
      violation,
    });
  };
  // note 通过审核
  approveNoteReview = async (props) => {
    const { noteContentId } = props;
    return nkcAPI('/review/note', 'PUT', {
      noteContentId,
      operation: 'approve',
    });
  };
  // note 未通过审核，删除
  rejectNoteReviewAndDelete = async (props) => {
    const { noteContentId, reason, remindUser, violation } = props;
    return nkcAPI('/review/note', 'PUT', {
      noteContentId,
      operation: 'disabled',
      reason,
      remindUser,
      violation,
    });
  };
  // 用户资料通过审核
  approveUserReview = async (props) => {
    const { userAuditId } = props;
    return nkcAPI('/review/user', 'PUT', {
      user: {
        pass: true,
        auditId: userAuditId,
      },
    });
  };
  // user 未通过审核
  rejectUserReview = async (props) => {
    const { userAuditId, reason, remindUser, violation } = props;
    return nkcAPI('/review/user', 'PUT', {
      user: {
        pass: false,
        auditId: userAuditId,
        reason,
        remindUser,
        violation,
      },
    });
  };
}

export const reviewActions = new ReviewActions();
