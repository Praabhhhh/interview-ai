require("dotenv").config()

const express = require("express")
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})


















// require("dotenv").config()
// const app = require("./src/app")
// const connectToDB = require("./src/config/database")

// connectToDB()


// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log("Server restarted 🚀");
// });