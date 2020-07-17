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
            if (params.searchType === 'single') {
                const crawlerRes = await singleCrawler(params)
            } else {
                const crawlerRes = await autoCrawler(params)
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
    const finallRes=[];
    const pageStart = typeof (Number(webUrl.substr(-1))) === 'number' ? Number(webUrl.substr(-1)) : 1
    const urls = [];
    for (let i = pageStart; i <= 7; i++) {
        urls.push(i)
    }
    // const textPromises = urls.map(async url => {
    //     webUrl=
    //     const response = await fetch(url);
    //     return response.text();
    // });

    // 按次序输出
    for (const textPromise of textPromises) {
        console.log(await textPromise);
    }
}
// 爬虫
function singleCrawler(params) {
    const { webUrl, productName, priceClass = '.a-size-base-plus', parentClass = '.s-result-item' } = params;
    return new Promise((resolve, reject) => {
        try {
            superagent.get(webUrl).set('Cookie', 'session-id=144-9264453-9303432; session-id-time=2082787201l; i18n-prefs=USD; sp-cdn="L5Z9:CN"; x-wl-uid=16XEs/589XbEm7t2FwfRCzB6lCX3YsFQGgA1T12U/nwshIkcmgchxve6txcvOAtZyTfz36eXmgZ0=; ubid-main=130-8641508-2666163; session-token=fwJ8iTidzkLYWdnYnMPqET8L3FhCi+XbIJxm7p8sEKaUMexUBaJXUurJ3+xjbr+vJHR0QiyDv/UN4w4qi3TM8c6KGutayLxIWeHBR6nSyNaUbf1HAOOSwWZ/5wuY2D2Oj0EhSv1ZHi+aW3B7UyhoAYqyci9tFNeWbjEKfB05X6BNHcVff3n/8/RfBVowKZuAQUzCNr3rkdscC7kkW4Sgo7YKbptadOPUo4tpem/hvCau1QpHtgpGi3TLRUgZidbX; csm-hit=tb:FF9M4RXG0SE10KYS990G+s-FF9M4RXG0SE10KYS990G|1594970060906&t:1594970060906&adb:adblk_no')
                .end(function (err, res) {
                    if (err) {
                        // 爬取过程中报错
                        return resolve({
                            msg: err,
                            data: 500
                        })
                    }
                    const $ = cheerio.load(res.text)
                    const findArr = []
                    $(priceClass).each(function (index, item) {
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