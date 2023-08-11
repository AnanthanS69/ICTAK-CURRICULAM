const express = require('express');
const app = express();

const morgan = require('morgan');
app.use(morgan('dev'));

const cors = require('cors');
app.use(cors());

const PORT = 3000;

const api = require('./routes/route');
app.use('/curriculum-tracker',api);
app.use('/curriculum-tracker/pendingCurriculums', api);

const db=require("./db/connection")

//----------------------------------
const path = require('path');
app.use(express.static('./backend/frontend'));

app.use(express.static(path.join(__dirname,'frontend')))

app.get('*', async(req, res)=> {
        res.sendFile(path.join(__dirname ,'frontend','index.html'))});



//---------------------------------


app.listen(PORT,()=>{
    console.log(`Server : https://localhost/${PORT}`)
});
