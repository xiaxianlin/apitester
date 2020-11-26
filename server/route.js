const Router = require('./core/router')
const indexRoute = require('./routes/index')
const productRoute = require('./routes/product')
const router = Router()

module.exports = () => {
    indexRoute(router)
    productRoute(router)
    return router
}
