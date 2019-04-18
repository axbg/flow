const Router = require('koa-router');
const router = new Router();
const studentController = require("../controllers/index");

router.get("/", async (ctx) => {
    ctx.body = { message: "flow - student module" };
})

router.get("/documents", studentController.getDocument);
router.get("/documents/:id", studentController.getDocument);

router.post("/", async (ctx) => {
    ctx.body = { message: "flow - student module - student registration" };
    //will call the mailing module
})

router.post("/login", async (ctx) => {
    //the actual login will be done inside the auth gateway
    //this endpoint will retrieve data such as Options, profile informations
    //credits, etc
    //if the password should be changed, etc
    ctx.body = { message: "flow - student module - student login data" };
})

router.post("/credits", async (ctx) => {
    ctx.body = { message: "flow - student module - student credits purchase" };
})

router.post("/options", async (ctx) => {
    ctx.body = { message: "flow - student module - student add or update options" };
})

router.put("/password", async (ctx) => {
    ctx.body = { message: "flow - student module - student password change" };
})

router.put("/ticket", async (ctx) => {
    ctx.body = { message: "flow - student module - update student entity with ticket value" };
})


module.exports = router;