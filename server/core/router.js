const buildingRegexp = (s) => {
    if (s === '/') return null
    let rSpcs = /([.*+?\[\]{}\\\/])/g
    s = s.replace(rSpcs, '\\$1')
    s = s.replace(/<\s*([^\s<>]+?)\s*:\s*string\s*>/, '(?<$1>\\w+)')
    s = s.replace(/<\s*([^\s<>]+?)\s*:\s*number\s*>/, '(?<$1>\\d+)')
    s = '^' + s + '$'
    return new RegExp(s)
}

const getUrlInfo = (route) => {
    let params = []
    let match = route.match(/(\w+):(\w+)/g)
    if (match) {
        params = match.map((item) => item.split(':'))
    }
    return { route, reg: buildingRegexp(route), params, args: [] }
}

const filterURL = (route, matchs) => {
    let path = route.split('/')
    matchs.forEach((match) => {
        let matchPath = match.route.split('/')
        match.record = matchPath.reduce((record, item, index) => {
            let goal = 0
            if (!path[index]) {
                goal = -1000
            }
            if (item.includes('<')) {
                goal = 5
            } else if (item === path[index]) {
                goal = 10
            } else {
                goal = -1000
            }
            return record + goal
        }, 0)
    })
    matchs.sort((a, b) => {
        return a.record > b.record
    })
    return matchs[0]
}

const matchURL = (route, routes) => {
    if (route === '/') return route
    let matchResult = []
    routes.forEach((info, key) => {
        if (info.reg && info.reg.test(route)) {
            matchResult.push(info)
        }
    })
    let routeInfo = null
    if (matchResult.length === 1) {
        routeInfo = matchResult[0]
    } else {
        routeInfo = filterURL(route, matchResult)
    }
    if (routeInfo) {
        let mc = routeInfo.reg.exec(route)
        routeInfo.args = routeInfo.params.map((item) => mc.groups[item[0]])
    }
    return routeInfo
}

const formatQueryString = (queryStr) => {
    return queryStr.split('&').reduce((params, item) => {
        let [key, value] = item.split('=')
        params[key] = value
        return params
    }, {})
}

const Router = () => {
    let currentPrefix = '/'
    // 所有请求，格式：{ method: { [route] : [callback] }}
    let requests = new Map()
    // 路由集合
    let routes = new Map()

    let router = async (ctx, next) => {
        let [url, queryString] = ctx.url.split('?')
        ctx.request.params = formatQueryString(queryString)
        let callbacks = requests.get(ctx.method.toLowerCase())
        let routeInfo = matchURL(url, routes)
        // 没有匹配到路由
        if (!routeInfo) {
            return next()
        }
        let callback = callbacks.get(routeInfo.route)
        if (!callback) {
            return next()
        }
        try {
            ctx.response.status = 200
            let data = await callback(ctx, ...routeInfo.args)
            ctx.body = data
        } catch (error) {
            ctx.response.status = 500
            console.log(error)
        }
    }

    router.prefix = (prefix, callback) => {
        // 设置当前前缀
        currentPrefix = prefix
        // 内部设置方法
        callback()
        // 恢复前缀
        currentPrefix = '/'
    }

    router.get = async (route, callback) => {
        router.request(route, 'get', callback)
    }

    router.post = async (route, callback) => {
        router.request(route, 'post', callback)
    }

    router.put = async (route, callback) => {
        router.request(route, 'put', callback)
    }

    router.delete = async (route, callback) => {
        router.request(route, 'delete', callback)
    }

    router.request = async (route, method, callback) => {
        let prefix = currentPrefix === '/' ? '' : currentPrefix
        // 完整路由
        route = prefix + route
        // 获取前缀里的所有方法
        let callbacks = requests.get(method) || new Map()
        // 设置回调
        callbacks.set(route, callback)
        // 设置方法
        requests.set(method, callbacks)
        // 添加路由
        routes.set(route, getUrlInfo(route))
    }
    return router
}
module.exports = Router
