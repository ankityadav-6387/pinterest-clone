const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/pintres")
.then(() => console.log("DB connected"))
.catch((error) => console.log(error));