const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { email, phone, password, role } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required.' });
    }
    if (!password || !role) {
      return res.status(400).json({ message: 'Password and role are required.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      email,
      phone,
      password: hashedPassword,
      image: req.body.image,
      role,
      verificationToken
    });
    await user.save();
    if (email) {
      await sendVerificationEmail(email, verificationToken);
    }
    res.status(201).json({ message: 'Signup successful. Please verify your email.' });
  } catch (err) {
    console.log('Error during signup:', err);
    
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    const user = await User.findOne(email ? { email } : { phone });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, "wearecoming", { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, phone: user.phone, role: user.role, image: user.image } });
  } catch (err) {
    console.log('Error during login:', err);
    
    res.status(500).json({ message: err.message });
  }
};
