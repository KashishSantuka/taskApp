const express = require("express");
const userRouter = require("./routes/user.js");
const taskRouter = require("./routes/task.js");
const dotenv = require('dotenv');

dotenv.config()

const app = express();
const port = process.env.PORT;


app.use(express.json());

app.use("/user", userRouter);
app.use("/task", taskRouter);

app.listen(port, () => {
  console.log(`Server Started At Port: ${port}`);
});