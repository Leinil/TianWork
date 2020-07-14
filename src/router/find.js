const http = require('https')
const cheerio = require('cheerio')
const querystring = require('querystring');
const handleRouter = async (req, res) => {
    const method = req.method
    const url = req.url
    const path = url.split('?')[0]
    const params = querystring.parse(url.split('?')[1])
    // 接口地址
    if (method === 'GET' && path === '/getPage') {
        // 缺网页地址，网页页码，物品名称
        const { webUrl, page, proName } = params;
        const res = await getNum()
        return {
            data: res,
            msg: '信息获取成功'
        };
    }
    return {
        msg: '接口地址有误'
    }
}

function getNum() {
    return new Promise((resolve, reject) => {
        try {
            http.get('https://www.amazon.cn/s?k=%E9%9B%A8%E4%BC%9E&__mk_zh_CN=%E4%BA%9A%E9%A9%AC%E9%80%8A%E7%BD%91%E7%AB%99&ref=nb_sb_noss', function (res) {
                let html = "";
                res.setEncoding('utf-8')
                res.on('data', function (chunk) {
                    html += chunk;
                })
                res.on('end', function () {
                    const $ = cheerio.load(html)
                    const price = $("span.a-size-base-plus").each(function (index, item) {
                        const productName = $(item).text();
                        // 要换
                        if (productName.indexOf('Gaudi-Barcelona Stick') !== -1) {
                            console.log('获取到了')
                            //parents是根据class获取我的预期元素
                            const num = $(item).parents('.s-result-item').attr('data-index')
                            resolve(num)
                        }
                    })
                })
            })
        } catch{
            reject('信息爬取失败,可能达到了爬取限制')
        }
    })
}

module.exports = handleRouter;