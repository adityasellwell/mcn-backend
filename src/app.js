import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import adminAuthMiddleware from "./middleware/adminAuthMiddleware.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import chapterRoleRoutes from "./routes/chapterRoleRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import meetingVisitorRoutes from "./routes/meetingVisitorRoutes.js";
import meetingMemberRoutes from "./routes/meetingMemberRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import referralRoutes from "./routes/referralRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mcnmumbai.com"
  ],
  credentials: true
}));

/*
|--------------------------------------------------------------------------
| Health Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "MCN API Running",
  });
});


/*
|--------------------------------------------------------------------------
|  Routes
|--------------------------------------------------------------------------
*/

app.use("/api/application", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chapter", chapterRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/chapterRole", chapterRoleRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/meetingVisitor", meetingVisitorRoutes);
app.use("/api/meetingMember", meetingMemberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/referral", referralRoutes)
app.use("/api/dashboard", dashboardRoutes);
/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MCN Server Running On Port ${PORT}`);
});