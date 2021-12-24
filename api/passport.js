const passportJwt = require('passport-jwt');
const Users = require('./models/Users').model

const { ExtractJwt, Strategy } = passportJwt;

const options = {

  secretOrKey: process.env.JWT_SECRET,

  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
}

const strategy = new Strategy(options, async (payload, callback) => {
  const user = await Users.findOne({ username: payload.username });

  if (!user) {
    return callback(new Error("User not found"), null);
  }
  return callback(null, { username: user.username });
});

module.exports = strategy;