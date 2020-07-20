const http = require('https')
const cheerio = require('cheerio')
const querystring = require('querystring');
var superagent = require('superagent');
const { isNumber } = require('util');
const handleRouter = async (req, res) => {
    const method = req.method
    const url = req.url
    const path = url.split('/')[1]
    if (method === 'POST' && path === 'findPosition') {
        const paqures = await getPostData(req).then(async res => {
            const params = querystring.parse(res)
            let crawlerRes = []
            if (params.searchType === 'single') {
                console.log('----------------单页面查询----------------')
                crawlerRes = await singleCrawler(params)
            } else {
                console.log('----------------多页面查询----------------')
                crawlerRes = await autoCrawler(params)
            }
            if (Array.isArray(crawlerRes)) {
                return {
                    code: 200,
                    msg: '数据获取成功',
                    crawlerRes
                }
            } else {
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
const autoCrawler = async (params) => {
    // 并发读取远程URL
    let { webUrl } = params
    const pageStart = typeof (Number(webUrl.substr(-1))) === 'number' ? Number(webUrl.substr(-1)) : 1
    const urls = [];
    let finallRes=[];
    for (let i = pageStart; i <= 7; i++) {
        urls.push(i)
    }
    for(let i=0;i<urls.length;i++){
        const url=urls[i];
        const pageIndex = webUrl.indexOf('page');
        const webArr = [...webUrl]
        webArr.pop();
        webArr.push(url)
        webArr.splice(pageIndex + 5, 1, url)
        params['webUrl'] = webArr.join('');
        const response = await singleCrawler(params);
        if(response.length>0){
            finallRes=finallRes.concat(response)
        }
    }
    return finallRes
}

function waitRes(){

}
// 爬虫
function singleCrawler(params) {
    const { webUrl, productName, priceClass = '.a-size-base-plus', parentClass = '.s-result-item',Cookie } = params;
    return new Promise((resolve, reject) => {
        try {
            superagent.get(webUrl).set('Cookie', Cookie)
                .end(function (err, res) {
                    if (err) {
                        // 爬取过程中报错
                        return resolve({
                            msg: err,
                            data: 500
                        })
                    }
                    console.log(` 针对网址:  ${webUrl}    ---------------        进入分析阶段 `)
                    const $ = cheerio.load(res.text)
                    const findArr = []
                    $('.a-size-base-plus').each(function (index, item) {
                        const eachName = $(item).text();
                        if (eachName.indexOf(productName) !== -1) {
                            const page = isNumber(Number(webUrl.substr(-1))) ? Number(webUrl.substr(-1)) : 1
                            // 获取位置信息
                            const num = $(item).parents(parentClass).attr('data-index');
                            // 获取图片
                            const img = $(item).parents('.a-spacing-medium').find('img').attr('src');
                            // 判断是不是广告
                            const ad = $(item).parents('.a-size-mini').siblings().length;
                            findArr.push({
                                location: `P${page}R${Math.ceil(num / 4)}`,
                                advertise: ad ? true : false,
                                img
                            })
                        }
                    })
                    resolve(findArr)
                })
        } catch{
            resolve({
                data: 500,
                msg: '信息爬取失败,检查网页地址和各类参数，若均正确则可能达到了爬取限制！那你就联系我吧'
            })
        }
    })
}

module.exports = handleRouter;