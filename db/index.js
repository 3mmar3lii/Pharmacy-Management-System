const mongoose = require("mongoose");

async function ConnectToDB() {
  try {
    await mongoose.connect(`mongodb+srv://AliElgendy:Pharmacy95System@cluster0.mq9ox9m.mongodb.net/Pharmacy?retryWrites=true&w=majority&appName=pharmacy-api`);
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
