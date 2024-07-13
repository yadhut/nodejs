const express = require("express");
const { createUser, userLogin, allUsers, singleUser, deleteUser, updateUser, blockUser, refreshTokenHander, logout, updatePassword, forgotPasswordToken, resetPassword} = require("../controller/userController");
const {validateToken, isAdmin} = require("../middleware/tokenHandler");
const router = express.Router();

router.post("/register", createUser).post("/login", userLogin);
router.post("/forgot-password", forgotPasswordToken)
router.put("/reset-password/:token", resetPassword)

router.get("/admin/users", allUsers);
router.get("/refresh-token", refreshTokenHander);
router.put("/update/:id", validateToken, updateUser);
router.put("/admin/users/:id", validateToken, isAdmin, blockUser)
// we can make use of the tokenHandler in serveral ways
// router.use(tokenHandler); 
router.get("/admin/users/:id", validateToken, isAdmin, singleUser);
router.route("/profile").get(validateToken, isAdmin, singleUser).delete(validateToken, deleteUser).put(validateToken, updateUser);
router.delete("/logout", logout);
router.put("/reset-password", validateToken, updatePassword)

module.exports = router