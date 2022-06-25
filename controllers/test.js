// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const {
      username,
      contact,
      password,
      country,
      // role,
      user_id,
      id,
      state,
      displayname,
    } = req.body;
    if ((!username, !contact, !password, !country, !state, !displayname)) {
      res.status(400);
      throw new Error("Please add all fields");
    }
    const finduser = await User.find({ user_id });
    console.log(finduser);
    if (!finduser) {
      res.status(400);
      throw new Error("user not found");
    }
  
    const userInfo = await User.findOne({ id });
    console.log(userInfo.role);
  
    // Check if user exists
    const userExists = await User.findOne({ username });
  
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // @desc fingind last inserted document
  
    // const userbyid = await User.findOne({}, {}, { sort: { created_at: -1 } });
    const userbyid = await User.findOne({}, {}, { sort: { user_id: -1 } });
    const userId = +userbyid.user_id + 1;
    console.log(userId);
  
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
  
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        contact: user.contact,
        country: user.country,
        role: user.role,
        state: user.state,
        // user: user.user,
        user_id: user.user_id,
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