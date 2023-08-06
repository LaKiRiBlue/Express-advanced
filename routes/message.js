import express from "express";

import pool from "../database/poolConnexion.js";
import validateToken from "../helpers/validateToken.js";

const messages = express.Router();

messages.post("/addMessage", validateToken, async (req, res) => {
  const { id_lobby } = req.body;
  const { message } = req.body;
  const  id_user  = req.id;
  // Check if the name is provided in the request body
  if (!id_user) {
    return res.status(400).json({ error: "id_user not provided" });
  }

  // Check if the name is provided in the request body
  if (!id_lobby) {
    return res.status(400).json({ error: "id_lobby not provided" });
  }

  // Check if the name is provided in the request body
  if (!message) {
    return res.status(400).json({ error: "message not provided" });
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

    //Is the user already in the lobby?
    query = await connection.query(
      "SELECT * FROM users_lobby where users_id  = ? and lobby_id = ?",
      [id_user, id_lobby]
    );
    if (query.length != 1) {
      return res
        .status(500)
        .send({
          error: "user : " + id_user + " is not in the lobby " + id_lobby,
        });
    }

    query = await connection.query(
      "insert INTO message (users_id,lobby_id,message) values (?,?,?)",
      [id_user, id_lobby, message]
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }

  console.log("message : " + message + " added to lobby " + id_lobby);
  return res.send("message : " + message + " added to lobby " + id_lobby);
});

messages.patch("/:id/updateMessage", validateToken, async (req, res) => {
  const id_message = req.params.id;
  const { id_user } = req.id;
  const { message } = req.body;

  // Check if the name is provided in the request body
  if (!message) {
    return res.status(400).json({ error: "message not provided" });
  }

  //check if everything is good to update the message
  try {
    const connection = await pool.getConnection();

    //message exists?
    var query = await connection.query(
      "SELECT lobby_id,users_id FROM message where id = ?",
      [id_message]
    );

    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "Message " + id_message + " doesn't exists" });
    }

    const id_writter = query[0].users_id;

    //Lobby exists?
    query = await connection.query("SELECT admin_id FROM lobby where id = ?", [
      query[0].lobby_id,
    ]);
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "lobby " + query[0].lobby_id + " doesn't exists" });
    }

    //Are you the admin or the writer?
    if (query[0].id != id_user && id_writter != id_user) {
      return res
        .status(500)
        .send({
          error:
            "You're not the writer of the message or the admin of the lobby ",
        });
    }

    //Is the user already in the lobby?
    query = await connection.query(
      "Update message set message = ? where id = ?",
      [message, id_message]
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }

  console.log("message : " + id_message + " updated to "+message);
  return res.send("message : " + id_message + " updated to "+message);
});

messages.delete("/:id/removeMessage", validateToken, async (req, res) => {
  const id_message = req.params.id;
  const { id_user } = req.id;

  //check if everything is good to delete the message
  try {
    const connection = await pool.getConnection();

    //message exists?
    var query = await connection.query(
      "SELECT lobby_id,users_id FROM message where id = ?",
      [id_message]
    );

    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "Message " + id_message + " doesn't exists" });
    }

    const id_writter = query[0].users_id;

    //Lobby exists?
    query = await connection.query("SELECT admin_id FROM lobby where id = ?", [
      query[0].lobby_id,
    ]);
    if (query.length == 0) {
      return res
        .status(500)
        .send({ error: "lobby " + query[0].lobby_id + " doesn't exists" });
    }

    //Are you the admin or the writer?
    if (query[0].id != id_user && id_writter != id_user) {
      return res
        .status(500)
        .send({
          error:
            "You're not the writer of the message or the admin of the lobby ",
        });
    }

    //Is the user already in the lobby?
    query = await connection.query("DELETE FROM message where id = ?", [
      id_message,
    ]);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }

  console.log("message : " + id_message + " removed ");
  return res.send("message : " + id_message + " removed ");
});

messages.get("/", validateToken, async (req, res) => {
  const  id_user  = req.id;

  try {
    const connection = await pool.getConnection();
    var query = await connection.query(
      'SELECT a.name "name_loby", b.id "id_message", b.message, d.nickname '
      +'FROM lobby a, message b, users_lobby c, users d '
      +'WHERE a.id = b.lobby_id and b.lobby_id = c.lobby_id and c.users_id = ? and c.users_id = d.id ORDER BY 1',
      id_user
    );
    return res.send(query);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }
});

export default messages;
