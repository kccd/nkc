const Router = require('koa-router');
const logSettingRouter = new Router();
logSettingRouter
    .use('/', async (ctx, next) => {
        const {data, db} = ctx;
        ctx.template = 'experimental/settings/log.pug';
        const operationTypes = await db.OperationTypeModel.find().sort({toc: 1});
        data.operationTypes = await Promise.all(operationTypes.map(async type => {
            await type.extendOperationCount();
            return type;
        }));
        data.type = 'log';
        data.operations = await db.OperationModel.find().sort({toc: 1});
        // 如果操作在日志中已经被使用，则添加标记
        let logSettings = await db.SettingModel.findOne({_id:"log"});
        logSettings = logSettings.c;
        if(logSettings.operationsId.length > 0){
            data.logSettings = logSettings.operationsId
        }
        await next();
    })
    .get('/', async (ctx, next) => {
        const {data, db} = ctx;

        await next();
    })
    .post('/', async(ctx, next) => {
        const {data, db, body} = ctx;
        const {logParams} = body;
        if(logParams){
            let logSetting = await db.SettingModel.find({_id:"log"});
            await logSetting[0].update({"c.operationsId":logParams})
            
        }
        await db.SettingModel.saveSettingsToRedis("log");
        await next();
    });
module.exports = logSettingRouter;