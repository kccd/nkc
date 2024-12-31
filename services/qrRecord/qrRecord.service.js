const QRRecordModel = require('../../dataModels/QRRecordModel');
const { qrRecordStatus } = require('../../settings/qrRecord');
const { getRandomString } = require('../../nkcModules/apiFunction');
const {
  ThrowServerInternalError,
  ThrowCommonError,
} = require('../../nkcModules/error');
const { isDevelopment } = require('../../settings/env');

class QRRecordService {
  validity = isDevelopment ? 60 * 60 * 1000 : 2 * 60 * 1000; //线上有效期 2 分钟，调试有效期 1 小时
  status = {
    waitingScan: 'waitingScan',
    waitingAgree: 'waitingAgree',
    timeout: 'timeout',
    agreed: 'agreed',
  };
  async createQRRecord(props) {
    const { ip, port } = props;
    const record = new QRRecordModel({
      webIp: ip,
      webPort: port,
    });
    await record.save();
    return record;
  }

  async checkQRRecordTimeout(qrRecord) {
    if (qrRecord.timeout || qrRecord.toc + this.validity < Date.now()) {
      // 过期
      await qrRecord.updateOne({
        $set: {
          timeout: true,
        },
      });
      ThrowCommonError(400, `二维码已失效`);
    }
  }

  async checkQRRecordBeforeScan(qrRecordId) {
    const qrRecord = await QRRecordModel.findOnly({ _id: qrRecordId });
    await this.checkQRRecordTimeout(qrRecord);
    if (qrRecord.scan || qrRecord.uid) {
      // 状态异常
      await qrRecord.updateOne({
        $set: {
          timeout: true,
        },
      });
      ThrowCommonError(400, `二维码已失效`);
    }
  }
  async checkQRRecordBeforeAgree(props) {
    const { qrRecordId, ip, uid } = props;
    const qrRecord = await QRRecordModel.findOnly({ _id: qrRecordId });
    await this.checkQRRecordTimeout(qrRecord);
    if (
      qrRecord.uid !== uid ||
      !qrRecord.scan ||
      qrRecord.agree ||
      ip !== qrRecord.scanIp
    ) {
      await qrRecord.updateOne({
        $set: {
          timeout: true,
        },
      });
      ThrowCommonError(400, `二维码已失效`);
    }
  }

  async scanQR(props) {
    const { ip, port, qrRecordId, uid } = props;
    await this.checkQRRecordBeforeScan(qrRecordId);
    const record = await QRRecordModel.findOnly({ _id: qrRecordId });
    await record.updateOne({
      $set: {
        uid,
        scan: true,
        scanTime: new Date(),
        scanIp: ip,
        scanPort: port,
      },
    });
  }

  async agreeQR(props) {
    const { qrRecordId, ip, uid } = props;
    await this.checkQRRecordBeforeAgree({
      qrRecordId,
      uid,
      ip,
    });
    const record = await QRRecordModel.findOnly({ _id: qrRecordId });
    await record.updateOne({
      $set: {
        agree: true,
        agreeTime: new Date(),
      },
    });
  }

  async verifyQRRecord(props) {
    const { ip, qrRecordId } = props;
    // waitingScan, waitingAgree, agreed, timeout
    const qrRecord = await QRRecordModel.findOnly({ _id: qrRecordId });
    try {
      await this.checkQRRecordTimeout(qrRecord);
    } catch (err) {
      return {
        status: this.status.timeout,
        uid: '',
      };
    }

    if (qrRecord.webIp !== ip) {
      return {
        status: this.status.timeout,
        uid: '',
      };
    }

    if (!qrRecord.scan) {
      return {
        status: this.status.waitingScan,
        uid: '',
      };
    }

    if (!qrRecord.agree) {
      return {
        status: this.status.waitingAgree,
        uid: '',
      };
    } else {
      await qrRecord.updateOne({
        $set: {
          timeout: true,
        },
      });
      return {
        status: this.status.agreed,
        uid: qrRecord.uid,
      };
    }
  }
}
module.exports = {
  qrRecordService: new QRRecordService(),
};
