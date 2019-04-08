const {scheduleJob} = require('node-schedule');
const moment = require('moment');
const {spawn} = require('child_process');
const settings = require('./settings');
const backup = require('./settings/backup');
const fs = require('fs');
const path = require('path');
const mongodb = require('./config/mongodb');
const {database, elastic, user} = settings;
const {client} = elastic;
require('colors');

const {
  PostModel, ThreadModel, UserModel, ActiveUserModel,
  ShopOrdersModel, ShopRefundModel, ShopGoodsModel,
  SettingModel
} = require('./dataModels');

const jobs = {};
jobs.updateActiveUsers = cronStr => {
  scheduleJob(cronStr, async () => {
    console.log('now updating the activeusers collection...'.blue);
    const aWeekAgo = Date.now() - 604800000;
    await ActiveUserModel.deleteMany();
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
        	if(thread.fid !== 'recycle' && !thread.recycleMark) threadCount++;
        } else {
        	const p = await PostModel.findOne({pid: post.pid, disabled: false});
        	if(p) postCount++;
        }
      }
      const vitality = user.vitalityArithmetic(threadCount, postCount, targetUser.xsf);
      const newActiveUser = new ActiveUserModel({
        lWThreadCount: threadCount,
        lWPostCount: postCount,
        uid: targetUser.uid,
        vitality
      });
      await newActiveUser.save();
    }
  })
};

jobs.backupDatabase = () => {
	scheduleJob(backup.cronStr, async () => {
		fs.appendFile(`${path.resolve(__dirname)}/backup.log`, `\n\n${moment().format('YYYY-MM-DD HH:mm:ss')} 开始备份数据...\n`, (err) => {
			if(err) {
				console.log(err);
			}
		});
		console.log(`\n\n${moment().format('YYYY-MM-DD HH:mm:ss')} 开始备份数据...\n`);
		let data = '', error = '';
		const process = spawn(
			'mongodump.exe',
			[
				'--gzip',
        '-u',
        mongodb.username,
        '-p',
        mongodb.password,
				'--host',
				`${mongodb.address}:${mongodb.port}`,
				'--db',
				backup.database,
				'--out',
				`${backup.out}${moment().format('YYYYMMDDHHmmss')}`,
			]
		);
		process.stdout.on('data', (d) => {
			d = d.toString();
			console.log(d);
			data += (d+'\n');
		});
		process.stderr.on('data', (d) => {
			d = d.toString();
			console.log(d);
			error += (d+'\n');
		});
		process.on('close', (code) => {
			let info = '';
			if (code === 0) {
				info = `${moment().format('YYYY-MM-DD HH:mm:ss')} 备份完成`;
			} else {
				info = `${moment().format('YYYY-MM-DD HH:mm:ss')} 备份失败\n${error}`;
			}
			console.log(info);
			fs.appendFile(`${path.resolve(__dirname)}/backup.log`, info, (err) => {
				if(err) {
					console.log(err);
				}
			})
		});
	});
	console.log(`数据库自动备份已启动`.green);
};

jobs.updateForums = cronStr => {
	const {ForumModel} = require('./dataModels');
	scheduleJob(cronStr, async () => {
		const t = Date.now();
		console.log('now updating the forums ...'.blue);
		const forums = await ForumModel.find({});
		for(let forum of forums) {
			await forum.updateForumMessage();
		}
		console.log('done', Date.now()-t+'ms');
	})
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
      toc: {
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

jobs.truncateUsersLoginToday = cronStr => {

};
jobs.indexToES = cronStr => {

};

module.exports = jobs;
