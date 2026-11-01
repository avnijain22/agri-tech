const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./src/models/User");
const Product = require("./src/models/Product");

const products = [
  { name: "Hybrid Wheat Seeds (10 kg)", category: "seeds", description: "High-yield wheat variety", price: 850, stock: 100 },
  { name: "Basmati Rice Seeds (5 kg)", category: "seeds", description: "Long-grain aromatic rice", price: 700, stock: 80 },
  { name: "Soybean Seeds (10 kg)", category: "seeds", description: "Certified soybean seeds", price: 1200, stock: 60 },
  { name: "Urea Fertilizer (50 kg)", category: "fertilizers", description: "Nitrogen-rich fertilizer", price: 300, stock: 200 },
  { name: "DAP Fertilizer (50 kg)", category: "fertilizers", description: "Phosphorus and nitrogen blend", price: 1350, stock: 150 },
  { name: "Organic Compost (25 kg)", category: "fertilizers", description: "Improves soil health", price: 400, stock: 120 },
  { name: "Neem Oil Pesticide (1 L)", category: "pesticides", description: "Natural insect repellent", price: 450, stock: 90 },
  { name: "Chlorpyrifos Spray (1 L)", category: "pesticides", description: "Broad-spectrum insecticide", price: 520, stock: 70 },
  { name: "Hand Sprayer (16 L)", category: "equipment", description: "Manual knapsack sprayer", price: 1800, stock: 40 },
  { name: "Drip Irrigation Kit", category: "equipment", description: "Covers about 1 acre", price: 6500, stock: 25 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Admin user (created only if it doesn't exist yet)
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first");
    }

    const existing = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    if (existing) {
      console.log("Admin already exists, skipping");
    } else {
      await User.create({
        name: ADMIN_NAME || "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
      });

      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }

    // Products (inserted only if the collection is empty)
    if ((await Product.countDocuments()) === 0) {
      await Product.insertMany(products);
      console.log(`${products.length} products inserted`);
    } else {
      console.log("Products already exist, skipping");
    }
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
