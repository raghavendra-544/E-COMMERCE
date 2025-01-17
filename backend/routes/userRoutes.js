const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a user model
const router = express.Router();

// Register User
router.post('/signup', async (req, res) => {
  let check = await User.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "existing user found with same emailaddress" });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    cartData: {},
  });

  await user.save();

  const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// Login User
router.post('/login', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    const passCompare = await bcrypt.compare(req.body.password, user.password);
    if (passCompare) {
      const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
});

module.exports = router;
