const express = require('express');
const userRouter = require('./routers/user');
const contentRouter = require('./routers/content');
require('dotenv').config();
require('./mdb/mongoose');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(contentRouter);

app.listen(3000, () => {
  console.log('The port is started in port 3000.');
});
