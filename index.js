const express = require("express")
const cors = require("cors")
const path = require("path")


// const corsOptions = {
//     origin: function (origin, callback) {
//         const allowedOrigins = ["http://localhost:5173","http://localhost:8000","https://heritage-ally-server.onrender.com/"];

//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("You Are not Authorized to Access This API"));
//         }
//     },
//     credentials: true,
// }; 

require("dotenv").config()
require("./db-connect")

const Router = require("./routes/index")
const app = express()
// app.use(cors(corsOptions))
app.use(cors())

app.use(express.json())
app.use("/public", express.static("./public"))
app.use("/api", Router)
app.use(express.static(path.join(__dirname, 'dist')))

app.use((req, res) => {
    express.static(path.join(__dirname, 'dist'))
});


let port = process.env.PORT || 8000
app.listen(port, console.log(`Server is Running at ${port}`))