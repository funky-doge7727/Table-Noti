const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../models/users').model

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  const newUser = await Users.create({
    username: username,
    password: hashedPassword,
    role: 'user'
  });

  res.json({
    username: newUser.username
  });
});


router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await Users.findOne({ username: username });

  if (!foundUser) {
    res.status(403).json({ error: 'Not a valid username' });
    return
  }
  
  const isCorrectPassword = bcrypt.compareSync(password, foundUser.password);

  if (!isCorrectPassword) {
    res.status(403).json({ error: 'Password incorrect' });
    return
  }

  const token = jwt.sign({ username: username }, process.env.JWT_SECRET);

  res.json({
    token: token
  });
});

module.exports = router;