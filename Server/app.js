const express = require('express');
const mongoose = require("mongoose");
const app = express();
const route = require('./Routes/index');
const mongoPath = require('./Config/Mongo');


app.use(express.json());

mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((mongose) =>{
    if(!mongoose){
        console.log("There is a server error");
    }
    else{
        console.log("You are connected");
    }
}).catch(err =>{
    console.log("There is error connecting to the db", err);
})

app.use('/api', route);

 app.listen(5000, ()=>{
    console.log("Server started");
 });