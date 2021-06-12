const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { check, validationResult, body } = require("express-validator");
const productsController = require("../controller/productsController");

/* Middleware that checks if the user is logged*/
const loginMiddleware = require("../middlewares/loginMiddleware");

/* Multer */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let pathToUse = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "images",
      "home",
      "productos"
    );
    cb(null, pathToUse);
  },
  filename: (req, file, cb) => {
    let filename =
      file.originalname.substr(0, file.originalname.indexOf(".")) +
      "-" +
      Date.now() +
      path.extname(file.originalname);
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });
/* /Multer */

/* ----- User Routes ----- */

/* Detail of a product */
router.get("/detail/:id", productsController.findById);

/* Shows the list of products that the given category has  */
router.get("/categories/:category", productsController.getProductByCategory);

/* shopping cart route ( GET )*/
router.get("/shoppingcart", productsController.getShoppingcart);

/* Route for adding products into the cart*/
router.post("/addToCart", loginMiddleware, productsController.addToCart);
router.post("/shoppingcart", productsController.savePurchase);

/* ----- /User Routes ----- */

/* ----- Admin Routes ----- */

/* index of web page that shows all products */
router.get("/", loginMiddleware, productsController.getAllProducts);

/* Create a product route ( GET )*/
router.get("/create", loginMiddleware, productsController.create);

/* Create a product route ( POST )*/
router.post(
  "/",
  upload.any(),
  [
    /* checks if the new product has the following conditions */
    check("tittle")
      .notEmpty()
      .withMessage("Debes escribir un titulo para tu producto"),
    check("tittle")
      .isLength({ min: 5 })
      .withMessage("El titulo debe tener minimamente 5 caracteres"),
    check("description")
      .isLength({ min: 20 })
      .withMessage("La decripcion debe tener minimamente 20 caracteres"),
  ],
  productsController.store
);

/* Edit a product ( GET ) */
router.get("/edit/:id", loginMiddleware, productsController.edit);

/* Edit a product ( PUT ) */
router.put(
  "/:id",
  upload.any(),
  [
    /* checks if the new product has the following conditions */
    check("tittle")
      .notEmpty()
      .withMessage("Debes escribir un titulo para tu producto"),
    check("tittle")
      .isLength({ min: 5 })
      .withMessage("El titulo debe tener minimamente 5 caracteres"),
    check("product_detail")
      .isLength({ min: 20 })
      .withMessage("La decripcion debe tener minimamente 20 caracteres"),
  ],
  productsController.update
);

/* Delete a product */
router.delete("/:id", loginMiddleware, productsController.deleteById);

/* ----- /Admin Routes ----- */

module.exports = router;
