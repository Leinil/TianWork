const handleRouter = require('./src/router/find')
const serverHandle = async (req, res) => {
    // 设置返回格式
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*'//可以是*，也可以是跨域的地址
    })
    const webData = await handleRouter(req, res);
    if (webData) {
        res.end(JSON.stringify(webData))
        return
    }
    res.writeHead(404, { 'Content-type': 'text/plain' })
    res.write("404 Not Found\n")
    res.end()
}
module.exports = serverHandle