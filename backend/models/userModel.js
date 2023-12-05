const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash the password before saving it to the database

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') || user.isNew) {
    try {
      const trimmedPassword = user.password.trim(); 
      const hashedPassword = await bcrypt.hash(trimmedPassword,10);
      user.password = hashedPassword;
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    return next();
  }
});


UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
/*

UserSchema.methods.validPassword = function(password) {
    return password === this.password;
};
*/
const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
