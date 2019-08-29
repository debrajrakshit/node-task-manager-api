const bcrypt = require('bcryptjs');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const express = require('express');
const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// listen to port
app.listen(port, () => {
    console.log('Server is up on port ' + port);
});