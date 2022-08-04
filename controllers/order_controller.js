const asyncHandler = require("express-async-handler");
const { count } = require("../models/order_model.js");
const Order = require("../models/order_model.js");
const User = require("../models/user_model.js");
const moment = require('moment')

function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

// @desc    Add new order
// @route   POST /api/order
// @access  Protected
const order = asyncHandler(async (req, res) => {
  const { amount, id, operataor, topup_no } = req.body;

  const finduser = await User.findById(id);

  if (!finduser) {
    res.status(400);
    throw new Error("Invalid User");
  }

  if (finduser.amount < amount) {
    res.status(400);
    throw new Error("Transaction amount in greater than your balance...");
  }

  if (amount < 50) {
    res.status(400);
    throw new Error("Transaction should be greater than 50...");
  }
  if (amount > 20000) {
    res.status(400);
    throw new Error("Transaction should be smaller than 20,001...");
  }

  let dateObj = new Date();

  let currentDateTime = dateObj.toLocaleString("en-GB",{ timeZone: 'UTC' });
  const currentDay = currentDateTime.substring(0,2)
  const currentMonth = currentDateTime.substring(3,5)
  const currentYear = currentDateTime.substring(6,10)
  const hour = currentDateTime.substring(12,14)
  const min = currentDateTime.substring(15,17)
  const sec = currentDateTime.substring(18,20)

  const today = moment(`${currentMonth}-${currentDay}-${currentYear} ${hour}:${min}:${sec} +0000`, "MM-DD-YYYY hh:mm:ss Z");
  var time = moment.duration("00:05:00");
  today.subtract(time)
  
  const findpendingOrders = await Order.find({
    action: "pending",
    user: finduser,
    topup_no: topup_no,
    createdAt: {
      $gte: today.toDate(),
      $lte: moment(today).endOf('day').toDate()
    }
  });

  console.log(findpendingOrders)

  if(findpendingOrders.length != 0 && findpendingOrders != null){
    res.status(400);
    throw new Error("You can not reload on this number before 5 minutes");
  }

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  date = year + "-" + month + "-" + day;

  // Create order
  const order = await Order.create({
    amount,
    operataor,
    topup_no,
    user: finduser,
    date: date,
  });

  if (order) {
    finduser.amount -= amount;
    finduser.save();

    res.status(201).json({
      operataor: order.operataor,
      amount: order.amount,
      topup_no: order.topup_no,
      action: order.action,
      status: "success",
    });
  } else {
    res.status(400);
    throw new Error("Inavlid Order");
  }
});

// @desc    Get order history
// @route   GET /api/getorderhistorty
// @access  protect
const getOrderHistory = asyncHandler(async (req, res) => {
  const orderHistory = await Order.find({
    action: { $ne: "pending" },
  }).populate("user");
  res.status(200).json(orderHistory);
});

// @desc    Get order history
// @route   GET /api/getpendingorderhistorty
// @access  protect
const getPendingOrderHistory = asyncHandler(async (req, res) => {
  const pendingOrderHistory = await Order.find({ action: "pending" }).populate(
    "user"
  );
  res.status(200).json(pendingOrderHistory);
});

// @desc    Get single user order history
// @route   GET /api/getorderhistorty/:id
// @access  protect
const getUserOrderHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const orderHistory = await Order.find({
    user: user._id,
  }).populate("user");

  res.status(200).json(orderHistory);
});

