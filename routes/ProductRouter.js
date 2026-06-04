const ProductRouter = require("express").Router()
const { productUploader } = require("../middleware/fileUploader")
const { authAdmin, authSuperAdmin, authPublic, authBuyer } = require("../middleware/auth")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
} = require("../controllers/ProductController")

ProductRouter.post("", authAdmin, productUploader.array("pic"), createRecord)
ProductRouter.get("", authPublic, getRecord)
ProductRouter.get("/:_id", authPublic, getSingleRecord)
ProductRouter.put("/:_id", authBuyer, productUploader.array("pic"), updateRecord)
ProductRouter.delete("/:_id", authSuperAdmin, deleteRecord)

module.exports = ProductRouter

