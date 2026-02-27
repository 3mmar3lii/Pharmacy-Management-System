const ConnectToDB = require("./db");
const app = require("./index");
require("dotenv").config();



const PORT = process.env.PORT || "3001";
ConnectToDB();

app.listen(PORT, () => {
  console.log("✅ Server running");
});
