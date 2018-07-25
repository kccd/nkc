const crypto = require('crypto');

module.exports = {
  encryptInMD5WithSalt: (password, salt) => {
  	const md5 = (str) => {
			const md5 = crypto.createHash('md5');
			md5.update(str);
			return md5.digest('hex');
	  };
  	return md5(md5(password)+salt);
    /*const md5 = crypto.createHash('md5');
    md5.update(password);
    const hashed = md5.digest('hex') + salt;
    md5.update(hashed);
    return md5.digest('hex')*/
  },
  encryptInSHA256HMACWithSalt: (password, salt) => {
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(password);
    return hmac.digest('hex')
  },
	aesEncode: (data, key) => {
		const cipher = crypto.createCipher('aes256', key);
		let crypted = cipher.update(data, 'utf8', 'hex');
		crypted += cipher.final('hex');
		return crypted;
	},
	aesDecode: (encrypted, key) => {
		const decipher = crypto.createDecipher('aes256', key);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}
};