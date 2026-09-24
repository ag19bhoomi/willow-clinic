const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // e.g. "10:30 AM"
    isBooked: { type: Boolean, default: false },
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD" — kept as string for simple matching
    slots: [slotSchema],
  },
  { _id: true }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true, default: "" },
    experienceYears: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    clinicAddress: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
