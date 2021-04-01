const {scheduleJob} = require('node-schedule');
const moment = require('moment');
const {spawn} = require('child_process');
const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
const mongodb = require('../config/mongodb');
require('colors');
const db = require("../dataModels");
const {
  PostModel, ThreadModel, UserModel, ActiveUserModel,
  ShopOrdersModel, ShopRefundModel, ShopGoodsModel,
  SettingModel, ForumModel, VerificationModel
} = db;

const jobs = {};
jobs.updateActiveUsers = cronStr => {
  scheduleJob(cronStr, async () => {
    console.log('now updating the activeusers collection...'.blue);
    const aWeekAgo = Date.now() - 604800000;
    await ActiveUserModel.deleteMany();
    const recycleId = await SettingModel.getRecycleId();
    const data = await PostModel.aggregate([
      {$project: {_id: 0,pid: 1, toc: 1, uid: 1, tid: 1}},
      {$match: {toc: {$gt: new Date(aWeekAgo)}}},
      {$group: {_id: '$uid', posts: {$push: '$$ROOT'}}}
    ]);
    for(let d of data){
      let threadCount = 0, postCount = 0;
      const targetUser = await UserModel.findOnly({uid: d._id});
      if(targetUser.certs.includes('banned')) continue;
      for (let post of d.posts) {
        const thread = await ThreadModel.findOne({tid: post.tid, oc: post.pid});
        if(thread) {
        	if(thread.fid !== recycleId && !thread.recycleMark) threadCount++;
        } else {
        	const p = await PostModel.findOne({pid: post.pid, disabled: false});
        	if(p) postCount++;
        }
      }
      const vitality = 3 * threadCount + postCount;
      // const vitality = user.vitalityArithmetic(threadCount, postCount);
      const newActiveUser = new ActiveUserModel({
        lWThreadCount: threadCount,
        lWPostCount: postCount,
        uid: targetUser.uid,
        vitality
      });
      await newActiveUser.save();
    }
    await ActiveUserModel.saveActiveUsersToCache();
  })
};

// 清除专业和文章上的今日更新
jobs.clearForumAndThreadPostCount = () => {
  scheduleJob(`0 0 0 * * *`, async () => {
    await ForumModel.updateMany({
      countPostsToday: {$ne: 0},
    }, {
      $set: {
        countPostsToday: 0
      }
    });
    await ThreadModel.updateMany({
      countToday: {$ne: 0}
    }, {
      $set: {
        countToday: 0
      }
    });
  });
};

