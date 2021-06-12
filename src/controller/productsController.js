const db = require("../database/models");
const { Op } = require("sequelize");
const { check, validationResult, body } = require("express-validator");

let setProductInmap= function(key,value,element){
  if(key.includes("amount")){
    element.amount=value
  }else if (key.includes("product_price")){
    element.unit_price=value
  }else {
    element.subtotal=value
  }
}

let productsContoller = {
  addToCart: function (req, res) {
    let idProducto = req.body.id_product;
    let cantidad = req.body.display;
    if (req.session.user != undefined) {
      req.session.shoppingCart.push({
        idProducto: idProducto,
        amount: cantidad,
      });
    }
    res.redirect("/");
  },
  savePurchase: async function(req,res){
    let formData=req.body
    let mapProducts = new Map();
    for (const key in formData) {
      if (typeof formData[key] !== undefined && key !== "total_purchase" && key !== "paymentMethod") {
        const element = formData[key];
        let product_id=key.slice(0,key.indexOf('_'))
        if(mapProducts.has(product_id)){
          let product =mapProducts.get(product_id)
          setProductInmap(key,element,product)
        }else{
          let product = {productId:product_id}
          setProductInmap(key,element,product)
          mapProducts.set(product_id,product)
        }
      }
    }
    let purchase_content ={
      date: Date.now(),
      total:formData["total_purchase"],
      paymentMethodId:req.body.paymentMethod,
      userId : req.session.user.id
    }
    try{
    let purchase=db.purchases.build(purchase_content)
    await purchase.save()
    for (const element of mapProducts.values()) {
      let purchase_detail=db.purchase_details.build({...element})
      purchase_detail.purchaseId=purchase.id 
      await purchase_detail.save() 
    }
    req.session.shoppingCart = undefined
    res.redirect("/")
  }catch(error){
    console.log(error)
    res.redirect("/")
  }
  },

  getShoppingcart: function (req, res) {
    let productsSelected = [];
    if(!req.session.shoppingCart ){
      res.render("emptyShoppingcart", {
        books: undefined,
        user: req.session.user,
      });
      return
    }
    if(req.session.shoppingCart.length<1 ){
      res.render("emptyShoppingcart", {
        books: undefined,
        user: req.session.user,
      });
      return
    }
    req.session.shoppingCart.forEach((element) => {
      productsSelected.push(element.idProducto);
    });
      db.products
        .findAll({
          where: {
            id: {
              [Op.in]: productsSelected,
            },
          },
        })
        .then((products) => {
          for (let i = 0; i < products.length; i++) {
            for (let j = 0; j < req.session.shoppingCart.length; j++) {
              if (
                req.session.shoppingCart[j] != undefined &&
                req.session.shoppingCart[j].idProducto == products[i].id
              ) {
                products[i].amount = req.session.shoppingCart[j].amount;
                break;
              }
            }
            products[i].subtotal = products[i].amount * products[i].price;
            products[i].id = products[i].id
          }
          db.products
            .findAll({
              limit: 5,
            })
            .then((result) => {
              db.payment_methods.findAll().then(paymentMethods=> {
              res.render("shoppingcart", {
                books: products,
                products: result,
                user: req.session.user,
                paymentMethods:paymentMethods
              })}).catch(error=> console.log(error))
            })
            .catch((error) => {
              console.log(error);
              res.redirect("/");
            });
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/");
        });
  },

  create: function (req, res) {
    db.categories
      .findAll()
      .then((categories) => {
        res.render("create", {
          categories: categories,
          user: req.session.user,
        });
      })
      .catch((error) => {
        // muestro el error por consola
        console.log(error);
        // Redirecciono a productos
        res.redirect("/products");
      });
  },

  edit: function (req, res) {
    db.categories
      .findAll()
      .then((categories) => {
        db.products
          .findByPk(req.params.id)
          .then((product) => {
            res.render("edit", {
              categories: categories,
              product: product,
              user: req.session.user,
            });
          })
          .catch((error) => {
            // muestro el error por consola
            console.log(error);
            // Redirecciono a productos
            res.redirect("/products");
          });
      })
      .catch((error) => {
        // muestro el error por consola
        console.log(error);
        // Redirecciono a productos
        res.redirect("/products");
      });
  },

  search: (req, res) => {
    db.products
      .findOne({
        where: {
          title: {
            [Op.like]: "%" + req.body.search_input + "%",
          },
        },
        include: [
          {
            association: "images",
          },
        ],
      })
      .then((product) =>
        res.render("productdetail", {
          product: product,
          user: req.session.user,
        })
      )
      .catch((error) => {
        console.log(error);
        res.redirect("/");
      });
  },

  info: (req, res) => {
    res.render("info", {
      user: req.session.user,
    });
  },
  index: (req, res) => {
    if(req.session.user !== undefined && req.session.user.role !== undefined){
      if(req.session.user.role.name == "admin"){
        res.redirect('/products')
      }
    }
   let productsPromise=db.products.findAll({limit:6})
   let sceneDetailPromise= db.scene_details.findAll({include:[{association:"product"},{association:"scene"}]})
   Promise.all([sceneDetailPromise,productsPromise])
   .then(response => {
      let sceneMap = new Map()
      for (const element of response[0]) {
        if(sceneMap.get(element.scene.id) === undefined){
          let innerScene =element.scene
          innerScene.pointers_position=[]
          innerScene.pointers_position.push(element)
          sceneMap.set(element.scene.id,innerScene)
        }else{
          sceneMap.get(element.scene.id).pointers_position.push(element)
        }
      }
  
      let userTs = req.session.user != undefined ? req.session.user : undefined;
      console.debug("userTs" + userTs);
    res.render("index", {
      scenes: sceneMap.values(),
      products: response[1],
      user: userTs,
    });
    }).catch(error => console.log(error))
  },
  indexUser: (req, res) => {
   let productsPromise=db.products.findAll({limit:6})
   let sceneDetailPromise= db.scene_details.findAll({include:[{association:"product"},{association:"scene"}]})
   Promise.all([sceneDetailPromise,productsPromise])
   .then(response => {
      let sceneMap = new Map()
      for (const element of response[0]) {
        if(sceneMap.get(element.scene.id) === undefined){
          let innerScene =element.scene
          innerScene.pointers_position=[]
          innerScene.pointers_position.push(element)
          sceneMap.set(element.scene.id,innerScene)
        }else{
          sceneMap.get(element.scene.id).pointers_position.push(element)
        }
      }
  
      let userTs = req.session.user != undefined ? req.session.user : undefined;
      console.debug("userTs" + userTs);
    res.render("index", {
      scenes: sceneMap.values(),
      products: response[1],
      user: userTs,
    });
    }).catch(error => console.log(error))
  },
  getAllProducts: (req, res) => {
    db.products
      .findAll()
      .then((products) => {
        res.render("adminhome", {
          products: products,
          user: req.session.user,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },

  findById: (req, res) => {
    db.products
      .findByPk(req.params.id, {
        include: [
          {
            association: "images",
          },
        ],
      })
      .then((product) => {
        res.render("productdetail", {
          product: product,
          user: req.session.user,
        });
      })
      .catch((error) => {
        console.log(error);
        res.redirect("/");
      });
  },

  deleteById: (req, res) => {
    db.products
      .destroy({
        where: {
          id: req.params.id,
        },
      })
      .then((result) => {
        console.log(result);
        res.redirect("/products");
      })
      .catch((error) => {
        console.log(error);
        res.redirect("/products");
      });
  },

  update: (req, res) => {
    let errors = validationResult(req);
    if (errors.isEmpty()) {
      let product_detail = req.body.product_detail.reduce((prev, actual) => {
        prev += " " + actual;
      });
      console.log(product_detail);
      let productDetails={
        title: req.body.tittle,
        summary: req.body.summary,
        description: req.body.description,
        product_detail: product_detail,
        price: req.body.price,
        dimension: req.body.dimension,
        stock: req.body.stock || 100
      }
      if(req.files.length >1){
        productDetails.main_image=req.files[0].filename
      }
      db.products
        .update(productDetails,
          {
            where: {
              id: req.params.id,
            },
          }
        )

        .then((product) => {
          //  Segunda premisa que crea datos de imagenes
          db.images
            .create({
              path: req.files[0].originalname,
              productId: req.params.id,
            })
            .then(() => {
              res.redirect("/products");
            })
            .catch((error) => {
              console.log(error);
              res.redirect("/products");
            });
        })

        .catch((error) => {
          console.log(error);
          res.redirect("/products");
        });
    } else {
      // muestro errores por consola
      console.log(errors);

      db.categories
        .findAll()
        .then((categories) => {
          db.products
            .findByPk(req.params.id)
            .then((product) => {
              res.render("edit", {
                categories: categories,
                product: product,
                user: req.session.user,
                errors: errors.errors,
              });
            })
            .catch((error) => {
              // muestro el error por consola
              console.log(error);
              // Redirecciono a productos
              res.redirect("/products");
            });
        })
        .catch((error) => {
          // muestro el error por consola
          console.log(error);
          // Redirecciono a productos
          res.redirect("/products");
        });
    }
  },

  store: (req, res) => {
    let errors = validationResult(req);
    if (errors.isEmpty()) {
      // Primer premisa que crea un producto
      db.products
        .create({
          title: req.body.tittle,
          summary: req.body.summary,
          description: req.body.description,
          product_detail: req.body.product_detail,
          price: req.body.price,
          dimension: req.body.dimension,
          stock: req.body.stock,
          main_image: req.files[0].filename,
        })

        .then((product) => {
          //  Segunda premisa que crea datos de imagenes
          let arrayImages=[]
          for(let i =1 ;i<req.files.length;i++){
          arrayImages.push(db.images
            .create({
              path: req.files[i].filename,
              productId: product.id,
            }))

            Promise.all(arrayImages).then(() => {
              // Redirecciono a productos
              res.redirect("/products");
            })

            .catch((error) => {
              // muestro el error por consola
              console.log(error);

              // Redirecciono a productos
              res.redirect("/products");
            });
          }  
        })

        .catch(
          // muestro el error por consola
          (error) => {
            console.log(error);

            // Redirecciono a productos
            res.redirect("/products");
          }
        );
    } else {
      console.log(errors);

      db.categories.findAll()

        .then((categories) => {
          return res.render("create", {
            categories: categories,
            user: req.session.user,
            errors: errors.errors,
          });
        })

        .catch((error) => {
          // muestro el error por consola
          console.log(error);

          // redirigo a productos
          res.redirect("/products");
        });
    }
  },

  getProductByCategory: (req, res) => {

/* This function searchs for categories and the products which are related */ 

db.categories.findAll({
  include:[{association:"category_product"}]
})

/* /This function searchs for categories and the products which are related */ 



.then(
  categories=>{

    res.render('categories',{ categories,params:req.params.category-1,user: req.session.user,})
  }
)



.catch(error=>{

  console.log(error)
  res.send(error)

})
  },
  contact: (req, res) => {
    res.render("contact", {
      user: req.session.user,
    });
  },
};

module.exports = productsContoller;
