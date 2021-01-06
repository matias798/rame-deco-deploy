let products = require("../data/products.json");
const scenes = require("../data/scenes.json");
const mapOfProducts = new Map(
  products.map((val) => {
    return [val.id, val];
  })
);
for (const scene of scenes) {
  for (const description of scene.pointers_position) {
    let product = mapOfProducts.get(description.description_ref);
    description.description_tittle = product.tittle;
    description.description_summary = product.summary;
    description.description_price = product.price;
  }
}
let productSkeleton={"tittle":"",
"summary":"",
"description":"",
"price":"",
"product_detail":"",
"dimension":"",
"main_image":"",
"images":[]}


let productsContoller = {

  getShoppingcart: function (req, res, next) {
    res.render("shoppingcart");
  },

  create: function (req, res) {
    res.render("create");
  },

  edit: function (req, res) {
    res.render("edit");
  },

  search: (req, res) => {
    let product = products.filter((producto) => {
      let name = producto.name;
      name = name.toLowerCase();
      return (
        req.body.keywords == name ||
        name.indexOf(req.body.keywords.toLowerCase()) != -1
      );
    });
    res.render("productdetail", { product: product });
  },

  index: (req, res) => {
    let product_s = products.filter((product) => {
      return product.category != "scene_member";
    });
    res.render("index", { scenes: scenes, products: product_s });
  },

  getAllProducts: (req, res) => {
    res.render("adminhome", { products: products });
  },

  findById: (req, res) => {
    let product = mapOfProducts.get(req.params.id);
    res.render("productdetail", { product: product });
  },

  deleteById: (req, res) => {
    products = products.filter((product) => {
      return product.id != req.params.id;
    });
    mapOfProducts.delete(req.params.id);
    res.redirect("/products");
  },

  update:(req,res)=>{
    let product =mapOfProducts.get(req.params.id);
    product.tittle=req.body.tittle,
    product.category=req.body.category
    product.summary=req.body.summary
    product.description=req.body.description
    product.price=req.body.price
    product.product_detail=req.body.product_detail
    product.dimension=req.body.dimension
  },
  store: (req, res) => {
		let newProduct={...productSkeleton,...req.body}
		let lastProduct =products.length-1
		if(lastProduct !== -1){
			lastProduct= products[lastProduct]
			newProduct.id= lastProduct.id+1
		}
    newProduct.main_image=req.files[0].filename
    for (const file of req.files) {
      newProduct.images.push(file.filename)
    }
		console.log("el nombre dle file en create es "+ newProduct.image)
		products.push(newProduct)
		fs.writeFileSync(productsFilePath, JSON.stringify(products))
    res.redirect('/products')
  }
};

module.exports = productsContoller;
