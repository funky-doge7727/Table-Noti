require("dotenv").config()
const express = require("express")
const cors = require("cors")
const passport = require("passport")
const strategy = require('./passport')

// passport strategy

passport.use(strategy)

// MongoDB
const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
const db = mongoose.connection;



// Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//initialise passport 

app.use(passport.initialize())

// Routes
app.use("/availability", require("./routes/availabilityRoute"));
app.use("/user", require("./routes/userRoute"));


db.on("error", console.error.bind(console, "connection error:"));
db.once("open", _ => {
  console.log("Connected to DB");
});

module.exports = app;
