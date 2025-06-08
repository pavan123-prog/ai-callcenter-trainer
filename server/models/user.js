const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'csr'], default: 'csr' },
}, { timestamps: true });

//  REMOVE this block to avoid double hashing
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(this.password, salt);
//     this.password = hash;
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// ✅ Compare password method with logging
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log(" Checking password...");
  console.log("Entered password:", candidatePassword);
  console.log("Stored (hashed) password:", this.password);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log("Password match:", isMatch);
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);
