module.exports = (router) => {
    router.prefix('/product', () => {
        router.get('/get/<id:number>', async (ctx, id) => {
            return id
        })

        router.get('/query', async (ctx) => {
            return JSON.stringify(ctx.request.params)
        })
    })
}
