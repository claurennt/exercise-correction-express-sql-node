require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./database/client.js");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello world");
});

app
  .route("/api/users")
  .get(async (req, res) => {
    try {
      const { rows } = await db.query("SELECT * from users;");
      return res.status(200).send(rows);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong");
    }
  })
  .post(async (req, res) => {
    const { first_name, last_name, age, active } = req.body;

    const { rows } = await db.query(
      "INSERT INTO users (first_name, last_name, age,active)  VALUES ($1,$2,$3,$4) RETURNING *",
      [first_name, last_name, age, active]
    );
    return res.status(201).send(rows);
  });

app
  .route("/api/users/:id")
  .get(async (req, res) => {
    const { id } = req.params;
    try {
      const { rows, rowCount } = await db.query(
        "SELECT * from users where id=$1",
        [id]
      );
      if (!rowCount)
        return res.status(404).send(`The user with id ${id} does not exist`);
      return res.status(200).send(rows);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong");
    }
  })
  .put(async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, age, active } = req.body;

    if (!first_name || !last_name || !age)
      return res.status(400).send("The request body must have values");
    try {
      const {
        rows: [updatedUser],
        rowCount,
      } = await db.query(
        "UPDATE users SET first_name=$1, last_name=$2, age=$3 WHERE id=$4 RETURNING *",
        [first_name, last_name, age, id]
      );

      if (!rowCount)
        return res.status(404).send(`The user with id ${id} does not exist`);
      return res.status(200).send(updatedUser);
    } catch (err) {
      return res.status(500).send("Something went wrong");
    }
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    try {
      const {
        rows: [deletedUser],
        rowCount,
      } = await db.query("DELETE FROM users WHERE id=$1 RETURNING *", [id]);

      if (!rowCount)
        //rowCount === 0
        return res.status(404).send(`The user with id ${id} does not exist`);
      return res.status(200).send(deletedUser);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Somthing went wrong");
    }
  });

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
