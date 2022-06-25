const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/user_model.js");
const Order = require("../models/order_model.js");

// @desc    Update user amount
// @route   PUT /api/updateusermaount/:id
// @access  protect
const updateUserAmount = asyncHandler(async (req, res) => {
  const { role, amount } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, {
    $inc: { amount: +amount },
  });
  res.status(200).json(user);
});

// @desc    Update user password
// @route   PUT /api/updateuserpassword/:id
// @access  protect
const updateUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findByIdAndUpdate(req.params.id, {
    password: hashedPassword,
  });
  res.status(200).json(user);
});

// @desc    Update username and  password
// @route   PUT /api/updateusernameandpassword/:id
// @access  protect
const updateUsernamePassword = asyncHandler(async (req, res) => {
  const { password, username } = req.body;
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  if (username === "") {
    const user = await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
    });
    res.status(200).json(user);
  } else if (password === "") {
    const user = await User.findByIdAndUpdate(req.params.id, {
      username: username,
    });
    res.status(200).json(user);
  } else {
    const user = await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
      username: username,
    });
    res.status(200).json({ status: "success" });
  }
});

// @desc    Change user Amount
// @route   PUT /api/changeuseramount/:id
// @access  protect
const changeUserAmount = asyncHandler(async (req, res) => {
  const { amount, role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, {
    amount: amount,
  });
  res.status(200).json(user);
});

// @desc    Get user
// @route   GET /api/getuser
// @access  protect
const getUser = asyncHandler(async (req, res) => {
  const user = await User.find({ role: "distributor" });

  res.status(200).json(user);
});

// @desc    Get single user
// @route   GET /api/getsingleuser/:id
// @access  protect
const getSingleUser = asyncHandler(async (req, res) => {
  // const user = await User.findById(req.params.id);
  const user = await User.find({ role: "distributor", _id: req.params.id });
  if (!user) {
    res.status(400);
    throw new Error(`User not found`);
  }
  res.status(200).json(user);
});

// @desc    Get single user current balance, total order and total spend
// @route   GET /api/getsingleuserinfo/:id
// @access  protect
const getSingleUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log(user);
  if (!user) {
    res.status(400);
    throw new Error(`User not found`);
  }
  //desc  total number of order
  const totalorder = await Order.count({
    action: "approve",
    user,
  });

  // @desc currentBalance
  const currentBalance = user.amount;

  //@desc   total credit
  const credit = await Order.aggregate([
    {
      $match: {
        action: "approve",
        user: user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  res.status(200).json({
    totalorder,
    currentBalance,
    credit: credit[0]["totalAmount"],
    // debit,
  });
});

// @desc    Get sub user
// @route   GET /api/getsubuser/:id
// @access  protect
const getSubUser = asyncHandler(async (req, res) => {
  const user = await User.find({ role: "retailer", _id: req.params.id });
  res.status(200).json(user);
});

// @desc    Delete User
// @route   DELETE /api/deleteuser/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const finduser = await User.findById(req.params.id);

  if (!finduser) {
    res.status(400);
    throw new Error("User not found");
  }

  await finduser.remove();

  res.status(200).json({ id: req.params.id, status: "success" });
});

// @desc    find user wise subuser
// @route   GET /api/userwisesubuser/:id
// @access  Private
const userWiseSubuser = asyncHandler(async (req, res) => {
  const finduser = await User.findById(req.params.id);
  const subuser = await User.find({ user: finduser });

  if (!finduser) {
    res.status(400);
    throw new Error("User not found");
  }

  res.status(200).json({ subuser, status: "success" });
});

module.exports = {
  updateUserAmount,
  updateUserPassword,
  getUser,
  getSingleUser,
  getSubUser,
  deleteUser,
  changeUserAmount,
  updateUsernamePassword,
  getSingleUserInfo,
  userWiseSubuser,
};
