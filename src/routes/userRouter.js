var express = require('express');
var router = express.Router();
let usersController= require('../controller/usersController');
const multer = require('multer');
const path =require('path');
let loginMiddleware = require('../middlewares/loginMiddleware');
const {check,validationResult,body}= require('express-validator')


const storage = multer.diskStorage(
	{
		destination: (req,file,cb)=>{ 

            cb(null,path.resolve(__dirname,'..','avatar'))},
		filename:  (req,file,cb)=>{ 
            let filename=file.originalname.substr(0,file.originalname.indexOf('.'))+'-' +Date.now() + path.extname(file.originalname)
            cb(null,filename)}
	}
)
const upload = multer({storage:storage})


/* GET admin page*/
router.get('/', loginMiddleware,usersController.adminUser);

/* GET user profile page*/
router.get('/profile/:id', loginMiddleware,usersController.userProfile);
 
/* GET user profile page*/
router.get('/profile/edit/:id',loginMiddleware, usersController.userEdit);


router.put('/profile/edit/:id',upload.any(), usersController.update);

/* GET register page. */
router.get('/register', usersController.getRegister);
router.post('/register',[
	check('first_name').notEmpty().withMessage('Debes escribir tu nombre '),
	check('first_name').isLength({min:2}).withMessage('Tu nombre debe tener minimamente 2 caracteres'),

	check('last_name').notEmpty().withMessage('Debes escribir tu apellido '),
	check('last_name').isLength({min:2}).withMessage('Tu apellido debe tener minimamente 2 caracteres'),
	
	check('email').notEmpty().withMessage('Debes escribir un email '),
	check('email').isEmail().withMessage('Debes escribir tu email correctamente'),

	check('password').notEmpty().withMessage('Debes escribir una contraseña '),
	check('password').isLength({min:8}).withMessage('Recuerda que tu contraseña debe tener minimamente 8 caracteres'),


	check('username').notEmpty().withMessage('Debes escribir tu nombre de usuario')


] ,usersController.registerUser);

/* GET login page. */
router.get('/login', usersController.getLogin);
router.post('/login',[
check('username').notEmpty().withMessage('Ingresaste mal tu nombre de usuario, escribelo nuevamente'),
check('password').isLength({min:6}).withMessage('Ingresaste mal tu contraseña, escribela nuevamente ')
],usersController.logInUser );

/* Route that logs the user out of the session*/
router.get('/logout',loginMiddleware, usersController.logOutUser);

router.get('/repetir',usersController.repetir)
router.get('/userExist',usersController.userExist)

module.exports = router;
