module.exports = (router) => {
    router.get('/', async () => {
        return JSON.stringify({ hello: 'world' })
    })
}
