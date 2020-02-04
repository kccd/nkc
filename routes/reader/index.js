const router = require("koa-router")();
const pdfRouter = require("./pdf");
router.use("/pdf", pdfRouter.routes(), pdfRouter.allowedMethods());
module.exports = router;