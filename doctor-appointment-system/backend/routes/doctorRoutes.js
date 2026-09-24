const express = require("express");
const DoctorProfile = require("../models/DoctorProfile");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/doctors
// Public directory of doctors, optionally filtered by specialization (?specialization=Cardiology)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.specialization) {
      filter.specialization = new RegExp(req.query.specialization, "i");
    }
    const doctors = await DoctorProfile.find(filter).populate("user", "name email phone");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Could not load doctors", error: err.message });
  }
});

// @route GET /api/doctors/:id
router.get("/:id", async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id).populate("user", "name email phone");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Could not load doctor", error: err.message });
  }
});

// @route GET /api/doctors/me/profile
// Doctor viewing their own profile (needed before availability id is known on the frontend)
router.get("/me/profile", protect, requireRole("doctor"), async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user.id }).populate(
      "user",
      "name email phone"
    );
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Could not load profile", error: err.message });
  }
});

// @route POST /api/doctors/me/availability
// body: { date: "2026-09-25", slots: ["10:00 AM", "10:30 AM"] }
// Adds a new day of availability, or merges new slot times into an existing day.
router.post("/me/availability", protect, requireRole("doctor"), async (req, res) => {
  try {
    const { date, slots } = req.body;
    if (!date || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "A date and at least one time slot are required" });
    }

    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    let day = doctor.availability.find((d) => d.date === date);
    if (!day) {
      doctor.availability.push({ date, slots: slots.map((time) => ({ time })) });
    } else {
      const existingTimes = new Set(day.slots.map((s) => s.time));
      slots.forEach((time) => {
        if (!existingTimes.has(time)) day.slots.push({ time });
      });
    }

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Could not update availability", error: err.message });
  }
});

// @route DELETE /api/doctors/me/availability/:date/:slotId
router.delete("/me/availability/:date/:slotId", protect, requireRole("doctor"), async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const day = doctor.availability.find((d) => d.date === req.params.date);
    if (!day) return res.status(404).json({ message: "No availability found for that date" });

    day.slots = day.slots.filter((s) => s._id.toString() !== req.params.slotId);
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Could not remove slot", error: err.message });
  }
});

// @route PUT /api/doctors/me/profile
router.put("/me/profile", protect, requireRole("doctor"), async (req, res) => {
  try {
    const allowed = [
      "specialization",
      "qualification",
      "experienceYears",
      "consultationFee",
      "clinicAddress",
      "bio",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const doctor = await DoctorProfile.findOneAndUpdate({ user: req.user.id }, updates, {
      new: true,
    });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Could not update profile", error: err.message });
  }
});

module.exports = router;
