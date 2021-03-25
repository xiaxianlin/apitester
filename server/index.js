const Hapi = require('@hapi/hapi')
const Qs = require('qs')
const util = require('./common/util')
// import the bussiness modules
const config = require('./config')
const interface = require('./interface')
const model = require('./model')
const product = require('./product')
const record = require('./record')
const scene = require('./scene')
const user = require('./user')
const validator = require('./validator')

const loadModules = (server) => {
    config.load(server)
    interface.load(server)
    model.load(server)
    product.load(server)
    scene.load(server)
    user.load(server)
    validator.load(server)
}

const start = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        query: {
            parser: (query) => Qs.parse(query)
        }
    })

    await server.register(require('@hapi/basic'))

    server.auth.strategy('simple', 'basic', { validate: util.validate })

    server.route({
        method: 'GET',
        path: '/',
        handler: (req, h) => {
            h.state('data', 'en')
            return 'Hello World!'
        }
    })

    server.route({
        method: '*',
        path: '/{any*}',
        handler: (req, h) => {
            return '404 Error! Page Not Found!'
        }
    })

    loadModules(server)

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

start()
