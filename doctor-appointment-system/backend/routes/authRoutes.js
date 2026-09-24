const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// @route POST /api/auth/register
// body: { name, email, password, role, phone, specialization, qualification, experienceYears, consultationFee, clinicAddress, bio }
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, role, phone });

    // If registering as a doctor, create the accompanying profile
    if (role === "doctor") {
      const { specialization, qualification, experienceYears, consultationFee, clinicAddress, bio } =
        req.body;

      if (!specialization) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: "Specialization is required for doctors" });
      }

      await DoctorProfile.create({
        user: user._id,
        specialization,
        qualification,
        experienceYears,
        consultationFee,
        clinicAddress,
        bio,
      });
    }

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "No account found with this email" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
