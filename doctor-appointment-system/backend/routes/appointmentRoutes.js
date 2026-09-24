const express = require("express");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// @route POST /api/appointments
// Patient books a slot. body: { doctorId, date, time, reason }
router.post("/", protect, requireRole("patient"), async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date and time are required" });
    }

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const day = doctor.availability.find((d) => d.date === date);
    const slot = day && day.slots.find((s) => s.time === time);

    if (!slot) {
      return res.status(400).json({ message: "That slot is no longer listed as available" });
    }
    if (slot.isBooked) {
      return res.status(409).json({ message: "That slot has just been booked by someone else" });
    }

    slot.isBooked = true;
    await doctor.save();

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      time,
      reason,
      status: "pending",
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Could not book appointment", error: err.message });
  }
});

// @route GET /api/appointments/mine
// Returns appointments for the logged-in patient OR doctor, depending on role.
router.get("/mine", protect, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === "patient") {
      appointments = await Appointment.find({ patient: req.user.id })
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
        .sort({ date: 1 });
    } else {
      const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
      if (!doctorProfile) return res.json([]);
      appointments = await Appointment.find({ doctor: doctorProfile._id })
        .populate("patient", "name email phone")
        .sort({ date: 1 });
    }
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Could not load appointments", error: err.message });
  }
});

// @route PATCH /api/appointments/:id/status
// Doctor updates status: confirmed | completed | cancelled
router.patch("/:id/status", protect, requireRole("doctor"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status;

    // Free the slot back up if the doctor cancels it
    if (status === "cancelled") {
      const doctor = await DoctorProfile.findById(appointment.doctor);
      const day = doctor && doctor.availability.find((d) => d.date === appointment.date);
      const slot = day && day.slots.find((s) => s.time === appointment.time);
      if (slot) {
        slot.isBooked = false;
        await doctor.save();
      }
    }

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Could not update appointment", error: err.message });
  }
});

// @route DELETE /api/appointments/:id
// Patient cancels their own appointment.
router.delete("/:id", protect, requireRole("patient"), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    const doctor = await DoctorProfile.findById(appointment.doctor);
    const day = doctor && doctor.availability.find((d) => d.date === appointment.date);
    const slot = day && day.slots.find((s) => s.time === appointment.time);
    if (slot) {
      slot.isBooked = false;
      await doctor.save();
    }

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Could not cancel appointment", error: err.message });
  }
});

module.exports = router;
