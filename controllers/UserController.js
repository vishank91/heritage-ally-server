const passwordValidator = require('password-validator');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("../models/User")
const mailer = require("../middleware/mailer")

// Create a schema
const schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have at least 1 uppercase letter
    .has().lowercase()                              // Must have at least 1 lowercase letter
    .has().digits(1)                                // Must have at least 1 digit
    .has().symbols(1)                               // Must have at least 1 special character
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
async function createRecord(req, res) {
    if (schema.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 12, async (error, hash) => {
            if (error) {
                console.log(error)
                res.status(500).send({
                    status : "Fail",
                    reason: "Internal Server Error White Creating Has Password"
                })
            }
            else {
                try {
                    let data = new User(req.body)
                    data.password = hash
                    await data.save()

                    mailer.sendMail({
                        from: process.env.MAILSENDER,
                        to: data.email,
                        subject: `Welcome to ${process.env.SITE_NAME}`,
                        html:
                            `
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color:#4a90e2; padding:20px; text-align:center; color:#ffffff; font-size:24px; font-weight:bold;">
                                    ${process.env.SITE_NAME}
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6;">

                                    <p style="margin:0 0 15px 0;">Hello ${data.name},</p>

                                    <p style="margin:0 0 15px 0;">
                                        🎉 Congratulations! Your account has been successfully created on <strong>${process.env.SITE_NAME}</strong>.
                                    </p>

                                    <p style="margin:0 0 15px 0;">
                                        You can now log in and start exploring all the features we offer.
                                    </p>

                                    <!-- Button -->
                                    <div style="text-align:center; margin:30px 0;">
                                        <a href="${process.env.SITE_URL}/login" 
                                        style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                            Login to Your Account
                                        </a>
                                    </div>

                                    <p style="margin:0 0 15px 0;">
                                        If you did not create this account, please contact us immediately.
                                    </p>

                                    <p style="margin:0;">
                                        Welcome aboard! 🚀
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color:#f8f9fa; padding:20px; text-align:center; font-size:14px; color:#666666;">

                                    <p style="margin:0 0 5px 0;">
                                        <strong>${process.env.SITE_NAME}</strong>
                                    </p>

                                    <p style="margin:0 0 5px 0;">
                                        Email: ${process.env.SITE_EMAIL}
                                    </p>

                                    <p style="margin:0 0 5px 0;">
                                        Phone: ${process.env.SITE_PHONE}
                                    </p>

                                    <p style="margin:0;">
                                        Address: ${process.env.SITE_ADDRESS}
                                    </p>

                                </td>
                            </tr>

                        </table>

                        <!-- Bottom Note -->
                        <table width="600" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="text-align:center; font-size:12px; color:#999999; padding-top:10px;">
                                    © ${process.env.SITE_NAME}. All rights reserved.
                                </td>
                            </tr>
                        </table>

                    `
                    }, (error) => {
                        if (error)
                            console.log(error)
                    })
                    res.send({
                        status: "Done",
                        data: data
                    })
                } catch (error) {
                    console.log(error)
                    let errorMessage = {}
                    if (error.keyValue) {
                        error.keyValue.username ? errorMessage.username = "Username Already Taken" : ''
                        error.keyValue.email ? errorMessage.email = "Email Address Already Taken" : ''
                    }
                    else
                        errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
                    res.status(500).send({
                        status: "Fail",
                        reason: errorMessage
                    })
                }
            }
        })
    }
    else {
        res.status(500).send({
            status : "Fail",
            reason: schema.validate(req.body.password, { details: true }).map(x => x.message.replaceAll("string", "Password"))
        })
    }
}
async function getRecord(req, res) {
    try {
        let data = await User.find().sort({ _id: -1 })
        res.send({
            status : "Done",
            data: data
        })
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            res.send({
                status : "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                status : "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.username = req.body.username ?? data.username
            data.email = req.body.email ?? data.email
            data.address = req.body.address ?? data.address
            data.role = req.body.role ?? data.role
            data.status = req.body.status ?? data.status
            await data.save()
            res.send({
                status : "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                status : "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        let errorMessage = {}
        if (error.keyValue) {
            error.keyValue.username ? errorMessage.username = "Username Already Taken" : ''
            error.keyValue.email ? errorMessage.email = "Email Address Already Taken" : ''
        }
        else
            errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
        res.status(500).send({
            status: "Fail",
            reason: errorMessage
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
        }
        res.send({
            status : "Done"
        })
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function login(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            if (await bcrypt.compare(req.body.password, data.password)) {
                jwt.sign({ data }, process.env.JWT_USER_KEY, { expiresIn: "15 days" }, (error, token) => {
                    res.send({
                        status : "Done",
                        data: data,
                        token: token
                    })
                })
            }
            else {
                res.status(404).send({
                    status : "Fail",
                    reason: "Invalid Username or Password"
                })
            }
        }
        else {
            res.status(404).send({
                status : "Fail",
                reason: "Invalid Username or Password"
            })
        }
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function forgetPassword1(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            let otp = Number(Math.floor(Math.random() * 1000000).toString().padEnd(6, "1"))
            data.passwordReset = {
                otp: otp,
                date: new Date()
            }
            await data.save()

            mailer.sendMail({
                from: process.env.MAILSENDER,
                to: data.email,
                subject: `OTP for Passwors Reset : Team ${process.env.SITE_NAME}`,
                html:
                    `
                     <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8; padding:20px 0;">
                        <tr>
                            <td align="center">

                                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color:#4a90e2; padding:20px; text-align:center; color:#ffffff; font-size:24px; font-weight:bold;">
                                            ${process.env.SITE_NAME}
                                        </td>
                                    </tr>

                                    <!-- Body -->
                                    <tr>
                                        <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6;">
                                            
                                            <p style="margin:0 0 15px 0;">Hello,</p>

                                            <p style="margin:0 0 20px 0;">
                                                Your One-Time Password (OTP) for verification is:
                                            </p>

                                            <!-- OTP Box -->
                                            <div style="text-align:center; margin:30px 0;">
                                                <span style="display:inline-block; background-color:#f1f3f5; padding:15px 25px; font-size:28px; letter-spacing:5px; font-weight:bold; color:#333333; border-radius:6px;">
                                                    ${otp}
                                                </span>
                                            </div>

                                            <p style="margin:0 0 15px 0;">
                                                This OTP is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.
                                            </p>

                                            <p style="margin:0;">
                                                If you did not request this, please ignore this email.
                                            </p>

                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#f8f9fa; padding:20px; text-align:center; font-size:14px; color:#666666;">
                                            
                                            <p style="margin:0 0 5px 0;">
                                                <strong>${process.env.SITE_NAME}</strong>
                                            </p>

                                            <p style="margin:0 0 5px 0;">
                                                Email: ${process.env.SITE_EMAIL}
                                            </p>

                                            <p style="margin:0 0 5px 0;">
                                                Phone: ${process.env.SITE_PHONE}
                                            </p>

                                            <p style="margin:0;">
                                                Address: ${process.env.SITE_ADDRESS}
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                                <!-- Bottom Note -->
                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="text-align:center; font-size:12px; color:#999999; padding-top:10px;">
                                            © ${process.env.SITE_NAME}. All rights reserved.
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>
                    </table>
                    `
            }, (error) => {
                if (error)
                    console.log(error)
            })

            res.send({
                status : "Done",
                message: "OTP Has Been Sent On Your Regsitered Email Address"
            })
        }
        else {
            res.status(404).send({
                status : "Fail",
                reason: "User Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function forgetPassword2(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            if (data.passwordReset.otp == req.body.otp) {
                if (((new Date()) - data.passwordReset.date) < 600000) {
                    res.send({
                        status : "Done",
                        message: "OTP Has Been Matched!!!"
                    })
                }
                else {
                    res.status(404).send({
                        status : "Fail",
                        reason: "OTP Has Been Expired, Please try Again"
                    })
                }
            }
            else {
                res.status(404).send({
                    status : "Fail",
                    reason: "Invalid OTP"
                })
            }
        }
        else {
            res.status(404).send({
                status : "Fail",
                reason: "Unauthorized Activity"
            })
        }
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function forgetPassword3(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            if (schema.validate(req.body.password)) {
                bcrypt.hash(req.body.password, 12, async (error, hash) => {
                    if (error) {
                        console.log(error)
                        res.status(500).send({
                            status : "Fail",
                            reason: "Internal Server Error White Creating Has Password"
                        })
                    }
                    else {
                        try {
                            data.password = hash
                            await data.save()

                            mailer.sendMail({
                                from: process.env.MAILSENDER,
                                to: data.email,
                                subject: `Password Has Been Updated Successfully : Team ${process.env.SITE_NAME}`,
                                html:
                                    `
                                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                                        <!-- Header -->
                                        <tr>
                                            <td style="background-color:#4a90e2; padding:20px; text-align:center; color:#ffffff; font-size:24px; font-weight:bold;">
                                                ${process.env.SITE_NAME}
                                            </td>
                                        </tr>

                                        <!-- Body -->
                                        <tr>
                                            <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6;">

                                                <p style="margin:0 0 15px 0;">Hello ${data.name},</p>

                                                <p style="margin:0 0 15px 0;">
                                                    This is a confirmation that your password has been successfully updated.
                                                </p>

                                                <!-- Highlight Box -->
                                                <div style="background-color:#e8f1fc; border-left:4px solid #4a90e2; padding:15px; margin:20px 0; border-radius:4px;">
                                                    <p style="margin:0; font-size:15px; color:#333333;">
                                                        If you made this change, no further action is required.
                                                    </p>
                                                </div>

                                                <p style="margin:0 0 15px 0;">
                                                    If you did <strong>not</strong> update your password, please secure your account immediately.
                                                </p>

                                                <!-- Button -->
                                                <div style="text-align:center; margin:30px 0;">
                                                    <a href="${process.env.SITE_URL}/forget-password-1" 
                                                    style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                                        Reset Password
                                                    </a>
                                                </div>

                                                <p style="margin:0;">
                                                    For any concerns, feel free to contact our support team.
                                                </p>

                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color:#f8f9fa; padding:20px; text-align:center; font-size:14px; color:#666666;">

                                                <p style="margin:0 0 5px 0;">
                                                    <strong>${process.env.SITE_NAME}</strong>
                                                </p>

                                                <p style="margin:0 0 5px 0;">
                                                    Email: ${process.env.SITE_EMAIL}
                                                </p>

                                                <p style="margin:0 0 5px 0;">
                                                    Phone: ${process.env.SITE_PHONE}
                                                </p>

                                                <p style="margin:0;">
                                                    Address: ${process.env.SITE_ADDRESS}
                                                </p>

                                            </td>
                                        </tr>

                                    </table>

                                    <!-- Bottom Note -->
                                    <table width="600" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="text-align:center; font-size:12px; color:#999999; padding-top:10px;">
                                                © ${process.env.SITE_NAME}. All rights reserved.
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                                </tr>
                                </table>
                    `
                            }, (error) => {
                                if (error)
                                    console.log(error)
                            })
                            res.send({
                                status: "Done",
                                data: data
                            })
                        } catch (error) {
                            res.status(500).send({
                                status : "Fail",
                                reason: "Internal Server Error"
                            })
                        }
                    }
                })
            }
            else {
                res.status(500).send({
                    status : "Fail",
                    reason: schema.validate(req.body.password, { details: true }).map(x => x.message.replaceAll("string", "Password"))
                })
            }
        }
        else {
            res.status(404).send({
                status : "Fail",
                reason: "Unauthorized Activity"
            })
        }
    } catch (error) {
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    login: login,
    forgetPassword1: forgetPassword1,
    forgetPassword2: forgetPassword2,
    forgetPassword3: forgetPassword3,
}