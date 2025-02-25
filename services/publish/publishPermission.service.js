const UserModel = require('../../dataModels/UserModel');
const MomentModel = require('../../dataModels/MomentModel');
const { momentStatus } = require('../../settings/moment');
const ThreadModel = require('../../dataModels/ThreadModel');
const DocumentModel = require('../../dataModels/DocumentModel');
const PostModel = require('../../dataModels/PostModel');
const SettingModel = require('../../dataModels/SettingModel');
const { documentTypes } = require('../../settings/document');
const UsersPersonalModel = require('../../dataModels/UsersPersonalModel');
const {
  settingIds,
  publishPermissionTypes,
} = require('../../settings/serverSettings');
const apiFunction = require('../../nkcModules/apiFunction');
const { ThrowCommonError } = require('../../nkcModules/error');
const mongoose = require('../../settings/database');
class PublishPermissionService {
  async getUserBaseInfoStatus(uid) {
    const user = await UserModel.findById(uid);
    return {
      username: {
        type: 'username',
        name: '设置用户名',
        completed: user.username && !user.username.includes('-'),
        link: `/u/${uid}/settings/info`,
        title: '去设置',
      },
      avatar: {
        type: 'avatar',
        name: '上传头像',
        completed: !!user.avatar,
        link: `/u/${uid}/settings/info`,
        title: '去上传',
      },
    };
  }

  async getVerifyPhoneNumberStatus(uid) {
    return {
      type: 'verifyPhoneNumber',
      name: '验证手机号',
      completed: !(await UsersPersonalModel.shouldVerifyPhoneNumber(uid)),
      link: `/u/${uid}/settings/security`,
      title: '去验证',
    };
  }

  async getMomentCountStatus(props) {
    const { uid, momentCount, examEnabled } = props;
    if (!momentCount.limited || !examEnabled) {
      return null;
    }
    const publishedMomentCount = await MomentModel.countDocuments({
      uid,
      status: momentStatus.normal,
    });
    return {
      type: 'momentCount',
      name: `发表${momentCount.count}条电文`,
      completed: publishedMomentCount >= momentCount.count,
      link: `/z`,
      title: '去发表',
    };
  }

  async getPublishPermissionAuthLevelStatus(props) {
    const { authLevelMin, authLevel, uid } = props;
    const result = {
      type: 'authLevel',
      name: `通过身份认证${authLevelMin}`,
      completed: false,
      link: `/u/${uid}/settings/verify`,
      title: '去认证',
    };
    if (authLevel >= authLevelMin) {
      result.completed = true;
    }
    return authLevelMin === 0 ? null : result;
  }

  async getPublishPermissionExamStatus(props) {
    const {
      examEnabled,
      userVolumeA,
      userVolumeB,
      userVolumeAD,
      examVolumeA,
      examVolumeB,
      examVolumeAD,
    } = props;
    if (examEnabled) {
      const result = {
        type: 'exam',
        name: ``,
        completed: true,
        link: `/exam`,
        title: '去考试',
      };
      if (examVolumeAD) {
        result.name = `通过入学培训`;
        if (!userVolumeAD) {
          result.completed = false;
          result.link = `/exam#AD`;
        }
      } else if (examVolumeA) {
        result.name = '通过A卷考试';
        if (!userVolumeA) {
          result.completed = false;
          result.link = `/exam#A`;
        }
      } else {
        result.name = '通过B卷考试';
        if (!userVolumeB) {
          result.completed = false;
          result.link = `/exam#B`;
        }
      }
      return result;
    } else {
      return null;
    }
  }

