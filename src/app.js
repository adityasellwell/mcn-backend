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
import sliderRoutes from "./routes/sliderRoutes.js";
import portalRoutes from "./routes/portalRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
dotenv.config();

const app = express();

// ─── Hostinger (and most hosts) run this app behind a reverse proxy, which
// adds an X-Forwarded-For header carrying the visitor's real IP. Express
// ignores that header by default (security default — anyone could fake it
// otherwise), which breaks express-rate-limit's per-IP tracking (every
// visitor gets bucketed under the proxy's IP instead of their own).
// Trusting exactly one hop matches a single reverse proxy in front of the
// app — do not raise this without confirming the actual proxy chain depth,
// since trusting more hops than actually exist lets a client spoof its IP
// via that same header. ───
app.set("trust proxy", 1);

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
app.use("/api/slider", sliderRoutes);
app.use("/api/portal", portalRoutes);
app.use("/api/contact", contactRoutes);
/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MCN Server Running On Port ${PORT}`);
});