require("dotenv").config()
const express = require("express")
const cors = require("cors")
const passport = require("passport")
const strategy = require('./passport')
const http = require('http');

// Express + create http server
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const server = http.createServer(app);

// Initialise port

const port = process.env.PORT || 5000;
app.set('port', port);

// passport strategy

passport.use(strategy)

// MongoDB
const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
const db = mongoose.connection;

//Initialise passport for all routes

app.use(passport.initialize())

// socket.io configuration

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONT_END_DOMAIN
  }
})

io.on('connection', socket => {
  socket.on('apiCall', ( { apiCall }) => {
    io.emit('apiCall', { apiCall })
  })
})

app.set('socketio', io)

// Routes
app.use("/availability", require("./routes/availabilityRoute"));
app.use("/user", require("./routes/userRoute"));


db.on("error", console.error.bind(console, "connection error:"));
db.once("open", _ => {
  console.log("Connected to DB");
});

// listening to port

server.listen(port);
server.on('listening', () => console.log(`listening to port ${port}`));

