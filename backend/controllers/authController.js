const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET; // Ensure this is loaded from the environment

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (userDoc && bcrypt.compareSync(password, userDoc.password)) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({ id: userDoc._id, username });
    });
  } else {
    res.status(400).json('Wrong credentials');
  }
};

exports.profile = (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json('JWT token not provided');

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(401).json('Invalid token');
    res.json(info);
  });
};

exports.logout = (req, res) => {
  res.cookie('token', '').json('ok');
};
