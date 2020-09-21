const express = require('express');
const Router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

Router.post('/Signup', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    if (!name) {
        res.json({
            message: "Name is empty!"
        })
        res.end();
    }
    if (!email) {
        res.json({
            message: "Enail is empty!"
        })
        res.end();
    }
    if (!password) {
        res.json({
            message: "Password is empty!"
        })
        res.end();
    }
    if (!password2) {
        res.json({
            message: "Password Retype is empty!"
        })
        res.end();
    }

    if (password !== password2) {
        res.json(
            {
                message: "Password does not match!"
            }
        )
        res.end();
    }

    let user = await User.findOne({ email });
    if (user) {
        res.status(400).json({ message: "User already exists" });
    }
    else {
        user = new User({
            name,
            email,
            password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        res.status(200).json({ message: "User created" });
    }

});


Router.post('/Login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        res.json({ message: "Email Required!" })
        res.end()
    }
    if (!password) {
        res.json({ message: "Password Required!" })
        res.end()
    }

    let user = await User.findOne({ email });
    if(user){
        await bcrypt.compare(password, user.password, (err, result) =>{
            if(result){
                payload = {
                    email: user.email,
                    name: user.name
                }
                const user_token = jwt.sign(payload, require('../Config/Jwt'), {expiresIn: 120});
                res.status(200).json({ message: "Login Successful!", token: user_token })
            }
            else{
                res.json({ message: "Password Incorrect" })
            }
        } )
    }
    else{
        res.json({ message: "User Not found!" });
    }
});


Router.post('/verify_token', (req, res) =>{
    const { token } = req.body;
    if(!token){
        res.status(401).json({message: "User not authorized"});
        res.end();
    }
    jwt.verify(token, require('../Config/Jwt'), (err, verifiedJWT) =>{
        if(err) {
            res.status(401).json({message: "JWT is not verified"});
        }
        const decode = jwt.decode(token);
        if(verifiedJWT){
            res.status(200).json({message: "User is a verified user with valid JWT", username: decode.email, name: decode.name});
        }
    })
});


Router.post('/Update', async (req, res) => {
    const { email, password, new_password } = req.body;

    if (!email) {
        res.json({ message: "Email Required!" })
        res.end()
    }
    if (!password) {
        res.json({ message: "Password Required!" })
        res.end()
    }
    if(!new_password){
        res.json({ message: "New Password Required!" })
        res.end()
    }

    let user = await User.findOne({ email });
    if(user){
        await bcrypt.compare(password, user.password, async (err, result) =>{
            if(result){
                const salt = await bcrypt.genSalt(10);
                hashed_password = await bcrypt.hash(new_password, salt);
                User.updateOne({email: email}, {password: hashed_password}, (err, result1) =>{
                    if(err){
                        res.status(401).json({ message: "Server Error occured" });
                        res.end();
                    }
                    if(result1){
                        res.status(200).json({ message: "Password Changed" });
                    }
                });
            }
            else{
                res.json({ message: "Old password does not match" })
            }
        } )
    }
    else{
        res.json({ message: "User Not found!" });
    }
});


module.exports = Router;
