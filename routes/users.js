import express from "express";
import pool from "../database/poolConnexion.js";
import jwt from "jsonwebtoken";

const users = express.Router();

users.post("/register", async (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const { nickname } = req.body;

  // Check if the email is provided in the request body
  if (!email) {
    return res.status(400).json({ error: "Email not provided" });
  }

  // Check if the password is provided in the request body
  if (!password) {
    return res.status(400).json({ error: "password not provided" });
  }

  // Check if the nickname is provided in the request body
  if (!nickname) {
    return res.status(400).json({ error: "nickname not provided" });
  }
  try {
    const connection = await pool.getConnection();
    var query = await connection.query(
      "insert INTO users (email,password,nickname) values (?,?,?)",
      [email, password, nickname]
    );

    console.log("query is " + query + "   : end");
    return res.send("user added : " + email);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }
});

users.post("/login", async (req, res) => {
  //email(1)
  //password(2)
  const { email } = req.body;
  const { password } = req.body;
  // Check if the email is provided in the request body
  if (!email) {
    return res.status(400).json({ error: "Email not provided" });
  }

  // Check if the password is provided in the request body
  if (!password) {
    return res.status(400).json({ error: "password not provided" });
  }

  // Select id from users where email = email(1) and password = password(2)

  const connection = await pool.getConnection();
  var query = await connection.query(
    "SELECT id FROM users " + "WHERE email = ? " + "AND password = ? ",
    [email, password]
  );

  // query.lenght is not 1 --> error user or password invalid.

  if (query.length != 1) {
    return res.status(400).json({ error: "Email or password not good" });
  }
  // if query.lenght == 1 --> return token with query[0].id as variable.

  const token = jwt.sign({ id: query[0].id }, "secretKey", {
    expiresIn: "365d", // expires in 365 days
  });
  res.json({ token });
});

users.get("/", async (req, res) => {
  const connection = await pool.getConnection();
  var query = await connection.query("SELECT * FROM users ");
  return res.send(query);
});

export default users;
