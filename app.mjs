import express from 'express';
import  pool  from './database/poolConnexion.js';
//const mysql = require('mariadb');


// Function to create the tables if it doesn't exist
async function createTables() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(60) NOT NULL,
          nickname VARCHAR(100) NOT NULL
        )
      `);
    } catch (error) {
      console.error('Error creating users table:', error);
    } finally {
      connection.release();
    }

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lobby (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
      admin_id INT ,  
      CONSTRAINT fk_admin_lobby
        FOREIGN KEY (admin_id) REFERENCES users (id)
      )
    `);
  } catch (error) {
    console.error('Error creating lobby table:', error);
  } finally {
    connection.release();
  }

  try {
    await connection.query(`
    CREATE TABLE IF NOT EXISTS  users_lobby (
      id INT AUTO_INCREMENT PRIMARY KEY,
      users_id INT ,  
      lobby_id INT ,
      CONSTRAINT fk_users_users_lobby
        FOREIGN KEY (users_id) REFERENCES users (id),
      CONSTRAINT fk_lobby_users_lobby
        FOREIGN KEY (lobby_id) REFERENCES lobby (id)
    )`
    );
  } catch (error) {
    console.error('Error creating users_lobby table:', error);
  } finally {
    connection.release();
  }
  
    try {
    await connection.query(`
    CREATE TABLE IF NOT EXISTS  message (
      id INT AUTO_INCREMENT PRIMARY KEY,
      users_id INT ,  
      lobby_id INT ,
	  message VARCHAR(255) NOT NULL,
      CONSTRAINT fk_users_messages
        FOREIGN KEY (users_id) REFERENCES users (id),
      CONSTRAINT fk_lobby_messages
        FOREIGN KEY (lobby_id) REFERENCES lobby (id)
    )`
    );
  } catch (error) {
    console.error('Error creating message table:', error);
  } finally {
    connection.release();
  }
}


const app = express();


// Use the json middleware to parse the request body
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


createTables();

import verify  from './routes/verifyStatus.js';
app.use("/", verify);


import users  from './routes/users.js';
app.use("/users", users);

import lobbies  from './routes/lobby.js';
app.use("/lobbies", lobbies);

import message  from './routes/message.js';
app.use("/message", message);

