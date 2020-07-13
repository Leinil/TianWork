const handleRouter = require('./src/router/find')
const serverHandle = (req, res) => {
    // 设置返回格式
    res.setHeader('Content-type', 'application/json')
    const webData = handleRouter(req, res);
    if (webData) {
        res.end(JSON.stringify(webData))
        return 
    }
    res.writeHead(404,{'Content-type':'text/plain'})
    res.write("404 Not Found\n")
    res.end()
}
module.exports = serverHandle