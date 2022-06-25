const express = require("express");
const dotenv = require("dotenv");
const errorHandler = require("./middlewares/error_middleware.js");
const connectDB = require("./config/db.js");
const authRouter = require("./routes/auth_routes.js");
const userRouter = require("./routes/user_routes.js");
const orderRouter = require("./routes/order_routes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Configurations
dotenv.config();
const app = express();
connectDB();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/api/auth", authRouter);
app.use("/api", userRouter);
app.use("/api", orderRouter);

// Error Handler Middleware
app.use(errorHandler);

// Listning to port
app.listen(port, () => console.log(`Server started on port ${port}`));
