const FaqRouter = require("express").Router()
const { authAdmin, authSuperAdmin, authPublic } = require("../middleware/auth")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
} = require("../controllers/FaqController")

FaqRouter.post("", authAdmin, createRecord)
FaqRouter.get("", authPublic, getRecord)
FaqRouter.get("/:_id", authPublic, getSingleRecord)
FaqRouter.put("/:_id", authAdmin, updateRecord)
FaqRouter.delete("/:_id", authSuperAdmin, deleteRecord)

module.exports = FaqRouter

