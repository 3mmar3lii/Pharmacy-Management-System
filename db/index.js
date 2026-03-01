const mongoose = require("mongoose");

async function ConnectToDB() {
  try {
    if (!process.env.MONGO_URL) {
      console.log("Missing Important mongo url to connect !");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}


mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

module.exports = ConnectToDB;
