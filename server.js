const express = require("express");
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server={DESKTOP-WINNIE\\SQLEXPRESS};Database={mlts-dqk};Trusted_Connection=Yes;"
};

/// Get Data from Table 'users' ///
app.get("/user", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ SQL Error: ", err);
    res.status(500).json({ error: "❌ Database error" });
  }
});

/// Login ///
app.post("/login", async (req, res) => {
  const { phone } = req.body;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("phone", sql.VarChar, phone)
      .query("SELECT * FROM users WHERE phone = @phone");

    if (result.recordset.length > 0) {
      res.json({ success: true, user: result.recordset[0] });
    } else {
      res.json({ success: false, message: "❌ User not found" });
    }
  } catch (err) {
    console.error("❌ SQL Error: ", err);
    res.status(500).json({ error: "❌ Database error" });
  }
});

/// Get User by Phone ///
app.get("/user/:phone", async (req, res) => {
  const { phone } = req.params;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("phone", sql.VarChar, phone)
      .query("SELECT * FROM users WHERE phone = @phone");

    if (result.recordset.length > 0) {
      res.json({ success: true, user: result.recordset[0] });
    } else {
      res.json({ success: false, message: "❌ User not found" });
    }
  } catch (err) {
    console.error("❌ SQL Error: ", err);
    res.status(500).json({ error: "❌ Database error" });
  }
});

/// Update User ///
app.post("/user/update", async (req, res) => {
  const { phone, username, email, gender, address, city, ward } = req.body;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.VarChar, email)
      .input("phone", sql.VarChar, phone)
      .input("gender", sql.NVarChar, gender)
      .input("address", sql.NVarChar, address)
      .input("city", sql.NVarChar, city)
      .input("ward", sql.NVarChar, ward)
      .query(`
        UPDATE users 
        SET username = @username,
            email = @email,
            gender = @gender,
            address = @address,
            city = @city,
            ward = @ward
        WHERE phone = @phone
      `);

    res.json({ success: true, message: "✅ User has successfully updated!" });
  } catch (err) {
    console.error("❌ SQL Error: ", err);
    res.status(500).json({ error: "❌ Database error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));