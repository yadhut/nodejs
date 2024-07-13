const connectDb = require("./config/dbConnection");
const express = require("express");
const dotenv = require("dotenv").config()
const authRouter = require("./routes/authRoute");
const productRouter =  require("./routes/productRoute");
const cookieParser =  require("cookie-parser");
const bodyParser = require("body-parser");
const errorHander = require("./middleware/errorHandler");
const morgan = require("morgan");
connectDb();
const app = express();

const port =  process.env.PORT || 5000;

app.use(morgan());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.json());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter)

app.use(errorHander);


app.listen(port, () => {
    console.log("App is running on :", port);
});