// @desc Get total number of order/user/credit/debit
// @route GET /api/gettotalorder
// @access protect
const getTotalOrder = asyncHandler(async (req, res) => {
  //desc  total number of order
  const totalorder = await Order.count({ action: "approve" });

  // @desc  total user
  const user = await User.count({ role: "distributor" });

  //@desc   total credit
  let credit;
  let creditData = 0;
  if (totalorder > 0) {
    console.log("hello");
    credit = await Order.aggregate([
      {
        $match: {
          action: "approve",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    creditData = credit[0]["totalAmount"];
  }

  //@desc   total debit
  const debit = await User.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  //@desc finding today date
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  date = year + "-" + month + "-" + day;
  console.log(date);
  //@desc total number of per day order
  var totalOrderPerDay = await Order.count({ date: date, action: "approve" });

  //@desc   total credit per day
  let totalCreditPerDay;
  let data = 0;
  if (totalOrderPerDay > 0) {
    totalCreditPerDay = await Order.aggregate([
      {
        $match: {
          date: date,
          action: "approve",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    data = totalCreditPerDay[0]["totalAmount"];
  }

  res.status(200).json({
    totalOrderPerDay,
    totalCreditPerDay: data,
    totalorder,
    debit: debit[0]["totalAmount"],
    user,
    credit: creditData,
  });
});

// @desc    Get date wise order
// @route   GET /api/getdayorder
// @access  protect
const getDayOrder = asyncHandler(async (req, res) => {
  // const order = await Order.aggregate([
  //   {
  //     $group: {
  //       _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
  //       count: { $sum: 1 },
  //     },
  //   },
  // ]);

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  date = year + "-" + month + "-" + day;
  var order = await Order.count({ date: date, action: "approve" });
  //@desc find yesterday date
  var date1 = new Date().getTime();
  var yesterdayTimeStamp = date1 - 24 * 60 * 60 * 1000;
  date1 = new Date(yesterdayTimeStamp);
  var date1year = date1.getFullYear();
  var date1month = date1.getMonth() + 1;
  var date1day = date1.getDate();
  if (date1month < 10) {
    date1month = "0" + date1month;
  }
  if (date1day < 10) {
    date1day = "0" + date1day;
  }
  date1 = date1year + "-" + date1month + "-" + date1day;
  var order1 = await Order.count({ date: date1, action: "approve" });

  //@desc find 2days before present
  var date2 = new Date().getTime();
  var Day2TimeStamp = date2 - 2 * 24 * 60 * 60 * 1000;
  date2 = new Date(Day2TimeStamp);
  var date2year = date2.getFullYear();
  var date2month = date2.getMonth() + 1;
  var date2day = date2.getDate();
  if (date2month < 10) {
    date2month = "0" + date2month;
  }
  if (date2day < 10) {
    date2day = "0" + date2day;
  }
  date2 = date2year + "-" + date2month + "-" + date2day;
  var order2 = await Order.count({ date: date2, action: "approve" });

  //@desc find 3days before present
  var date3 = new Date().getTime();
  var Day3TimeStamp = date3 - 3 * 24 * 60 * 60 * 1000;
  date3 = new Date(Day3TimeStamp);
  var date3year = date3.getFullYear();
  var date3month = date3.getMonth() + 1;
  var date3day = date3.getDate();
  if (date3month < 10) {
    date3month = "0" + date3month;
  }
  if (date3day < 10) {
    date3day = "0" + date3day;
  }
  date3 = date3year + "-" + date3month + "-" + date3day;
  var order3 = await Order.count({ date: date3, action: "approve" });

  //@desc find 4days before present
  var date4 = new Date().getTime();
  var Day4TimeStamp = date4 - 4 * 24 * 60 * 60 * 1000;
  date4 = new Date(Day4TimeStamp);
  var date4year = date4.getFullYear();
  var date4month = date4.getMonth() + 1;
  var date4day = date4.getDate();
  if (date4month < 10) {
    date4month = "0" + date4month;
  }
  if (date4day < 10) {
    date4day = "0" + date4day;
  }
  date4 = date4year + "-" + date4month + "-" + date4day;
  var order4 = await Order.count({ date: date4, action: "approve" });

  //@desc find 5days before present
  var date5 = new Date().getTime();
  var Day5TimeStamp = date5 - 5 * 24 * 60 * 60 * 1000;
  date5 = new Date(Day5TimeStamp);
  var date5year = date5.getFullYear();
  var date5month = date5.getMonth() + 1;
  var date5day = date5.getDate();
  if (date5month < 10) {
    date5month = "0" + date5month;
  }
  if (date5day < 10) {
    date5day = "0" + date5day;
  }
  date5 = date5year + "-" + date5month + "-" + date5day;
  var order5 = await Order.count({ date: date5, action: "approve" });

  //@desc find 6days before present
  var date6 = new Date().getTime();
  var Day6TimeStamp = date6 - 6 * 24 * 60 * 60 * 1000;
  date6 = new Date(Day6TimeStamp);
  var date6year = date6.getFullYear();
  var date6month = date6.getMonth() + 1;
  var date6day = date6.getDate();
  if (date6month < 10) {
    date6month = "0" + date6month;
  }
  if (date6day < 10) {
    date6day = "0" + date6day;
  }
  date6 = date6year + "-" + date6month + "-" + date6day;
  var order6 = await Order.count({ date: date6, action: "approve" });

  let weekOrder = [
    { date: date, orders: order },
    { date: date1, orders: order1 },
    { date: date2, orders: order2 },
    { date: date3, orders: order3 },
    { date: date4, orders: order4 },
    { date: date5, orders: order5 },
    { date: date6, orders: order6 },
  ];

  res.status(200).json(weekOrder);
});

// @desc    Update order action
// @route   PUT /api/updateorderaction/:id
// @access  protect
const updateOrderAction = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, {
    action: action,
  });

  if (action != "approve") {
    const finduser = await Order.findById(req.params.id).populate("user");
    const amount = finduser.user.amount;

    const userAmount = await User.findByIdAndUpdate(finduser.user._id, {
      amount: amount + order.amount,
    });
  }  

  res.status(200).json(order);
});

module.exports = {
  updateOrderAction,
  order,
  getOrderHistory,
  getUserOrderHistory,
  getTotalOrder,
  getDayOrder,
  getPendingOrderHistory,
};
