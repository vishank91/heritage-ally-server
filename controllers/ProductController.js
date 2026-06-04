const Product = require("../models/Product")
const Newsletter = require("../models/Newsletter")
const mailer = require("../middleware/mailer")

const fs = require("fs")
async function createRecord(req, res) {
    try {
        let data = new Product(req.body)
        if (req.files)
            data.pic = Array.from(req.files).map((x) => x.path)
        await data.save()

        let finalData = await Product.findOne({ _id: data._id })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("brand", ["name"])
        let emails = await Newsletter.find()

        emails.forEach(item => {
            mailer.sendMail({
                from: process.env.MAILSENDER,
                to: item.email,
                subject: `Introducing Our New Product : Team ${process.env.SITE_NAME}`,
                html:
                    `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8; padding:20px 0;">
                        <tr>
                        <td align="center">

                            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                                <!-- Header -->
                                <tr>
                                    <td style="background-color:#4a90e2; padding:25px; text-align:center; color:#ffffff; font-size:28px; font-weight:bold;">
                                        ${process.env.SITE_NAME}
                                    </td>
                                </tr>

                                <!-- Hero Section -->
                                <tr>
                                    <td style="padding:40px 30px 20px 30px; text-align:center;">

                                        <p style="margin:0; font-size:28px; font-weight:bold; color:#333333;">
                                            Introducing Our New Product
                                        </p>

                                        <p style="margin:20px 0 0 0; font-size:16px; color:#666666; line-height:1.7;">
                                            We’re excited to announce the launch of our latest product designed to deliver exceptional quality, performance, and value.
                                        </p>

                                    </td>
                                </tr>

                                <!-- Product Image -->
                                <tr>
                                    <td align="center" style="padding:10px 30px;">
                                        <img src="${process.env.SITE_URL}/${data.pic[0]}" 
                                            alt="Product Image" 
                                            width="100%" 
                                            style="max-width:520px; border-radius:8px; display:block;">
                                    </td>
                                </tr>

                                <!-- Product Details -->
                                <tr>
                                    <td style="padding:30px; color:#333333; font-size:16px; line-height:1.7;">

                                        <p style="margin:0 0 15px 0;">
                                            <strong>Product Name:</strong> ${data.name}
                                        </p>

                                        <p style="margin:0 0 20px 0; color:#555555;">
                                            ${data.description}
                                        </p>

                                        <!-- Features -->
                                        <div style="background-color:#f8f9fa; padding:20px; border-radius:6px; margin:20px 0;">
                                            <p style="margin:0 0 10px 0; font-weight:bold; color:#333333;">
                                                Key Highlights:
                                            </p>

                                            <ul style="padding-left:20px; margin:0; color:#555555;">
                                                <li style="margin-bottom:8px;">Base Price : <del>&#8377;${data.basePrice}</del></li>
                                                <li style="margin-bottom:8px;">Discount : ${data.discount}% off</li>
                                                <li style="margin-bottom:8px;">Final Price : &#8377;${data.finalPrice}</li>
                                            </ul>
                                        </div>

                                        <!-- CTA -->
                                        <div style="text-align:center; margin:35px 0;">
                                            <a href="${process.env.SITE_URL}/product/${data._id}" 
                                            style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:14px 30px; font-size:16px; border-radius:5px; display:inline-block; font-weight:bold;">
                                                Shop Now
                                            </a>
                                        </div>

                                        <p style="margin:0; color:#666666;">
                                            Thank you for being part of our community. We can’t wait for you to experience this new launch.
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

                                        <p style="margin:0 0 10px 0;">
                                            Address: ${process.env.SITE_ADDRESS}
                                        </p>

                                        <p style="margin:0; font-size:12px; color:#999999;">
                                            You are receiving this email because you subscribed to our newsletter.
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
        })
        res.send({
            status: "Done",
            data: finalData
        })
    } catch (error) {
        if (req.files) {
            try {
                Array.from(req.files).forEach(x => fs.unlinkSync(x.path))
            } catch (error) { }
        }
        let errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
        res.status(500).send({
            status: "Fail",
            reason: errorMessage
        })
    }
}
async function getRecord(req, res) {
    try {
        let data = await Product.find().sort({ _id: -1 })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("brand", ["name"])
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
        let data = await Product.findOne({ _id: req.params._id })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("brand", ["name"])
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
        let data = await Product.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.maincategory = req.body.maincategory ?? data.maincategory
            data.subcategory = req.body.subcategory ?? data.subcategory
            data.brand = req.body.brand ?? data.brand
            data.color = req.body.color ?? data.color
            data.size = req.body.size ?? data.size
            data.basePrice = req.body.basePrice ?? data.basePrice
            data.discount = req.body.discount ?? data.discount
            data.finalPrice = req.body.finalPrice ?? data.finalPrice
            data.stock = req.body.stock ?? data.stock
            data.stockQuantity = req.body.stockQuantity ?? data.stockQuantity
            data.description = req.body.description ?? data.description
            data.status = req.body.status ?? data.status
            await data.save()

            if (req.body.oldPics?.length === 0 && req.files?.length === 0) {
                res.send({
                    status: "Fail",
                    reason: "Please Upload Atleast On Image or Keep Atlaest one Old Image"
                })
            }
            else if (req.body.oldPics && req.body.oldPics?.length !== 0 && req.files?.length === 0) {
                data.pic.forEach(x => {
                    if (!req.body.oldPics.includes(x)) {
                        try {
                            fs.unlinkSync(x)
                        } catch (error) { }
                    }
                })
                data.pic = req.body.oldPics
                await data.save()
            }
            else if (req.files.length) {
                let oldPics = []
                if (req.body.oldPics)
                    oldPics = req.body.oldPics

                data.pic.forEach(x => {
                    if (!oldPics.includes(x)) {
                        try {
                            fs.unlinkSync(x)
                        } catch (error) { }
                    }
                })
                data.pic = oldPics.concat(Array.from(req.files).map(x => x.path))
                await data.save()
            }
            let finalData = await Product.findOne({ _id: req.params._id })
                .populate("maincategory", ["name"])
                .populate("subcategory", ["name"])
                .populate("brand", ["name"])
            res.send({
                status: "Done",
                data: finalData
            })
        }
        else {
            res.status(404).send({
                status: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        console.log(error)
        if (req.files) {
            try {
                Array.from(req.files).forEach(x => fs.unlinkSync(x.path))
            } catch (error) { }
        }
        let errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
        res.status(500).send({
            status: "Fail",
            reason: errorMessage
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
        if (data) {
            try {
                data.pic.forEach(x => fs.unlinkSync(x))
            } catch (error) { }
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