jobs.shop = () => {
  scheduleJob("0 * * * * *", async () => {
    const time = Date.now();
    let shopSettings = await SettingModel.findOnly({_id: "shop"});
    shopSettings = shopSettings.c;
    let refunds, orders;
    // 1. 自动确认收货
    orders = await ShopOrdersModel.find({
      closeStatus: false,
      refundStatus: {$in: [null, "fail"]},
      orderStatus: "unSign",
      autoReceiveTime: {
        $lte: time
      }
    });
    for(const order of orders) {
      try {
        await order.confirmReceipt();
      } catch(err) {
        await order.update({
          error: err.message || JSON.stringify(err)
        });
      }
    }

    // 2. 买家提出退货/退款退货申请
    refunds = await ShopRefundModel.find({
      status: {
        $in: ["B_APPLY_RM", "B_APPLY_RP"]
      },
      succeed: null,
      tlm: {
        $lt: time - (shopSettings.refund.agree*60*60*1000)
      }
    });

    for(const refund of refunds) {
      try{
        await refund.sellerAgreeRM(
          `卖家处理超时，默认同意${refund.status === "B_APPLY_RM"? "退款": "退货退款"}申请`
        );
      } catch(err) {
        await refund.update({
          error: err.message || JSON.stringify(err)
        });
      }
    }

    // 3. 买家退货，卖家确认收货超时
    refunds = await ShopRefundModel.find({
      status: "B_INPUT_INFO",
      succeed: null,
      tlm: {
        $lt: time - (shopSettings.refund.sellerReceive*60*60*1000)
      }
    });
    for(const refund of refunds) {
      try {
        await refund.sellerAgreeRM(
          "卖家处理超时，默认卖家确认收货"
        );
      } catch(err) {
        await refund.update({
          error: err.message || JSON.stringify(err)
        });
      }
    }

    // 4. 买家申请平台介入
    refunds = await ShopRefundModel.find({
      status: "B_INPUT_CERT_RM",
      succeed: null,
      tlm: {
        $lt: time - (shopSettings.refund.cert*60*60*1000)
      }
    });
    for(const refund of refunds) {
      try{
        await refund.sellerAgreeRM(
          "卖家处理超时，默认卖家同意退款"
        );
      } catch(err) {
        await refund.update({
          error: err.message || JSON.stringify(err)
        });
      }
    }

    // 5. 买家填写物流信息
    refunds = await ShopRefundModel.find({
      status: "S_AGREE_RP",
      succeed: null,
      tlm: {
        $lt: time - (shopSettings.refund.buyerTrack*60*60*1000)
      }
    });
    for(const refund of refunds) {
      try {
        await refund.buyerGiveUp(
          "买家发货超时，默认取消申请"
        );
      } catch(err) {
        await refund.update({
          error: err.message || JSON.stringify(err)
        });
      }
    }

    // 6. 买家下单 未付款
    orders = await ShopOrdersModel.find({
      closeStatus: false,
      refundStatus: {$in: [null, "fail"]},
      orderStatus: "unCost",
      orderToc: {
        $lt: time - (shopSettings.refund.pay*60*60*1000)
      }
    });
    for(const order of orders) {
      try {
        await order.cancelOrder(
          "买家未在规定的时间内完成付款，订单已被取消"
        );
      } catch(err) {
        order.update({
          error: err.message || JSON.stringify(err)
        })
      }

    }

    // 7. 定时上架
    const products = await ShopGoodsModel.find({
      productStatus: "notonshelf",
      $and: [
        {
          shelfTime: {
            $ne: null
          }
        },
        {
          shelfTime: {
            $lt: Date.now()
          }
        }
      ]
    });
    for(const product of products) {
      try {
        await product.onshelf();
      } catch(err) {
        await product.update({
          error: err.message || JSON.stringify(err)
        });
      }
    }
  });
};
// 凌晨4点，核对kcb账单
// 调整积分后 注释
/*jobs.checkKcbsRecords = async () => {
  scheduleJob("0 0 4 * * *", async () => {
    fork("./timedTasks/checkKcbsRecords.js");
  });
};*/

// 检查筹备专业
jobs.preparationForumCheck = async () => {
  const preparationForumCheck = require("./preparationForumCheck");
  scheduleJob("0 0 4 * * *", async () => {
    await preparationForumCheck();
  });
}

// 自动将退修未修改的文章移动到回收站
jobs.moveRecycleMarkThreads = () => {
  scheduleJob("0 * * * * *", async () => {
    await ThreadModel.moveRecycleMarkThreads();
  });
};


// jobs.checkKcbsRecords();
const sleep = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t)
  });
};


/*
* 清理文件上传缓存 24小时以前的缓存
* */
jobs.clearFileCache = async () => {
  const {uploadDir} = require('../settings/upload');
  scheduleJob("0 0 4 * * *", async () => {
    console.log(`正在清理文件缓存...`);
    let count = 0;
    const time = Date.now() - 24*60*60*1000;
    const dir = await fsPromise.readdir(uploadDir);
    for(const d of dir) {
      if(d.indexOf('upload_') !== 0) continue;
      const filePath = path.resolve(uploadDir, `./${d}`);
      const state = await fsPromise.stat(filePath);
      if(!state.isFile()) continue;
      const fileTime = (new Date(state.mtime)).getTime();
      if(fileTime > time) continue;
      await fsPromise.unlink(filePath);
      count ++;
    }
    console.log(`文件缓存清理完成，共清理文件${count}个`);
  });
}
/*
* 清空24小时之前的图形验证码图片字段
* */
jobs.clearVerificationData = async () => {
  scheduleJob(`0 0 5 * * *`, async () => {
    console.log(`正在清理图形验证码...`);
    await VerificationModel.updateMany({
      toc: {$lte: Date.now() - 24 * 60 * 60 * 1000}
    }, {
      $set: {
        c: null
      }
    });
    console.log(`图形验证码清理完成`);
  });
}

module.exports = jobs;
