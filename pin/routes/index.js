var express = require('express');
var router = express.Router();
const User = require("../models/userModel")
const passport = require('passport')
const nodemailer = require('nodemailer');
const postModel = require('../models/postModel');
const upload = require('../routes/multer');

const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));


//Multer code 
router.post('/fileupload', isLoggedIn, upload.single('image'), async function (req, res) {
  const user = await User.findOne({ username: req.session.passport.user })
  user.dp = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { nav: false })
});

router.post('/signup', async (req, res) => {
  try {
    await User.register(
      { username: req.body.username, email: req.body.email,name:req.body.fullname},
      req.body.password
    );
    res.redirect("/signin");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/signin', function (req, res, next) {
  res.render('signin', { nav: false })
});

//singin route
router.post('/signin', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/signin",

}),
  function (req, res, next) { }
);

// AUTHENTICATED ROUTE MIDDLEWARE
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/signin");
  }
}

router.get('/profile', isLoggedIn, async function (req, res) {
  try {
    const user = await User.findOne({ username: req.session.passport.user }).populate('posts');
    // console.log(user);
    res.render('profile', { user, nav: true });
  } catch (error) {
    res.send(error);
  }
});


router.get('/show/posts', isLoggedIn, async function (req, res) {
  try {
    const user = await User.findOne({ username: req.session.passport.user }).populate('posts');
    // console.log(user);
    res.render('show', { user, nav: true });
  } catch (error) {
    res.send(error);
  }
});

router.get('/feed', isLoggedIn, async function (req, res) {
  try {
    const user = await User.findOne({ username: req.session.passport.user })
    const posts=await postModel.find().populate("user")
    console.log(posts);
    res.render('feed', { user,posts, nav: true });
  } catch (error) {
    res.send(error);
  }
});



router.get('/add', isLoggedIn, async function (req, res) {
  try {
    const user = await User.findOne({ username: req.session.passport.user }).populate('posts');
    // console.log(user);
    res.render('add', { user, nav: true });
  } catch (error) {
    res.send(error);
  }
});

router.post('/createpost', isLoggedIn, upload.single('postImage'), async function (req, res) {
  try {
    const USER = await User.findOne({ username: req.session.passport.user }).populate('posts');
    console.log(USER);
    const post = await postModel.create({
      user: USER._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });
    USER.posts.push(post._id)
    await USER.save();
    res.redirect('/profile')

  } catch (error) {
    res.send(error);
  }
});

router.get('/forgot', function (req, res) {
  res.render('forgot');
});

router.post('/forgot', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send("User Not Found");
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.resetOTP = otp;
    await user.save();
    await sendMailhandler(req.body.email, otp, res);
    res.render('otpvalidation.ejs', {
      id: user._id,
    })

  } catch (error) {
    res.send(error);
  }
})

//sendMailHandler Function
async function sendMailhandler(email, otp, res) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: `ankitghaghri@gmail.com`,
      pass: 'xubl fqcn hahx vlov',
    },
  });
  // receiver mailing info
  const mailOptions = {
    from: "Ankit Pvt. Ltd.<ankitghaghri@gmail.com>",
    to: email,
    subject: "OTP Testing Mail Service",
    // text: req.body.message,
    html: `<h1>${otp}</h1>`,
  };
  // actual object which intregrate all info and send mail
  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.send(err)
    }
    // console.log(info);
    return;
  });
}

//OTP Check 
router.post('/otp/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // console.log(user);
    if (user.resetOTP == req.body.otp) {
      res.render('newPassword.ejs', { id: user._id });
      return;
    }
    res.send('OTP not match');
  } catch (error) {
    res.send(error);
  }
})

//Re-Password Generate
router.post('/change-password/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const newPassword = req.body.newpassword;
    // user.password = newPassword;
    await user.setPassword(newPassword);
    await user.save();
    res.redirect('/signin');
  } catch (error) {
    res.send(error);
  }
})


router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect("/");
  });
});






module.exports = router;
