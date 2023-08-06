import express from "express";

import pool from "../database/poolConnexion.js";
import validateToken from "../helpers/validateToken.js";

const lobbies = express.Router();

lobbies.post("/add", validateToken, async (req, res) => {
  const { name } = req.body;
  // Check if the name is provided in the request body
  if (!name) {
    return res.status(400).json({ error: "name not provided" });
  }

  try {
    const connection = await pool.getConnection();
    var query = await connection.query(
      "insert INTO lobby (name,admin_id) values (?,?)",
      [name, req.id]
    );
    console.log("lobby added : " + name + " With " + req.id + " has admin");
    return res.send("lobby added : " + name + " With " + req.id + " has admin");
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }
});

lobbies.post("/:id/addUser", validateToken, async (req, res) => {
  const id_lobby = req.params.id;
  const { id_user } = req.body;
  // Check if the name is provided in the request body
  if (!id_user) {
    return res.status(400).json({ error: "id_user not provided" });
  }

  //check if everything is good to add the users
  try {
    const connection = await pool.getConnection();

    //User exists?
    var query = await connection.query("SELECT * FROM users where id = ?", [
      id_user,
    ]);
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "User " + id_user + " doesn't exists" });
    }

    //Lobby exists?
    query = await connection.query("SELECT admin_id FROM lobby where id = ?", [
      id_lobby,
    ]);
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "lobby " + id_lobby + " doesn't exists" });
    }

    //Are you the admin?
    if (query[0].admin_id != req.id) {
      return res
        .status(500)
        .send({ error: "You're not the admin of lobby " + id_lobby });
    }

    //Is the user already in the lobby?
    query = await connection.query(
      "SELECT * FROM users_lobby where users_id  = ? and lobby_id = ?",
      [id_user, id_lobby]
    );
    if (query.length == 1) {
      return res
        .status(500)
        .send({
          error: "user : " + id_user + " is already in lobby " + id_lobby,
        });
    }

    query = await connection.query(
      "insert INTO users_lobby (users_id,lobby_id) values (?,?)",
      [id_user, id_lobby]
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }

  console.log("User : " + id_user + " added to lobby " + id_lobby);
  return res.send("User : " + id_user + " added to lobby " + id_lobby);
});

lobbies.delete("/:id/removeUser", validateToken, async (req, res) => {
  const id_lobby = req.params.id;
  const { id_user } = req.body;
  // Check if the name is provided in the request body
  if (!id_user) {
    return res.status(400).json({ error: "id_user not provided" });
  }

  //check if everything is good to add the users
  try {
    const connection = await pool.getConnection();

    //User exists?
    var query = await connection.query("SELECT * FROM users where id = ?", [
      id_user,
    ]);
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "User " + id_user + " doesn't exists" });
    }

    //Lobby exists?
    query = await connection.query("SELECT admin_id FROM lobby where id = ?", [
      id_lobby,
    ]);
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "lobby " + id_lobby + " doesn't exists" });
    }

    //Are you the admin?
    if (query[0].admin_id != req.id) {
      return res
        .status(500)
        .send({ error: "You're not the admin of lobby " + id_lobby });
    }

    //Is the user already in the lobby?
    query = await connection.query(
      "SELECT * FROM users_lobby where users_id  = ? and lobby_id = ?",
      [id_user, id_lobby]
    );
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "user : " + id_user + " is not in lobby " + id_lobby });
    }

    query = await connection.query(
      "delete FROM users_lobby where users_id  = ? and lobby_id = ?",
      [id_user, id_lobby]
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }

  console.log("User : " + id_user + " removed from lobby " + id_lobby);
  return res.send("User : " + id_user + " removed from lobby " + id_lobby);
});

lobbies.get("/:id/listUser", validateToken, async (req, res) => {
  const id_lobby = req.params.id;

  //check if everything is good to add the users
  try {
    const connection = await pool.getConnection();

    //Lobby exists?
    var query = await connection.query(
      "SELECT admin_id FROM lobby where id = ?",
      [id_lobby]
    );
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "lobby " + id_lobby + " doesn't exists" });
    }

    //Are you the admin?
    if (query[0].admin_id != req.id) {
      return res
        .status(500)
        .send({ error: "You're not the admin of lobby " + id_lobby });
    }

    query = await connection.query(
      "SELECT a.nickname FROM users a, users_lobby b WHERE a.id = b.users_id AND b.lobby_id = ?",
      id_lobby
    );

    return res.send(query);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }
});

lobbies.get("/", validateToken, async (req, res) => {
  const connection = await pool.getConnection();
  var query = await connection.query("SELECT * FROM lobby");
  return res.send(query);
});

export default lobbies;
