const path = require('path');
const fs = require('fs');
const { tmpDirPath } = require('../../settings/statics');
const mongoose = require('../../settings/database');
const { generateSecretWatermark } = require('../../tools/imageMagick');
class SecretWatermarkService {
  chars = '0123456789abcdefghijklmnpqrstuvwxyz';

  encodeText(uid, targetId) {
    let targetIdNumber = Number(targetId);
    if (isNaN(targetIdNumber)) {
      targetIdNumber = 0;
    }
    const sum = Number(uid) + targetIdNumber;
    return this.toBase32(sum);
  }

  decodeText(encodedText, targetId) {
    const sum = this.toBase10(encodedText);
    return (sum - Number(targetId)).toString();
  }

  toBase32(num) {
    let result = '';

    while (num > 0) {
      result = this.chars[num % 32] + result;
      num = Math.floor(num / 32);
    }

    return result || '0';
  }

  toBase10(str) {
    let result = 0;

    for (let i = 0; i < str.length; i++) {
      result = result * 32 + this.chars.indexOf(str[i]);
    }

    return result;
  }

  async generateWatermark(uid, targetId) {
    const tempImagePath = path.join(
      tmpDirPath,
      `secret_watermark_${new mongoose.Types.ObjectId()}.png`,
    );
    await generateSecretWatermark(
      '非公开内容禁止转载 ' + this.encodeText(uid, targetId),
      tempImagePath,
    );
    const fileBuffer = await fs.promises.readFile(tempImagePath);
    await fs.promises.unlink(tempImagePath);
    return fileBuffer;
  }
}

module.exports = {
  secretWatermarkService: new SecretWatermarkService(),
};
