const ContactUs = require("../models/ContactUs")
const mailer = require("../middleware/mailer")

async function createRecord(req, res) {
    try {
        let data = new ContactUs(req.body)
        await data.save()

        mailer.sendMail({
            from: process.env.MAILSENDER,
            to: data.email,
            subject: `Your Query Has Been Receieved : Team ${process.env.SITE_NAME}`,
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

                                    <p style="margin:0 0 15px 0;">Hello ${data.name},</p>

                                    <p style="margin:0 0 15px 0;">
                                        Thank you for contacting <strong>${process.env.SITE_NAME}</strong>.
                                    </p>

                                    <p style="margin:0 0 15px 0;">
                                        We have successfully received your query and our support team will review it shortly.
                                    </p>

                                    <!-- Query Details -->
                                    <div style="background-color:#e8f1fc; border-left:4px solid #4a90e2; padding:15px; margin:20px 0; border-radius:4px;">
                                        <p style="margin:0 0 8px 0;"><strong>Query Subject:</strong> ${data.subject}</p>
                                        <p style="margin:0;"><strong>Submitted On:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
                                    </div>

                                    <p style="margin:0 0 15px 0;">
                                        Our team usually responds within 24-48 hours.
                                    </p>

                                    <!-- Button -->
                                    <div style="text-align:center; margin:30px 0;">
                                        <a href="${process.env.SITE_URL}" 
                                        style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                            Visit Website
                                        </a>
                                    </div>

                                    <p style="margin:0;">
                                        We appreciate your patience and look forward to assisting you.
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
        mailer.sendMail({
            from: process.env.MAILSENDER,
            to: process.env.MAILSENDER,
            subject: `New Contactus Query Has Been Receieved : Team ${process.env.SITE_NAME}`,
            html:
                `
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8; padding:20px 0;">
                    <tr>
                    <td align="center">

                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color:#4a90e2; padding:20px; text-align:center; color:#ffffff; font-size:24px; font-weight:bold;">
                                    New Contact Query
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6;">

                                    <p style="margin:0 0 20px 0;">
                                        A new contact us query has been submitted on <strong>${process.env.SITE_NAME}</strong>.
                                    </p>

                                    <!-- Customer Details -->
                                    <table width="100%" cellpadding="10" cellspacing="0" border="0" style="border-collapse:collapse; margin-bottom:20px;">

                                        <tr>
                                            <td style="background-color:#f8f9fa; border:1px solid #eeeeee; width:35%; font-weight:bold;">
                                                Customer Name
                                            </td>
                                            <td style="border:1px solid #eeeeee;">
                                                ${data.name}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="background-color:#f8f9fa; border:1px solid #eeeeee; font-weight:bold;">
                                                Email Address
                                            </td>
                                            <td style="border:1px solid #eeeeee;">
                                                ${data.email}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="background-color:#f8f9fa; border:1px solid #eeeeee; font-weight:bold;">
                                                Phone Number
                                            </td>
                                            <td style="border:1px solid #eeeeee;">
                                               ${data.phone}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="background-color:#f8f9fa; border:1px solid #eeeeee; font-weight:bold;">
                                                Subject
                                            </td>
                                            <td style="border:1px solid #eeeeee;">
                                                ${data.subject}
                                            </td>
                                        </tr>
                                        

                                        <tr>
                                            <td style="background-color:#f8f9fa; border:1px solid #eeeeee; font-weight:bold;">
                                                Submitted On
                                            </td>
                                            <td style="border:1px solid #eeeeee;">
                                                ${new Date(data.createdAt).toLocaleString()}
                                            </td>
                                        </tr>

                                    </table>

                                    <!-- Message -->
                                    <div style="background-color:#f8f9fa; border:1px solid #eeeeee; padding:20px; border-radius:6px;">
                                        <p style="margin:0 0 10px 0; font-weight:bold;">Customer Message:</p>
                                        <p style="margin:0; color:#555555;">
                                            ${data.message}
                                        </p>
                                    </div>

                                    <!-- Button -->
                                    <div style="text-align:center; margin:30px 0;">
                                        <a href="${process.env.SITE_URL}/admin/contactus/show/${data._id}" 
                                        style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                            Open Admin Panel
                                        </a>
                                    </div>

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
                                    Automated notification from ${process.env.SITE_NAME}
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
        let errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
        res.status(500).send({
            status: "Fail",
            reason: errorMessage
        })
    }
}
async function getRecord(req, res) {
    try {
        let data = await ContactUs.find().sort({ _id: -1 })
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
        let data = await ContactUs.findOne({ _id: req.params._id })
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
        let data = await ContactUs.findOne({ _id: req.params._id })
        if (data) {
            data.status = req.body.status ?? data.status
            await data.save()

            mailer.sendMail({
                from: process.env.MAILSENDER,
                to: data.email,
                subject: `Your Query Has Been Resolved : Team ${process.env.SITE_NAME}`,
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

                                    <p style="margin:0 0 15px 0;">Hello ${data.name},</p>

                                    <p style="margin:0 0 15px 0;">
                                        We’re happy to inform you that your query has been successfully resolved.
                                    </p>

                                    <!-- Query Details -->
                                    <div style="background-color:#e8f1fc; border-left:4px solid #4a90e2; padding:15px; margin:20px 0; border-radius:4px;">
                                        <p style="margin:0 0 8px 0;"><strong>Query ID:</strong> ${data._id}</p>
                                        <p style="margin:0 0 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
                                        <p style="margin:0;"><strong>Resolved On:</strong> ${new Date(data.updatedAt).toLocaleString()}</p>
                                    </div>

                                    <p style="margin:0 0 15px 0;">
                                        We hope the provided solution addressed your concern satisfactorily.
                                    </p>

                                    <p style="margin:0 0 15px 0;">
                                        If you still need assistance or have additional questions, feel free to reply to this email or contact our support team.
                                    </p>

                                    <!-- Button -->
                                    <div style="text-align:center; margin:30px 0;">
                                        <a href="${process.env.SITE_URL}/contactus" 
                                        style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                            Contact Support
                                        </a>
                                    </div>

                                    <p style="margin:0;">
                                        Thank you for choosing <strong>${process.env.SITE_NAME}</strong>.
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
        if (error.keyValue)
            errorMessage = "ContactUs With This Name Is Already Exist"
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
        let data = await ContactUs.findOne({ _id: req.params._id })
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

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}