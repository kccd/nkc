const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
router
    .use('/', Public(), async(ctx, next) => {
        const { db, data, params } = ctx;
        const { rid } = params;
        const resource = await db.ResourceModel.findOne({ rid });
        if (!resource) {
            ctx.throw(404, `resource not found, rid: ${rid}`);
        }
        await resource.filenameFilter();
        data.resource = resource;
        await next();
    })
    .get('/', Public(), async(ctx, next) => {
        const { db, data } = ctx;
        let resource = data.resource.toObject();
        resource.user = await db.UserModel.findOne({ uid: resource.uid });
        data.hasPermission = data.user ? true : false;
        const libraries = await db.LibraryModel.find({
            rid: resource.rid,
            closed: false,
            deleted: false,
        });
        data.path = [];
        for (let l of libraries) {
            data.path.push(await l.getPath());
        }
        if (data.resource.mediaType === 'mediaVideo') {
            data.videoPlayerData = await data.resource.extendVideoPlayerData();
        }
        data.resource = resource;
        await next();
    });
module.exports = router;