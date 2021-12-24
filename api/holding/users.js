const mongoose = require('mongoose');

const { Schema } = mongoose;

const usersSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

const Users = mongoose.model("Users", usersSchema);

module.exports.model = Users;
module.exports.schema = usersSchema;

