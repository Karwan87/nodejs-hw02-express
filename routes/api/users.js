const path = require("path");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const config = require("../../config");
const authMiddleware = require("../../auth/authMiddleware");
const gravatar = require("gravatar");
const multer = require("multer");
const Jimp = require("jimp");
const { unlink } = require("fs/promises");
const { promisify } = require("util");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const unlinkAsync = promisify(require("fs").unlink);

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

async function processAvatar(avatarBuffer) {
  const image = await Jimp.read(avatarBuffer);
  image.resize(250, 250);
  return image;
}

const resendEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.details });
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatarURL = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });
    const verificationToken = uuidv4();

    const newUser = new User({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });
    await newUser.save();
    const verificationLink = `${process.env.CLIENT_URL}/users/verify/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "verifytester95@gmail.com",
        pass: "phmx nlhb krop gmvx",
      },
    });
    const mailOptions = {
      from: "verifytester95@gmail.com",
      to: email,
      subject: "Potwierdzenie rejestracji",
      text: `Kliknij ten link, aby potwierdzić rejestrację: ${verificationLink}`,
      html: `<p>Kliknij ten <a href="${verificationLink}">link</a>, aby potwierdzić rejestrację.</p>`,
    };
    const result = await transporter.sendMail(mailOptions);

    console.log("Verification email sent:", result.response);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL,
        verificationToken,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.details });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("User:", user);
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Authentication failed" });
    }
    const userId = user._id;
    console.log("UserID:", userId);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    const avatarURL = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "1h",
    });

    res.status(200).json({
      user: {
        email: user.email,
        subscription: user.subscription,

        avatarURL: avatarURL,
      },
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/logout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    console.log("UserID:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.token = null;
    await user.save();
    res.status(204).send();
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// // path to get actual user's data
router.get("/current", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error during current user request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//avatars endpoint
router.patch(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Avatar file is required" });
      }
      const userEmail = req.user.email;
      const userLogin = userEmail.split("@")[0];
      const uniqueFilename = `${userLogin}-avatar.png`;
      const avatarPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "avatars",
        uniqueFilename
      );
      const processedAvatar = await processAvatar(req.file.buffer);
      const avatarBuffer = await processedAvatar.getBufferAsync(Jimp.MIME_PNG);
      fs.writeFileSync(avatarPath, avatarBuffer);
      if (req.user.avatarURL) {
        const previousAvatarPath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "avatars",
          req.user.avatarURL
        );
        await unlinkAsync(previousAvatarPath);
      }

      req.user.avatarURL = uniqueFilename;
      await req.user.save();
      res.status(200).json({ avatarURL: `/avatars/${uniqueFilename}` });
    } catch (error) {
      console.error("Error during avatar upload:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// verificationToken endpoint
router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.verify = true;
    user.verificationToken = null;
    await user.save();
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("User not found", error);
    res.status(404).json({ message: "User not found" });
  }
});

// resendEmail endpoint
router.post("/verify", async (req, res) => {
  try {
    const { error } = resendEmailSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.details });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await user.save();
    const verificationLink = `${process.env.CLIENT_URL}/users/verify/${verificationToken}`;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "verifytester95@gmail.com",
        pass: "phmx nlhb krop gmvx",
      },
    });
    const mailOptions = {
      from: "verifytester95@gmail.com",
      to: email,
      subject: "Powtórne wysłanie linka do weryfikacji",
      text: `Kliknij ten link, aby potwierdzić rejestrację: ${verificationLink}`,
      html: `<p>Kliknij ten <a href="${verificationLink}">link</a>, aby potwierdzić rejestrację.</p>`,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", result.response);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error during email resend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
