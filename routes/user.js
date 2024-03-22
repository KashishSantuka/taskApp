const express = require("express");
const multer = require("multer");
const sharp = require('sharp');
const auth = require("../middleware/auth.js");
const router = express.Router();
const User = require("../models/user.js");

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    console.log(req.user._id);
    await req.user.save();

    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: e.message,
    });
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    req.user.save();
    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: e.message,
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).send({ user });
  } catch (e) {
    res.status(401).send({
      error: e.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const alllowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    alllowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(404).send({
      error: "Invalid updates!",
    });
  }

  try {
    //const user = await User.findById(req.params.id);

    updates.forEach((update) => (req.user[updates] = req.body[updates]));

    await req.user.save();

    if (!req.user) {
      return res.status(400).send();
    }

    res.send(req.user);
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

router.delete("/me", auth, async (req, res) => {
  console.log(req.user);
  console.log(req.user._id);
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    res.send(user);
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send(error.message);
  }
);

router.delete("/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send()
})

router.get("/:id/avatar", async (req, res) => {
  try {
     const user = await User.findById(req.params.id);
     console.log(user)

     if(!user || !user.avatar){
      throw new Error()
     }

     res.set('Content-Type','image/jpg')
     res.send(user.avatar)
  } catch (e) {
     res.status(404).send({
      error: e.message
     })
  }
})

module.exports = router;