  async getPublishCountToday(props) {
    const { uid, type } = props;
    const today = apiFunction.today();
    switch (type) {
      case publishPermissionTypes.thread: {
        return await ThreadModel.countDocuments({
          uid,
          toc: {
            $gte: today,
          },
        });
      }
      case publishPermissionTypes.post: {
        return await PostModel.countDocuments({
          uid,
          toc: {
            $gte: today,
          },
        });
      }
      case publishPermissionTypes.moment: {
        return MomentModel.countDocuments({
          uid,
          status: { $ne: momentStatus.default },
          top: {
            $gte: today,
          },
        });
      }
      default: {
        return DocumentModel.countDocuments({
          uid,
          type: documentTypes.stable,
          source: type,
          toc: { $gte: today },
        });
      }
    }
  }

  async getLastPublishTime(props) {
    const { uid, type } = props;
    const defaultTime = new Date(`2000-01-01 00:00:00`);
    switch (type) {
      case publishPermissionTypes.thread: {
        const latestThread = await ThreadModel.findOne(
          {
            uid,
          },
          {
            toc: 1,
          },
        ).sort({ toc: -1 });
        return latestThread ? latestThread.toc : defaultTime;
      }
      case publishPermissionTypes.post: {
        const latestPost = await PostModel.findOne(
          {
            uid,
          },
          {
            toc: 1,
          },
        ).sort({ toc: -1 });
        return latestPost ? latestPost.toc : defaultTime;
      }
      case publishPermissionTypes.moment: {
        const latestMoment = await MomentModel.findOne(
          {
            uid,
            status: { $ne: momentStatus.default },
          },
          {
            top: 1,
          },
        ).sort({ top: -1 });
        return latestMoment ? latestMoment.top : defaultTime;
      }
      default: {
        const latestDocument = await DocumentModel.findOne(
          {
            source: type,
            uid,
            type: documentTypes.stable,
          },
          {
            toc: 1,
          },
        ).sort({ toc: -1 });
        return latestDocument ? latestDocument.toc : defaultTime;
      }
    }
  }

