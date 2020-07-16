const http = require('https')
const cheerio = require('cheerio')
const querystring = require('querystring');
const handleRouter = async (req, res) => {
    const method = req.method
    const url = req.url
    const path = url.split('/')[1]
    if (method === 'POST' && path === 'findPosition') {
        const paqures = await getPostData(req).then(async res => {
            const params = querystring.parse(res)
            const crawlerRes = await singleCrawler(params)
            if (Array.isArray(crawlerRes)) {
                return {
                    code: 200,
                    msg: '数据获取成功',
                    crawlerRes
                }
            }else{
                return crawlerRes
            }
        });
        return paqures
    }
    return {
        msg: '接口地址有误'
    }
}

// 处理post请求参数
const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        let postData = '';
        req.on('data', chunk => {
            postData += chunk.toString();
        })
        req.on('end', () => {
            resolve(postData)
        })
    })
    return promise
}

// 爬虫
function singleCrawler(params) {
    const { webUrl, productName, priceClass = '.a-size-base-plus', parentClass = '.s-result-item' } = params;
    return new Promise((resolve, reject) => {
        try {
            http.get(webUrl, function (res) {
                let html = "";
                res.setEncoding('utf-8')
                res.on('data', function (chunk) {
                    html += chunk;
                })
                res.on('end', function () {
                    const $ = cheerio.load(html)
                    const findArr = []
                    $(priceClass).each(function (index, item) {
                        const eachName = $(item).text();
                        if (eachName.indexOf(productName) !== -1) {
                            const num = $(item).parents(parentClass).attr('data-index')
                            findArr.push(num)
                        }
                    })
                    resolve(findArr)
                })
            })
        } catch{
            resolve({
                data: 1001,
                msg: '信息爬取失败,检查网页地址和各类参数，若均正确则可能达到了爬取限制！那你就联系我吧'
            })
        }
    })
}

module.exports = handleRouter;