const express = require("express");
const { createProduct, getProducts, getProduct, updateProduct, DeleteProduct } = require("../controller/productController");
const router = express.Router();
const { validateToken, isAdmin } =  require("../middleware/tokenHandler");

router.post("/",validateToken, isAdmin, createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id",validateToken, isAdmin, updateProduct);
router.delete("/:id",validateToken, isAdmin, DeleteProduct);


module.exports = router;