  // 返回发表相关待完成的任务、条数限制、时间限制
  async getPublishPermissionStatus(type, uid) {
    const user = await UserModel.findOnly({ uid });
    const usersPersonal = await UsersPersonalModel.findOnly({ uid });
    const authLevel = await usersPersonal.getAuthLevel();
    const publishSettings = await SettingModel.getSettings(settingIds.publish);
    const permission = publishSettings[type].postPermission;

    const tasks = await this.getUserBaseInfoStatus(uid);
    const authLevelTask = await this.getPublishPermissionAuthLevelStatus({
      uid,
      authLevelMin: permission.authLevelMin,
      authLevel,
    });
    if (authLevelTask) {
      tasks.authLevel = authLevelTask;
    }
    const examTask = await this.getPublishPermissionExamStatus({
      examEnabled: permission.examEnabled,
      userVolumeAD: user.volumeAD,
      userVolumeA: user.volumeA,
      userVolumeB: user.volumeB,
      examVolumeAD: permission.examVolumeAD,
      examVolumeA: permission.examVolumeA,
      examVolumeB: permission.examVolumeB,
    });
    if (examTask) {
      tasks.exam = examTask;
    }
    const momentTask = await this.getMomentCountStatus({
      uid,
      momentCount: permission.momentCount,
      examEnabled: permission.examEnabled,
    });
    if (momentTask) {
      tasks.moment = momentTask;
    }
    const verifyPhoneNumberTask = await this.getVerifyPhoneNumberStatus(uid);
    if (verifyPhoneNumberTask) {
      tasks.verifyPhoneNumber = verifyPhoneNumberTask;
    }
    const countToday = await this.getPublishCountToday({
      uid,
      type,
    });
    const countLimit = {
      limited: false,
      publishedCount: countToday,
      maxPublishCount: 0,
      reason: '',
    };
    const timeLimit = {
      limited: false,
      till: Date.now(),
      interval: 0,
      reason: '',
    };
    const examCountWarning = {
      show: false,
      maxPublishCount: 0,
      publishedCount: countToday,
    };
    if (
      examTask &&
      !examTask.completed &&
      permission.examNotPass.status &&
      permission.examNotPass.limited
    ) {
      examCountWarning.show = true;
      examCountWarning.maxPublishCount = permission.examNotPass.count;
      if (countToday >= permission.examNotPass.count) {
        countLimit.limited = true;
        countLimit.maxPublishCount = permission.examNotPass.count;
        countLimit.reason = `今日发表次数已达上限（${permission.examNotPass.count} 次），请参加考试，通过后可获取更多发表权限。`;
      }
    }
    const lastPublishTime = await this.getLastPublishTime({
      uid,
      type,
    });
    // 发表间隔、数量限制
    const roles = await user.extendRoles();
    const grade = await user.extendGrade();
    const rolesId = roles.map((r) => `role-${r._id}`);
    rolesId.push(`grade-${grade._id}`);
    let intervalItem = null;
    let countItem = null;
    for (const item of permission.intervalLimit) {
      if (!rolesId.includes(item.id)) {
        continue;
      }
      if (intervalItem && !intervalItem.limited) {
        continue;
      }
      if (
        !intervalItem ||
        !item.limited ||
        item.interval < intervalItem.interval
      ) {
        intervalItem = item;
      }
    }
    for (const item of permission.countLimit) {
      if (!rolesId.includes(item.id)) {
        continue;
      }
      if (countItem && !countItem.limited) {
        continue;
      }
      if (!countItem || !item.limited || item.count > countItem.count) {
        countItem = item;
      }
    }
    intervalItem = intervalItem || permission.defaultInterval;
    countItem = countItem || permission.defaultCount;
    if (intervalItem.limited) {
      if (
        Date.now() - intervalItem.interval * 60 * 1000 <
        lastPublishTime.getTime()
      ) {
        // 时间被限制了
        timeLimit.limited = true;
        timeLimit.till =
          lastPublishTime.getTime() + intervalItem.interval * 60 * 1000;
        timeLimit.interval = intervalItem.interval * 60 * 1000;
        timeLimit.reason = `您当前的账号等级（${grade.displayName}）限定发表间隔时间不能小于 ${intervalItem.interval} 分钟，请稍候再试。`;
      }
    }
    if (
      countItem.limited &&
      countToday >= countItem.count &&
      !countLimit.limited
    ) {
      // 今日条数被限制了
      countLimit.limited = true;
      countLimit.maxPublishCount = countItem.count;
      countLimit.reason = `您当前的账号等级（${grade.displayName}）限定每天仅能发表 ${countItem.count} 次，今日发表次数已达上限，请明天再试。`;
    }

    return {
      tasks,
      timeLimit,
      countLimit,
      permission,
      examCountWarning,
    };
  }

  async checkPublishPermission(type, uid) {
    const { tasks, timeLimit, countLimit, permission } =
      await this.getPublishPermissionStatus(type, uid);
    const { username, avatar, exam, authLevel, verifyPhoneNumber, moment } =
      tasks;
    const te = (text) => {
      ThrowCommonError(403, `权限不足，因为您还${text}`);
    };
    if (username && !username.completed) {
      te(`未设置用户名`);
    }
    if (avatar && !avatar.completed) {
      te(`未设置头像`);
    }
    if (authLevel && !authLevel.completed) {
      te(`未${authLevel.name}`);
    }
    if (exam && !exam.completed) {
      if (!permission.examNotPass.status) {
        te(`未${exam.name}`);
      }
    }
    if (moment && !moment.completed) {
      te(`未${moment.name}`);
    }
    if (verifyPhoneNumber && !verifyPhoneNumber.completed) {
      const authSettings = await SettingModel.getSettings('auth');
      if (authSettings.verifyPhoneNumber.type === 'disablePublish') {
        te(`未${verifyPhoneNumber.name}`);
      }
    }
    if (countLimit.limited) {
      ThrowCommonError(403, countLimit.reason);
    }
    if (timeLimit.limited) {
      ThrowCommonError(403, timeLimit.reason);
    }
  }
}

module.exports = {
  publishPermissionService: new PublishPermissionService(),
};
