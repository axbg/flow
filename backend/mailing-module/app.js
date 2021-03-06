const Koa = require('koa');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const PORT = require('./config').PORT;
const router = require('./routes');

const app = new Koa();

app.use(cors());
app.use(json());
app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log('flow - mailing module back-end started');
  console.log('running on http://localhost:' + PORT);
});
