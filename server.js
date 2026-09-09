const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const sql = require('mssql/msnodesqlv8');
// const config = {
//   connectionString:
//     'Driver={ODBC Driver 17 for SQL Server};Server={DESKTOP-WINNIE\\SQLEXPRESS};Database={mlts-dqk};Trusted_Connection=Yes;'
// };

var admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    };
  } catch (err) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', err);
  };
} else {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.warn('⚠️ serviceAccountKey.json not found, and FIREBASE_SERVICE_ACCOUNT env var is empty.');
  };
};

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://individual-projects-2208-default-rtdb.asia-southeast1.firebasedatabase.app'
  });
} else {
  console.error('❌ Firebase could not be initialized: No credentials provided.');
};

const app = express();
app.use(express.json());
app.use(cors());

const database = admin.database();

// Get data from table 'users'

app.get('/user', async (req, res) => {
  try {
    // const pool = await sql.connect(config);
    // const result = await pool.request().query('SELECT * FROM users');
    // res.json(result.recordset);

    const snapshot = await database.ref('users').once('value');
    const usersData = snapshot.val() || {};
    
    const usersList = Object.keys(usersData).map(phone => ({  // Convert users object to array
      phone,
      ...usersData[phone],
    }));
    
    res.json(usersList);
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    
    res.status(500).json({error: '❌ Database error'});
  };
});

// Login

app.post('/login', async (req, res) => {
  const {phone} = req.body;
  
  try {
    // const pool = await sql.connect(config);
    // 
    // const result = await pool
    //   .request()
    //   .input('phone', sql.VarChar, phone)
    //   .query('SELECT * FROM users WHERE phone = @phone');
    //
    // if (result.recordset.length > 0) {
    //   res.json({success: true, user: result.recordset[0]});
    // } else {
    //   res.json({success: false, message: '❌ User not found'});
    // };

    const snapshot = await database.ref(`users/${phone}`).once('value');
    
    if (snapshot.exists()) {
      res.json({success: true, user: {phone, ...snapshot.val()}});
    } else {
      res.json({success: false, message: '❌ User not found'});
    };
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    
    res.status(500).json({error: '❌ Database error'});
  };
});

// Get a user by phone-number

app.get('/user/:phone', async (req, res) => {
  const {phone} = req.params;
  
  try {
    // const pool = await sql.connect(config);
    // 
    // const result = await pool
    //   .request()
    //   .input('phone', sql.VarChar, phone)
    //   .query('SELECT * FROM users WHERE phone = @phone');
    //
    // if (result.recordset.length > 0) {
    //   res.json({success: true, user: result.recordset[0]});
    // } else {
    //   res.json({success: false, message: '❌ User not found'});
    // };

    const snapshot = await database.ref(`users/${phone}`).once('value');
    
    if (snapshot.exists()) {
      res.json({success: true, user: {phone, ...snapshot.val()}});
    } else {
      res.json({success: false, message: '❌ User not found'});
    };
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    
    res.status(500).json({error: '❌ Database error'});
  };
});

// Update user info
app.post('/user/update', async (req, res) => {
  const {phone, username, email, gender, address, city, ward} = req.body;
  
  try {
    // const pool = await sql.connect(config);
    // 
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
    //     
    //     SET username = @username,
    //         email = @email,
    //         gender = @gender,
    //         address = @address,
    //         city = @city,
    //         ward = @ward
    //     
    //     WHERE phone = @phone
    //   `);
    //
    // res.json({success: true, message: '✅ User has successfully updated!'});

    await database.ref(`users/${phone}`).update({
      username,
      email,
      gender,
      address,
      city,
      ward
    });
    
    res.json({success: true, message: '✅ User has successfully updated!'});
  } catch (err) {
    console.error('❌ Firebase Error: ', err);
    
    res.status(500).json({error: '❌ Database error'});
  };
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));