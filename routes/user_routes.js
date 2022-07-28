const express = require("express");
const {
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
  userRecharge,
  userWiseSubuserRecharge,
} = require("../controllers/user_controller.js");
const protect = require("../middlewares/auth_middleware.js");

const router = express.Router();

router.put("/updateusermaount/:id", protect, updateUserAmount);
router.put("/changeuseramount/:id", protect, changeUserAmount);
router.put("/updateuserpassword/:id", protect, updateUserPassword);
router.put("/updateusernameandpassword/:id", protect, updateUsernamePassword);
router.get("/getuser", protect, getUser);
router.get("/userwisesubuser/:id", protect, userWiseSubuser);
router.get("/getsingleuser/:id", protect, getSingleUser);
router.get("/getsubuser/:id", protect, getSubUser);
router.get("/getsingleuserinfo/:id", getSingleUserInfo);
router.put("/userrecharge/:id", userRecharge);
router.delete("/deleteuser/:id", protect, deleteUser);
router.get("/userwisesubuserrecharge/:id", protect, userWiseSubuserRecharge);

module.exports = router;
