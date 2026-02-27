const mongoose = require("mongoose");

async function ConnectToDB() {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/FacultySystemV2`);
    console.log(`✅ MongoDB Connected`);
    console.log("");
  } catch (error) {
    console.log("");
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
