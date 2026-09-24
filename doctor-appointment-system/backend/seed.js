// Optional helper: populates a few sample doctors so you have something to
// browse and book immediately after setup. Run with: node seed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const DoctorProfile = require("./models/DoctorProfile");

const sampleDoctors = [
  {
    name: "Dr. Anjali Mehra",
    email: "anjali.mehra@example.com",
    specialization: "Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    experienceYears: 9,
    consultationFee: 700,
    clinicAddress: "Heartcare Clinic, MP Nagar, Bhopal",
    bio: "Focuses on preventive heart care and long-term follow-up rather than one-off consultations.",
  },
  {
    name: "Dr. Rohit Verma",
    email: "rohit.verma@example.com",
    specialization: "Dermatology",
    qualification: "MBBS, DDVL",
    experienceYears: 6,
    consultationFee: 500,
    clinicAddress: "Skin & Wellness Center, Arera Colony, Bhopal",
    bio: "Sees a lot of everyday skin and hair concerns, plus minor procedures.",
  },
  {
    name: "Dr. Kavita Rao",
    email: "kavita.rao@example.com",
    specialization: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics)",
    experienceYears: 12,
    consultationFee: 600,
    clinicAddress: "Little Steps Child Clinic, Kolar Road, Bhopal",
    bio: "Believes most parenting worries need a calm explanation more than a prescription.",
  },
];

async function seed() {
  await connectDB();
  const password = await bcrypt.hash("password123", 10);

  for (const doc of sampleDoctors) {
    const existing = await User.findOne({ email: doc.email });
    if (existing) {
      console.log(`Skipping ${doc.name}, already exists`);
      continue;
    }

    const user = await User.create({
      name: doc.name,
      email: doc.email,
      password,
      role: "doctor",
      phone: "9999999999",
    });

    await DoctorProfile.create({
      user: user._id,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experienceYears: doc.experienceYears,
      consultationFee: doc.consultationFee,
      clinicAddress: doc.clinicAddress,
      bio: doc.bio,
      availability: [
        { date: "2026-09-25", slots: [{ time: "10:00 AM" }, { time: "10:30 AM" }, { time: "11:00 AM" }] },
        { date: "2026-09-26", slots: [{ time: "4:00 PM" }, { time: "4:30 PM" }, { time: "5:00 PM" }] },
      ],
    });

    console.log(`Created ${doc.name} (login: ${doc.email} / password123)`);
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed();
