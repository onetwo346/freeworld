const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost/freeworld', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  ip: String,
  displayName: String,
  bio: String,
  coins: { type: Number, default: 0 },
});
const User = mongoose.model('User', UserSchema);

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FW-';
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3 || i === 7) code += '-';
  }
  return code;
}

app.post('/generate-code', async (req, res) => {
  const ip = req.ip;
  const code = generateCode();
  const user = new User({ code, ip });
  await user.save();
  res.json({ code, message: 'Save this code!' });
});

app.post('/login', async (req, res) => {
  const { code } = req.body;
  const ip = req.ip;
  const user = await User.findOne({ code });
  if (user && user.ip === ip) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'Invalid code or IP mismatch' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));p
