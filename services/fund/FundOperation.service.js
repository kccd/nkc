const FundOperationModel = require('../../dataModels/FundOperationModel');
const { userInfoService } = require('../user/userInfo.service');
const {
  defaultLanguageName,
  translateFundOperationType,
} = require('../../nkcModules/translate');
const { getUrl } = require('../../nkcModules/tools');
const {
  fundOperationStatus,
  fundOperationTypes,
} = require('../../settings/fundOperation');
class FundOperationService {
  async createFundOperation(props) {
    const {
      // 必要
      uid,
      formId,
      type,
      status,

      // 非必要
      toc,
      desc = '',
      installment = 0,
      money = 0,
    } = props;
    const operation = new FundOperationModel({
      toc: toc || new Date(),
      uid,
      formId,
      type,
      desc,
      installment,
      status,
      money,
    });
    await operation.save();
    return operation;
  }

  async getOperationsByFormId(formId, isAdmin, ignoredTypes = []) {
    const match = {
      formId,
    };
    if (!isAdmin) {
      match.status = fundOperationStatus.normal;
    }
    if (ignoredTypes.length > 0) {
      match.type = {
        $nin: ignoredTypes,
      };
    }
    return FundOperationModel.find(match, {
      toc: 1,
      uid: 1,
      type: 1,
      desc: 1,
      installment: 1,
      status: 1,
      money: 1,
    }).sort({ toc: 1 });
  }

  async translateOperationType(type, args = []) {
    return translateFundOperationType(defaultLanguageName, type, args);
  }

  async getOperationNotificationType(type) {
    let notificationType = 'info';
    const errorTypes = [
      fundOperationTypes.userInfoNotApproved,
      fundOperationTypes.projectInfoNotApproved,
      fundOperationTypes.budgetNotApproved,
      fundOperationTypes.notApprovedByAdmin,
      fundOperationTypes.disbursementNotApproved,
      fundOperationTypes.disbursementFailed,
      fundOperationTypes.finalReportNotApproved,
      fundOperationTypes.expertRefuse,
      fundOperationTypes.adminRefuse,
      fundOperationTypes.modificationTimeout,
      fundOperationTypes.terminated,
    ];
    const successTypes = [
      fundOperationTypes.userInfoApproved,
      fundOperationTypes.projectInfoApproved,
      fundOperationTypes.budgetApproved,
      fundOperationTypes.approvedByAdmin,
      fundOperationTypes.disbursementApproved,
      fundOperationTypes.finalReportApproved,
    ];
    if (errorTypes.includes(type)) {
      notificationType = 'error';
    } else if (successTypes.includes(type)) {
      notificationType = 'success';
    }
    return notificationType;
  }

  async getOperationOperator(type, user) {
    const operator = {
      uid: '',
      name: '',
      avatarUrl: '',
      homeUrl: '',
    };
    switch (type) {
      case fundOperationTypes.report:
      case fundOperationTypes.submitApplication:
      case fundOperationTypes.applyDisbursement:
      case fundOperationTypes.confirmReceipt:
      case fundOperationTypes.refund:
      case fundOperationTypes.applicantAbandoned:
      case fundOperationTypes.applicantWithdrawn:
      case fundOperationTypes.submitFinalReport: {
        operator.uid = user.uid;
        operator.name = `${user.username}(申请人)`;
        operator.avatarUrl = getUrl('userAvatar', user.avatar);
        operator.homeUrl = getUrl('userHome', user.uid);
        break;
      }

      case fundOperationTypes.userInfoNotApproved:
      case fundOperationTypes.projectInfoNotApproved:
      case fundOperationTypes.budgetNotApproved:
      case fundOperationTypes.userInfoApproved:
      case fundOperationTypes.projectInfoApproved:
      case fundOperationTypes.budgetApproved:
      case fundOperationTypes.finalReportNotApproved:
      case fundOperationTypes.expertRefuse:
      case fundOperationTypes.finalReportApproved: {
        operator.uid = '';
        operator.name = '审核专家';
        operator.avatarUrl = getUrl('fluentuiEmoji', 'man_3d_light');
        operator.homeUrl = '';
        break;
      }

      case fundOperationTypes.notApprovedByAdmin:
      case fundOperationTypes.disbursementApproved:
      case fundOperationTypes.disbursementNotApproved:
      case fundOperationTypes.adminRefuse:
      case fundOperationTypes.cancelRefuse:
      case fundOperationTypes.terminated:
      case fundOperationTypes.adminWithdrawn:
      case fundOperationTypes.modificationTimeout:
      case fundOperationTypes.approvedByAdmin: {
        operator.uid = '';
        operator.name = '管理员';
        operator.avatarUrl = getUrl('fluentuiEmoji', 'man_beard_3d_light');
        operator.homeUrl = '';
        break;
      }

      case fundOperationTypes.system:
      case fundOperationTypes.disbursementFailed:
      default: {
        operator.uid = '';
        operator.name = '系统';
        operator.avatarUrl = getUrl('fluentuiEmoji', 'robot_3d');
        operator.homeUrl = '';
        break;
      }
    }
    return operator;
  }

  async getTimelineOperationsDetailInfoByFormId(formId, isAdmin) {
    const operations = await this.getOperationsByFormId(formId, isAdmin, [
      fundOperationTypes.voteAgainst,
      fundOperationTypes.voteFor,
    ]);
    const userIds = operations.map((operation) => operation.uid);
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
      userIds,
    );

    const operationsDetail = [];
    for (const operation of operations) {
      const title = await this.translateOperationType(operation.type, [
        operation.type === fundOperationTypes.refund
          ? operation.money
          : operation.installment,
      ]);
      const user = usersObject[operation.uid];
      const operator = await this.getOperationOperator(operation.type, user);
      const notificationType = await this.getOperationNotificationType(
        operation.type,
      );
      operationsDetail.push({
        _id: operation._id.toString(),
        toc: operation.toc,
        type: operation.type,
        desc: operation.desc,
        status: operation.status,
        title,
        operator,
        notificationType,
      });
    }
    return operationsDetail;
  }
}

module.exports = {
  fundOperationService: new FundOperationService(),
};
