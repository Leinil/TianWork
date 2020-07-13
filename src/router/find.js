const handleRouter = (req, res) => {
    const method = req.method
    const url = req.url
    const path = url.split('?')[0]

    // 获取网页信息
    if (method === 'GET' && path === 'getPage') {
        return {
            msg: '网页信息获取成功'
        }
    }
}
module.exports = handleRouter;