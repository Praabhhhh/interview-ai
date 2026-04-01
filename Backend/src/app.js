const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

console.log("APP FILE LOADED ✅")

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

const app = express()

// ✅ ADD THIS LINE (VERY IMPORTANT)
app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: "https://interview-ai-eight-sable.vercel.app",
  credentials: true
}));

// TEST
app.get("/test", (req, res) => {
  res.send("Backend working ✅")
})

// DEBUG
app.get("/check", (req, res) => {
  res.send("CHECK ROUTE WORKING ✅")
})

// ROOT
app.get("/", (req, res) => {
  res.send("API WORKING ROOT ✅")
})

// ROUTES
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app





















// const express = require("express")
// const cookieParser = require("cookie-parser")
// const cors = require("cors")

// const app = express()

// app.use(express.json())
// app.use(cookieParser())
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://your-frontend.vercel.app"
//   ],
//   credentials: true
// }));



// // app.use(cors({
// //     origin: "http://localhost:5173",
// //     credentials: true
// // }))

// /* require all the routes here */
// const authRouter = require("./routes/auth.routes")
// const interviewRouter = require("./routes/interview.routes")


// /* using all the routes here */
// app.use("/api/auth", authRouter)
// app.use("/api/interview", interviewRouter)


// app.get("/test", (req, res) => {
//     res.send("Backend working ✅");
// });



// module.exports = app