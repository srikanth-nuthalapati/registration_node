const express = require("express");
const cors = require('cors');
const nodemailer = require('nodemailer');
const otp = require("./otp");
const multer = require("multer");
const path = require("path");
const conn = require('./dao');
const bcrypt = require('bcrypt');
const fs = require('fs');
require("dotenv").config()


const uploadsPath = path.join(__dirname, 'uploads');

// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let transporter = nodemailer.createTransport({
    // service:'gmail'
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:process.env.mailid,
        pass:process.env.apppass
    }
})

let otpSaver = {};
let validMail = /@(gmail\.com|outlook\.com)$/i;
let validUser = /^[a-zA-Z][a-zA-Z0-9._-]{2,19}$/;
let validPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;

app.post("/otp/send",(req,res)=>{
    let code = otp();
    let mailId = req.body.email;
    if(!validMail.test(mailId)){
        return res.send({
            status:400,
            message:'invalid mailId',
        });
    }
    otpSaver[mailId] = code;

    let options = {
    from: process.env.mail,
    to: mailId,
    subject: 'sending mail using node',
    text: `this is your one time password - ${code}`,
    }
    transporter.sendMail(options,(err,info)=>{
        if(err){
            res.send({
                status:400,
                message:err.message
            });
        }
        else{
            res.send({
                status:200,
                message:"otp sent successfully"
            });
        }
    });
});

app.post("/otp/verify",(req,res)=>{
    let { email,code } = req.body;
    if(otpSaver[email] == code){
        res.send({
            status:200,
            message:'otp verified successfully',
        });
    }
    else{
        res.send({
            status:400,
            message:'invalid otp',
        });
    }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname); 
  }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const pattern = /\.(jpg|jpeg|png)$/i;
      if (pattern.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are accepted'), false); 
      }
    }
});

app.post('/register',upload.single('profile'),(req, res) => {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        const { username, email, password } = req.body;
        const profilePicPath = req.file.path;

        if (!validUser.test(username)) {
            return res.status(400).send({ message: 'Invalid username' });
        }
    
        if (!validMail.test(email)) {
        return res.status(400).send({ message: 'Invalid email' });
        }

        if (!validPass.test(password)) {
        return res.status(400).send({ message: 'Invalid password' });
        }

        conn.query(`select count(*) as count from register where username = ? `,[username],(err,info) => {
            if(err){
                return res.send({
                    status: 500,
                    message: err.message
                })
            }
            
            if(info[0].count > 0){
                return  res.send({
                    status: 400,
                    message: 'Username already exists'
                });
            }

            let salt = 10;
            let hashPass = bcrypt.hashSync(password , salt);

            let st = `insert into register(username,email,password,image) values(?, ?, ?, ?) `;

            conn.query(st, [username, email, hashPass, profilePicPath, ], (err,info) => {
                if(err){
                    res.send({
                        status:400,
                        message: err.message,
                    })
                }
                else{
                    res.send({
                        status:200,
                        message: "user registered",
                    })
                }
            });
           
        });

});


app.listen(process.env.port,()=>{
    console.log("server running");
});