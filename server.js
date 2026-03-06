require("dotenv").config();
const ConnectToDB = require("./db");
const app = require("./index");



const PORT = process.env.PORT || "3001";
ConnectToDB();

app.listen(PORT, () => {
  console.log("✅ Server running");
});
console.log("Public Key:", process.env.IMAGEKIT_PUBLIC_KEY);
