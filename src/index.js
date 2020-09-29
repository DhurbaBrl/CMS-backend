const express = require('express');
const userRouter = require('./routers/user');
require('dotenv').config();
require('./mdb/mongoose');

const app = express();

app.use(express.json());
app.use(userRouter);

app.listen(3000, () => {
  console.log('The port is started in port 3000.');
});
