require("dotenv").config();
const mongoose = require("mongoose");
const ConnectToDB = require("../db");

// Models
const User = require("../models/User");
const Category = require("../models/Category");
const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");

const mockCategories = [
  { nameEn: "Antibiotics", nameAr: "مضادات حيوية" },
  { nameEn: "Painkillers", nameAr: "مسكنات ألم" },
  { nameEn: "Vitamins", nameAr: "فيتامينات" },
];

const seedData = async () => {
  try {
    await ConnectToDB();

    console.log("Clearing existing data...");
    await User.deleteMany();
    await Category.deleteMany();
    await Medicine.deleteMany();
    await Pharmacy.deleteMany();

    console.log("Inserting Mock Categories...");
    const createdCategories = await Category.insertMany(mockCategories);

    console.log("Inserting Mock Users...");
    const adminUser = await User.create({
      username: "admin123",
      email: "admin@pharmacy.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      phone: "01000000000",
    });

    const normalUser = await User.create({
      username: "user1234",
      email: "user@pharmacy.com",
      password: "password123",
      firstName: "Normal",
      lastName: "User",
      role: "user",
      phone: "01000000001",
    });

    console.log("Inserting Mock Medicines...");
    const mockMedicines = [
      {
        nameEn: "Panadol Extra",
        nameAr: "بانادول اكسترا",
        price: 50,
        quantity: 100,
        description: "Pain reliever and fever reducer",
        category: [createdCategories[1]._id],
        brand: "GSK",
        requiresPrescription: false,
      },
      {
        nameEn: "Amoxil 500mg",
        nameAr: "أموكسيل ٥٠٠ مجم",
        price: 80,
        quantity: 50,
        description: "Antibiotic used to treat bacterial infections",
        category: [createdCategories[0]._id],
        brand: "GSK",
        requiresPrescription: true,
      },
      {
        nameEn: "Centrum Lutein",
        nameAr: "سنتروم لوتين",
        price: 200,
        quantity: 30,
        description: "Multivitamins and dietary supplement",
        category: [createdCategories[2]._id],
        brand: "Pfizer",
        requiresPrescription: false,
      },
    ];

    await Medicine.insertMany(mockMedicines);

    console.log("Data Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error with data import", error);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
      await ConnectToDB();
  
      console.log("Clearing existing data...");
      await User.deleteMany();
      await Category.deleteMany();
      await Medicine.deleteMany();
      await Pharmacy.deleteMany();
  
      console.log("Data Destroyed Successfully!");
      process.exit();
    } catch (error) {
      console.error("Error with data destruction", error);
      process.exit(1);
    }
  };
  
if (process.argv[2] === "-d") {
    destroyData();
} else {
    seedData();
}
