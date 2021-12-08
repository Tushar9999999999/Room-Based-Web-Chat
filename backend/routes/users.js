//Using express to create new endpoints in the backend server
const router = require("express").Router();
//importing the schema
const User = require("../model/userModel");
//for hashing the password
const bcrypt = require("bcryptjs");
//jsonwebtoken attaches the header and the payload of the token, created from bcrypt, with a secret string
const jwt = require("jsonwebtoken");
//auth is put into a function where authorization is required
const auth = require("../middleware/auth");

router.get("/register", (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});
//async for validation
router.post("/register", async (req, res) => {
  //validation
  if (!req.body.name || !req.body.password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  if (req.body.name.length > 15) {
    return res.status(400).json({ msg: "Name length is 15 characters MAX" });
  }
  //Since we check private chat based on room === name, no user can have room name
  if (req.body.name === "A" || req.body.name === "B" 
  || req.body.name === "C" || req.body.name === "General Chat") {
    return res.status(400).json({ msg: "Sorry but that's a reserved word" });
  }
  const user = await User.findOne({ name: req.body.name });
  if (user) {
    return res.status(400).json({ msg: "User already exists" });
  }

  //hashing code from the documentation
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      // Store hash in your password DB.
      const newUser = new User({
        name: req.body.name,
        password: hash, //this will be put into database
      });
      newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json("Error: " + err));
    });
  });
});
//Profile is protected by auth
router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    id: user._id,
    name: user.name,
    date: user.date,
  });
});
router.delete("/profile", auth, (req, res) => {
  User.findByIdAndDelete(req.user._id)
    .then(() => res.json("User deleted"))
    .catch((err) => res.status(400).json("Error: " + err));
});
router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json("User deleted"))
    .catch((err) => res.status(400).json("Error: " + err));
});
router.get("/login", (req, res) => {
  res.send("GET Login");
});
//async function cause of await
router.post("/login", async (req, res) => {
  //validation
  if (!req.body.name || !req.body.password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  //Find the user with the given name from the frontend
  const user = await User.findOne({ name: req.body.name });
  if (!user) {
    return res.status(400).json({ msg: "User doesnt exist" });
  }

  //1st- Password given by use, 2nd- Password in database
  bcrypt.compare(req.body.password, user.password, function (err, response) {
    if (!response) {
      return res.status(400).send({ msg: "Authentication Error" });
    } else {
      //Encoding the token with the user id and the secret string 
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.json({
        token: token,
        user: {
          id: user._id,
          name: user.name,
          date: user.date,
        },
      });
    }
  });
});
router.post("/tokenIsValid", async (req, res) => {
  try {
    //if there is no token
    const token = req.header("auth-token");
    if (!token) {
      return res.json("false");
    }

    //if it is not verified
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.json("false");
    }

    //if user does not exist
    const user = await User.findById(verified._id);
    if (!user) {
      return res.json("false");
    }

    //else true
    return res.json(true);
  } catch {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;