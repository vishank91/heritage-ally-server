const Newsletter = require("../models/Newsletter")
const mailer = require("../middleware/mailer")

async function createRecord(req, res) {
    try {
        var data = new Newsletter(req.body)
        await data.save()

        mailer.sendMail({
            from: process.env.MAILSENDER,
            to: data.email,
            subject: `Newsletter Subscription Confirmed : Team ${process.env.SITE_NAME}`,
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
                        <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6; text-align:center;">

                            <p style="margin:0 0 15px 0; font-size:20px; font-weight:bold;">
                                🎉 Subscription Confirmed!
                            </p>

                            <p style="margin:0 0 15px 0;">
                                Hello Dear User,
                            </p>

                            <p style="margin:0 0 20px 0;">
                                Thank you for subscribing to the <strong>${process.env.SITE_NAME}</strong> newsletter.
                            </p>

                            <p style="margin:0 0 20px 0;">
                                You’ll now receive the latest updates, offers, and exclusive content directly in your inbox.
                            </p>

                            <!-- Highlight Box -->
                            <div style="background-color:#e8f1fc; border-left:4px solid #4a90e2; padding:15px; margin:20px 0; border-radius:4px; text-align:left;">
                                <p style="margin:0;">
                                    Stay tuned for exciting news, special discounts, and useful insights curated just for you.
                                </p>
                            </div>

                            <!-- Button -->
                            <div style="margin:30px 0;">
                                <a href="${process.env.SITE_URL}" 
                                style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                    Visit Website
                                </a>
                            </div>

                            <p style="margin:0; font-size:14px; color:#777777;">
                                If you did not subscribe, you can safely ignore this email.
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
        // console.log(error)
        if (error.keyValue) {
            res.send({
                status: "Done",
                data: data
            })
        }
        else{
            res.status(500).send({
                status: "Fail",
                reason: "Inernal Server Error"
            })
        }
    }
}
async function getRecord(req, res) {
    try {
        let data = await Newsletter.find().sort({ _id: -1 })
        res.send({
            status: "Done",
            data: data
        })
    } catch (error) {
        res.status(500).send({
            status: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
            res.send({
                status: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                status: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
            data.status = req.body.status ?? data.status
            await data.save()
            res.send({
                status: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                status: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        let errorMessage = {}
        if (error.keyValue)
            errorMessage = "Newsletter With This Name Is Already Exist"
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
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
        }
        res.send({
            status: "Done"
        })
    } catch (error) {
        res.status(500).send({
            status: "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}