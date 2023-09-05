const SubscribeModel = require('../../dataModels/SubscribeModel');
const UsersPersonalModel = require('../../dataModels/UsersPersonalModel');
const UserModel = require('../../dataModels/UserModel');
const SettingModel = require('../../dataModels/SettingModel');
const { subscribeService } = require('./subscribe.service');
const nkcRender = require('../../nkcModules/nkcRender');
const { subscribeSources } = require('../../settings/subscribe');
const { defaultCerts } = require('../../settings/userCerts');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { getUrl } = require('../../nkcModules/tools');
const apiFunction = require('../../nkcModules/apiFunction');

class SubscribeUserService {
  userTypes = {
    followers: 'followers',
    fans: 'fans',
  };

  async isSubscribedUser(uid, tUid) {
    return await subscribeService.isSubscribed({
      uid,
      source: subscribeSources.user,
      sid: tUid,
    });
  }

  async checkSubscribeUser(uid, tUid) {
    const isSubscribed = await this.isSubscribedUser(uid, tUid);
    if (isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_SUBSCRIBED_USER,
      );
    }
  }

  async checkUnsubscribeUser(uid, tUid) {
    const isSubscribed = await this.isSubscribedUser(uid, tUid);
    if (!isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_SUBSCRIBED_USER,
      );
    }
  }

  async subscribeUser(uid, tUid, cid = []) {
    return await subscribeService.createSubscribe({
      source: subscribeSources.user,
      sid: tUid,
      uid,
      cid,
    });
  }

  async unsubscribeUser(uid, tUid) {
    await subscribeService.cancelSubscribe({
      uid,
      source: subscribeSources.user,
      sid: tUid,
    });
  }

  async getSubscribeUserCategoriesId(uid, tUid) {
    let cid = [];
    const subscribe = await subscribeService.getUserSubscribeBySource({
      uid,
      source: subscribeSources.user,
      sid: tUid,
    });
    if (subscribe) {
      cid = subscribe.cid;
    }
    return cid;
  }

  async getSubscribeUsersInfoByUsersId(usersId) {
    const users = await UserModel.find(
      {
        uid: { $in: usersId },
        certs: { $ne: defaultCerts.banned },
        hidden: false,
      },
      {
        uid: 1,
        username: 1,
        description: 1,
        avatar: 1,
        certs: 1,
        xsf: 1,
      },
    );
    const usersPersonal = await UsersPersonalModel.find(
      {
        uid: { $in: usersId },
      },
      {
        uid: 1,
        mobile: 1,
        nationCode: 1,
        email: 1,
      },
    );
    const mobileEmailInfo = {};
    for (const up of usersPersonal) {
      mobileEmailInfo[up.uid] = {
        hasMobile: !!(up.mobile && up.nationCode),
        hasEmail: !!up.email,
      };
    }
    const targetUsers = [];
    for (const user of users) {
      const { uid, username, description, avatar, certs, xsf } = user;
      const userCerts = await UserModel.getUserCertsByXSF(certs, xsf);
      const up = mobileEmailInfo[user.uid];
      targetUsers.push({
        uid,
        username,
        description: nkcRender.replaceLink(description),
        avatar,
        avatarUrl: getUrl('userAvatar', avatar),
        certsName: await UserModel.getUserCertsNameByCerts(
          userCerts,
          up.hasMobile,
          up.hasEmail,
        ),
      });
    }
    return targetUsers;
  }

  async getUserSubscribeUsers(props) {
    const { uid, page = 0, userType } = props;
    const pageSettings = await SettingModel.getSettings('page');
    const match = {
      source: subscribeSources.user,
      cancel: false,
    };
    if (userType === this.userTypes.followers) {
      match.uid = uid;
    } else {
      match.sid = uid;
    }
    const count = await SubscribeModel.countDocuments(match);
    const paging = apiFunction.paging(
      page,
      count,
      pageSettings.userCardUserList,
    );
    const subscribes = await SubscribeModel.find(match, {
      sid: 1,
      uid: 1,
    })
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const targetUsersId = subscribes.map((s) => {
      return userType === this.userTypes.followers ? s.sid : s.uid;
    });
    const targetUsers = await this.getSubscribeUsersInfoByUsersId(
      targetUsersId,
    );
    return { users: targetUsers, paging };
  }

  async getUserFollowers(uid, page = 0) {
    return this.getUserSubscribeUsers({
      uid,
      page,
      userType: this.userTypes.followers,
    });
  }

  async getUserFans(uid, page = 0) {
    return this.getUserSubscribeUsers({
      uid,
      page,
      userType: this.userTypes.fans,
    });
  }
}

module.exports = {
  subscribeUserService: new SubscribeUserService(),
};
