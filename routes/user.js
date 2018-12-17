const express = require("express");
const router = express.Router();
const data = require("../data");
var passwordHash = require('password-hash');
const prodData = data.productsData;
const userData = data.userData;
const url = require("url");
var dialog = require('dialog');

//-------------------- User Routes Start -------------------//

router.get("/", function (req, res) {
  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      res.render("user/home", { customer: true });
    } else {
      res.render("user/home", {});
    }
  } else {
    res.render("user/home", {});
  }
});
router.get("/user", (req, res) => {

  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      res.render("user/home", { customer: true });
    } else {
      res.render("user/home", {});
    }
  } else {
    res.render("user/home", {});
  }
});

router.get("/user/home", (req, res) => {

  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      res.render("user/home", { customer: true });
    } else {
      res.render("user/home", {});
    }
  } else {
    res.render("user/home", {});
  }
});

router.get("/contact", (req, res) => {

  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      res.render("user/contact", { customer: true });
    } else {
      res.render("user/contact", {});
    }
  } else {
    res.render("user/contact", {});
  }

});

router.get("/register", (req, res) => {
  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      res.render("user/register", { customer: true });
    } else {
      res.render("user/register", {});
    }
  } else {
    res.render("user/register", {});
  }

});
router.get("/signup", (req, res) => {
  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      res.render("user/signup", { customer: true });
    } else {
      res.render("user/signup", {});
    }
  } else {
    res.render("user/signup", {});
  }

});
router.get("/laptops", async (req, res) => {
  try {
    const prodList = await prodData.getAllProducts()
    console.log(prodList)
    if (req.cookies.AuthCookie) {
      if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
        res.render('user/laptops', { prodList, customer: true });
      } else {
        res.render('user/laptops', { prodList });
      }
    } else {
      res.render('user/laptops', { prodList });
    }
  } catch (e) {
    console.log(e)
    res.status(500).send();
  }
});

router.get("/laptops/laptopdetail/:id", async (req, res) => {
  try {
    const laptopDetail = await prodData.getProduct(req.params.id)
    console.log(laptopDetail)
    if (req.cookies.AuthCookie) {
      if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
        res.render('user/laptopdetail', { laptopDetail, customer: true });
      } else {
        res.render('user/laptopdetail', { laptopDetail });
      }
    } else {
      res.render('user/laptopdetail', { laptopDetail });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});
//------------------- User Routes End -----------------------//


// ------------------  User Login / SignUp Start  ------------------//

router.post("/user/login", async function (req, res) {
  console.log('From Login: ' + req.body.username);
  console.log('From Login: ' + req.body.password);
  username = req.body.username;
  password = req.body.password;

  let hashedPassword = '';
  let isValid = false;
  let users = await userData.getAllUsers();
  users.forEach(function (element) {
    console.log(element)
    if (username === element.username && passwordHash.verify(password, element.hashedPassword)) {
      let hashedPassword = element.hashedPassword;
      console.log('Inside If..!!!');
      isValid = true;
    }
  });
  if (isValid) {
    res.cookie("AuthCookie", username + "/" + hashedPassword, {
      maxAge: 100 * 3600 * 1000
    });
    let customer = userData.getUserByUsername(username);
    console.log(String(userData.getUserByUsername(username)))
    res.render("user/home", { customer: customer });
  }
  else {
   
    dialog.info('Invalid Username or Password!');

    res.render("user/home", {});
  }
});

router.post("/user/adduser", async (req, res) => {
  try {

    const password = req.body.password;
    const hashedPassword = passwordHash.generate(password);
    const userDetails = req.body;
    const username = userDetails.username;
    const fullusername = userDetails.fullusername;
    const email = userDetails.email;
    const contact_number = userDetails.contact_number;
    const address = userDetails.address;
    var user = userData.createUserByParams(username, hashedPassword, userDetails.fullname, email, contact_number, address);
  
    dialog.info('Successfully Registered! Please Sign In');
    res.render("user/home");
  }
  catch (e) {
    console.log(e)
    res.status(500).send();
  }
});

// ------------------  User Login / SignUp End ------------------//


//-------------- Customer Routes Start --------------//

router.get("/profile", async(req, res) => {
  if (req.cookies.AuthCookie) {
    if (isUserVerifyByCookie(req.cookies.AuthCookie)) {
      let username=getUsernameFromCookie(req.cookies.AuthCookie);
      let customer=await userData.getUserByUsername(username)
     
      res.render("user/profile", { customer: customer });
    } else {
      res.render("user/profile", {});
    }
  }
  else {
    res.render("user/profile", {});
  }

});
// router.get("/customer/home", function (req, res) {
//   if (req.cookies.AuthCookie !== undefined) {
//     let cookieValue = req.cookies.AuthCookie;
//     if (isUserVerifyByCookie(cookieValue)) {
//       let customer = userData.getUserByUsername(
//         getUsernameFromCookie(cookieValue)
//       );

//       res.render("user/home", {});
//     } else {
//       res.render("user/home", {});
//     }
//   } else {
//     res.render("user/home", {});
//   }
// });

router.get("/customer/logout", function (req, res) {
  try {
    res.clearCookie("AuthCookie");
    dialog.info('Logged Out!');
    res.render("user/home");
  } catch (e) {
    console.log(e);
  }
});


//-------------- Customer Routes End --------------//

//---------------- Functions Start ----------------//
let isValidUser = async (username, password) => {

  let isValid = false;
  let users = await userData.getAllUsers();
  users.forEach(function (element) {
    if (username === element.username && password === element.hashedPassword) {
      isValid = true;
    }
  });
  return isValid;
}

let getUsernameFromCookie = cookieValue => {
  let userlogin = JSON.stringify(cookieValue).split("/");
  usernametemp = userlogin[0].split('"');
  username = usernametemp[1];
  return username;
};

let isUserVerifyByCookie = async cookieValue => {
  let userlogin = JSON.stringify(cookieValue).split("/");
  usernametemp = userlogin[0].split('"');
  username = usernametemp[1];
  passwordtemp = userlogin[1].split('"');
  password = passwordtemp[0];
  let isVerify = await isValidUser(username, password);
  return isVerify;
};
//---------------- Functions Start ----------------//

module.exports = router;

