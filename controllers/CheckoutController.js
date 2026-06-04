const Checkout = require("../models/Checkout")
const mailer = require("../middleware/mailer")

const Razorpay = require("razorpay")

//Payment API
async function order(req, res) {
    try {
        const instance = new Razorpay({
            key_id: process.env.RPKEYID,
            key_secret: process.env.RPSECRETKEY,
        });

        const options = {
            amount: req.body.amount * 100,
            currency: "INR"
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.json({ data: order });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
}

async function verifyOrder(req, res) {
    try {
        var check = await Checkout.findOne({ _id: req.body.checkid })
        check.rppid = req.body.razorpay_payment_id
        check.paymentStatus = "Done"
        check.paymentMode = "Net Banking"
        await check.save()
        res.status(200).send({ result: "Done", message: "Payment SuccessFull" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}


async function createRecord(req, res) {
    try {
        let data = new Checkout(req.body)
        await data.save()
        let finalData = await Checkout.findOne({ _id: data._id })
            .populate("user", ["name", "userid"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity pic",
                populate: {
                    path: "brand",
                    select: "-_id name"
                },
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })

        let products = finalData.products?.map((item) => {
            return `
                <tr>
                    <td style="border-bottom:1px solid #eee;">${item.product?.name}</td>
                    <td style="border-bottom:1px solid #eee;">${item.qty}</td>
                    <td style="border-bottom:1px solid #eee;">&#8377;${item.product?.finalPrice}</td>
                </tr>
            `
        }).join("")

        mailer.sendMail({
            from: process.env.MAILSENDER,
            to: data.deliveryAddress?.email,
            subject: `Order Has Been Placed Successfully : Team ${process.env.SITE_NAME}`,
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

                            <p style="margin:0 0 15px 0;">Hello ${data.deliveryAddress?.name},</p>

                            <p style="margin:0 0 15px 0;">
                                🎉 Thank you for your order! Your order has been successfully placed.
                            </p>

                            <!-- Order Info -->
                            <div style="background-color:#f1f3f5; padding:15px; border-radius:6px; margin:20px 0;">
                                <p style="margin:0 0 8px 0;"><strong>Order ID:</strong> ${data._id}</p>
                                <p style="margin:0 0 8px 0;"><strong>Order Date:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
                                <p style="margin:0;"><strong>Payment Method:</strong> ${data.paymentMode}</p>
                            </div>

                            <!-- Order Table -->
                            <table width="100%" cellpadding="10" cellspacing="0" border="0" style="border-collapse:collapse; margin:20px 0;">
                                <tr style="background-color:#f8f9fa; text-align:left;">
                                    <th style="border-bottom:1px solid #ddd;">Item</th>
                                    <th style="border-bottom:1px solid #ddd;">Qty</th>
                                    <th style="border-bottom:1px solid #ddd;">Price</th>
                                </tr>

                                <!-- Repeat this row dynamically -->
                              ${products}

                            </table>

                            <!-- Total -->
                            <div style="background-color:#f1f3f5; padding:15px; border-radius:6px; margin:20px 0;">
                                <p style="margin:5px 0;"><strong>Subtotal:</strong> &#8377;${data.subtotal}</p>
                                <p style="margin:5px 0;"><strong>Shipping:</strong> &#8377;${data.shipping}</p>
                                <p style="margin:5px 0; font-size:18px;"><strong>Total:</strong> &#8377;${data.total}</p>
                            </div>

                            <!-- Address -->
                            <div style="margin:25px 0;">
                                <p style="margin:0 0 5px 0;"><strong>Shipping Address:</strong></p>
                                <p style="margin:0; color:#555555;">${data.deliveryAddress?.address}</p>
                                <p style="margin:0; color:#555555;">${data.deliveryAddress?.pin},${data.deliveryAddress?.city},${data.deliveryAddress?.state}</p>
                            </div>

                            <!-- Button -->
                            <div style="text-align:center; margin:30px 0;">
                                <a href="${process.env.SITE_URL}/profile" 
                                style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                    Track Your Order
                                </a>
                            </div>

                            <p style="margin:0;">
                                If you have any questions, feel free to contact our support team.
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
            data: finalData
        })
    } catch (error) {
        console.log(error)
        let errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
        res.status(500).send({
            status: "Fail",
            reason: errorMessage
        })
    }
}
async function getRecord(req, res) {
    try {
        let data = await Checkout.find().sort({ _id: -1 })
            .populate("user", ["name", "userid"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity pic",
                populate: {
                    path: "brand",
                    select: "-_id name"
                },
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })
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

async function getUserRecord(req, res) {
    try {
        let data = await Checkout.find({user:req.params._id}).sort({ _id: -1 })
            .populate("user", ["name", "userid"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity pic",
                populate: {
                    path: "brand",
                    select: "-_id name"
                },
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })
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
        let data = await Checkout.findOne({ _id: req.params._id })
            .populate("user", ["name", "userid"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity pic",
                populate: {
                    path: "brand",
                    select: "-_id name"
                },
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })
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
        let data = await Checkout.findOne({ _id: req.params._id })
            .populate("user", ["name", "userid"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity pic",
                populate: {
                    path: "brand",
                    select: "-_id name"
                },
                options: {
                    slice: {
                        pic: 1
                    }
                }
            })
        if (data) {
            data.orderStatus = req.body.orderStatus ?? data.orderStatus
            data.paymentMode = req.body.paymentMode ?? data.paymentMode
            data.paymentStatus = req.body.paymentStatus ?? data.paymentStatus
            data.rppid = req.body.rppid ?? data.rppid
            await data.save()

            mailer.sendMail({
                from: process.env.MAILSENDER,
                to: data.deliveryAddress?.email,
                subject: `Order Status is Updated : Team ${process.env.SITE_NAME}`,
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

                                    <p style="margin:0 0 15px 0;">Hello ${data.deliveryAddress?.name},</p>

                                    <p style="margin:0 0 15px 0;">
                                        Your order status has been updated.
                                    </p>

                                    <!-- Status Box -->
                                    <div style="background-color:#e8f1fc; border-left:4px solid #4a90e2; padding:15px; margin:20px 0; border-radius:4px;">
                                        <p style="margin:0 0 8px 0;"><strong>Order ID:</strong> ${data._id}</p>
                                        <p style="margin:0 0 8px 0;"><strong>Current Status:</strong> ${data.orderStatus}</p>
                                        <p style="margin:0;"><strong>Updated On:</strong> ${new Date(data.updatedAt).toLocaleString()}</p>
                                    </div>

                                    <!-- Optional Message -->
                                    <p style="margin:0 0 15px 0;">
                                        ${data.orderStatus}
                                    </p>

                                    <!-- Button -->
                                    <div style="text-align:center; margin:30px 0;">
                                        <a href="${process.env.SITE_URL}/profile" 
                                        style="background-color:#4a90e2; color:#ffffff; text-decoration:none; padding:12px 25px; font-size:16px; border-radius:5px; display:inline-block;">
                                            View Order Details
                                        </a>
                                    </div>

                                    <p style="margin:0;">
                                        If you have any questions, feel free to contact our support team.
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
        res.status(500).send({
            status : "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
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
    getUserRecord:getUserRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    order:order,
    verifyOrder:verifyOrder
}