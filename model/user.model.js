const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
      },
      email: {
        type: String,
        trim: true,
        unique: 'Email already exists',
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: 'Email is required'
      },
      password: {
        type: String,
        required: "Password is required"
      },
      updated: Date,
      created: {
        type: Date,
        default: Date.now
      }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;