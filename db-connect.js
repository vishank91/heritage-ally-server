require("mongoose")
    .connect(process.env.DB_KEY)
    .then(() => {
        console.log(`Databse is Connected`)
    })
    .catch((error) => {
        console.log(error)
    })