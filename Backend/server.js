import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import AuthRoute from "./routes/UserManagement.js";
import Auth from "./models/Auth.js";
import bookRoute from './routes/booksRoute.js'

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;

app.use(
  cors({
     origin:process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/auth", AuthRoute);
app.use("/api/books", bookRoute);

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
