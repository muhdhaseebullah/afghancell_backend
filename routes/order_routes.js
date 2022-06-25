const express = require("express");
const {
  order,
  getOrderHistory,
  getUserOrderHistory,
  getTotalOrder,
  getDayOrder,
  updateOrderAction,
  getPendingOrderHistory,
} = require("../controllers/order_controller.js");
const protect = require("../middlewares/auth_middleware.js");

const router = express.Router();

router.post("/order", protect, order);
router.get("/getorderhistorty", protect, getOrderHistory);
router.get("/getpendingorderhistorty", protect, getPendingOrderHistory);
router.get("/gettotalorder", protect, getTotalOrder);
router.get("/getdayorder", protect, getDayOrder);
router.get("/getorderhistorty/:id", protect, getUserOrderHistory);
router.get("/gettotalorder", protect, getTotalOrder);
router.get("/getdayorder", protect, getDayOrder);
router.put("/updateorderaction/:id", protect, updateOrderAction);

module.exports = router;
