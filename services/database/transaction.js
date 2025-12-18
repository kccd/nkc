const mongoose = require('../../settings/database');

class TransactionService {
  /**
   * @param {Function} callback - 异步回调函数，接收 session 作为参数
   * @param {ClientSession} [externalSession] - 可选的外部事务 session
   */
  withTransaction = async (callback, externalSession) => {
    // 如果已经存在外部 session，直接复用并执行回调
    if (externalSession) {
      return await callback(externalSession);
    }
    // 如果没有外部 session，启动新的事务流程
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
}

module.exports = {
  transactionService: new TransactionService(),
};
