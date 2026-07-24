const express = require('express');
// const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://individual-projects-2208-default-rtdb.asia-southeast1.firebasedatabase.app'
});

// Initialize Firebase Database reference
const db = admin.database();

// const config = {
//   connectionString:
//     'Driver={ODBC Driver 17 for SQL Server};Server={DESKTOP-WINNIE\\SQLEXPRESS};Database={mlts-dqk};Trusted_Connection=Yes;'
// };

/// Get Data from Table 'users' ///
app.get('/user', async (req, res) => {
  try {
    // const pool = await sql.connect(config);
    // const result = await pool.request().query('SELECT * FROM users');
    // res.json(result.recordset);

    const snapshot = await db.ref('users').once('value');
    const usersData = snapshot.val() || {};
    // Convert users object to array
    const usersList = Object.keys(usersData).map(phone => ({
      phone,
      ...usersData[phone]
    }));
    res.json(usersList);
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    res.status(500).json({ error: '❌ Database error' });
  }
});

/// Login ///
app.post('/login', async (req, res) => {
  const { phone } = req.body;
  try {
    // const pool = await sql.connect(config);
    // const result = await pool
    //   .request()
    //   .input('phone', sql.VarChar, phone)
    //   .query('SELECT * FROM users WHERE phone = @phone');
    //
    // if (result.recordset.length > 0) {
    //   res.json({ success: true, user: result.recordset[0] });
    // } else {
    //   res.json({ success: false, message: '❌ User not found' });
    // }

    const snapshot = await db.ref(`users/${phone}`).once('value');
    if (snapshot.exists()) {
      res.json({ success: true, user: { phone, ...snapshot.val() } });
    } else {
      res.json({ success: false, message: '❌ User not found' });
    }
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    res.status(500).json({ error: '❌ Database error' });
  }
});

/// Get User by Phone ///
app.get('/user/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    // const pool = await sql.connect(config);
    // const result = await pool
    //   .request()
    //   .input('phone', sql.VarChar, phone)
    //   .query('SELECT * FROM users WHERE phone = @phone');
    //
    // if (result.recordset.length > 0) {
    //   res.json({ success: true, user: result.recordset[0] });
    // } else {
    //   res.json({ success: false, message: '❌ User not found' });
    // }

    const snapshot = await db.ref(`users/${phone}`).once('value');
    if (snapshot.exists()) {
      res.json({ success: true, user: { phone, ...snapshot.val() } });
    } else {
      res.json({ success: false, message: '❌ User not found' });
    }
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    res.status(500).json({ error: '❌ Database error' });
  }
});

/// Update User ///
app.post('/user/update', async (req, res) => {
  const { phone, username, email, gender, address, city, ward } = req.body;
  try {
    // const pool = await sql.connect(config);
    // const result = await pool
    //   .request()
    //   .input('username', sql.NVarChar, username)
    //   .input('email', sql.VarChar, email)
    //   .input('phone', sql.VarChar, phone)
    //   .input('gender', sql.NVarChar, gender)
    //   .input('address', sql.NVarChar, address)
    //   .input('city', sql.NVarChar, city)
    //   .input('ward', sql.NVarChar, ward)
    //   .query(`
    //     UPDATE users 
    //     SET username = @username,
    //         email = @email,
    //         gender = @gender,
    //         address = @address,
    //         city = @city,
    //         ward = @ward
    //     WHERE phone = @phone
    //   `);
    //
    // res.json({ success: true, message: '✅ User has successfully updated!' });

    await db.ref(`users/${phone}`).update({
      username,
      email,
      gender,
      address,
      city,
      ward
    });
    res.json({ success: true, message: '✅ User has successfully updated!' });
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    res.status(500).json({ error: '❌ Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));