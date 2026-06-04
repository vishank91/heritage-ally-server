const mongoose = require("mongoose")

const NewsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Please Enter Your Registered Email Address"]
    },
    status: {
        type: Boolean,
        default: true
    }
})
const Newsletter = mongoose.model("Newsletter", NewsletterSchema)

module.exports = Newsletter