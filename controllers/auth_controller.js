const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/user_model.js");
const { generateAccessToken } = require("../functions/generate_tokens.js");

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check for register user name
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = generateAccessToken(user._id);

    res.json({
      _id: user.id,
      user_id: user.user_id,
      username: user.username,
      contact: user.contact,
      amount: user.amount,
      state: user.state,
      country: user.country,
      role: user.role,
      token: accessToken,
      displayname: user.displayname,
      status: "success",
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, contact, password, country, role, state, displayname, id } =
    req.body;
  if ((!username, !contact, !password, !country, !role, !state, !displayname)) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  // var finduser = await User.find({ user_id });

  // if (!finduser) {
  //   res.status(400);
  //   throw new Error("user not found");
  // }

  // Check if user exists
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // find login user role
  console.log(id);
  const userInfo = await User.findById(id);
  console.log(userInfo.role);

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // @desc fingind last inserted document
  const userbyid = await User.findOne({}, {}, { sort: { createdAt: -1 } });
  const userId = +userbyid.user_id + 1;
  console.log(userId);

  // create new user
  let user;
  if (userInfo.role == "distributor") {
    user = await User.create({
      username,
      contact,
      country,
      role: "retailer",
      state,
      displayname,
      user: userInfo,
      user_id: userId,
      password: hashedPassword,
    });
  } else {
    user = await User.create({
      username,
      contact,
      country,
      state,
      displayname,
      user_id: userId,
      password: hashedPassword,
    });
  }

  // const user = await User.create({
  //   username,
  //   contact,
  //   country,
  //   role,
  //   state,
  //   displayname,
  //   user_id: userId,
  //   password: hashedPassword,
  // });

  if (user) {
    res.status(201).json({
      _id: user.id,
      username: user.username,
      contact: user.contact,
      country: user.country,
      role: user.role,
      user_id: user.user_id,
      state: user.state,
      displayname: user.displayname,
      token: generateAccessToken(user._id),
      status: "success",
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

module.exports = {
  login,
  register,
};
