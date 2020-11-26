const Koa = require('koa')
const route = require('./route')

const app = new Koa()

app.use(async (ctx, next) => {
    await next()
    const rt = ctx.response.get('X-Response-Time')
    console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

app.use(route())

app.listen(7880)
