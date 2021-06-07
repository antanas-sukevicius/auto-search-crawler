const axios = require('axios')
const cheerio = require("cheerio");

async function getCars() {
    await axios.get("https://autogidas.lt/")
        .then((response) => extractCars(response.data)
        )
    return carList;
}

async function getCarDetails(url) {
    await axios.get(url)
        .then((response) =>
            carDetaisl = extractCarDetails(response.data)
        )
        .catch(function (error) {
            carDetaisl = "Car deleted"
        })

    return carDetaisl;
}

function extractCarDetails(html) {
    let carParam = {};
    let carPhotos = [];
    const $ = cheerio.load(html);

    photosHref = $(".photo-thumb img");

    photosHref.each((i, e) => carPhotos.push($(e).attr("data-src")));

    carDetails = $(".params-block .param");
    if (carDetails.length == 0) {
        return ""
    }

    carDetails.each((i, param) =>
        carParam[$(param).find(".left").text().trim()] = $(param).find(".right").text().trim().replace(/\s\s+/g, ' ')
    );

    comment = $(".comments").text()

    carParam["Komentaras"] = comment;
    carParam["Nuotraukos"] = carPhotos;
    return carParam;
}

function extractCars(html) {

    lookForString = '{"value":""'
    x1 = html.search(lookForString)
    htmlRight = html.substring(x1 - 1, html.length)
    x2 = htmlRight.search("]")

    stringCars = htmlRight.substring(0, x2 + 1)
    jsonCars = JSON.parse(stringCars, null, 4)

    jsonCarsFiltered = jsonCars.filter((obj) => {
        return obj.count > 0
    })

    carList = jsonCarsFiltered;
}


async function getCarListFromPage(url) {
    let carlist = [];
    let pageCount;

    await axios.get(url)
        .then(function (response) {
            pageCount = parseInt(extractPageCount(response.data)) || 1;
        })

    for (let page = 1; page < pageCount + 1; page++) {
        urlPage = url + "&page=" + page
        await axios.get(urlPage)
            .then(function (response) {
                carlist.push(extractCarListFromPage(response.data));
                console.log(urlPage);
            })
    }
    return carlist;
}

function extractPageCount(html) {
    const $ = cheerio.load(html);
    itemsHtml = $('.page.last').parent().prev();
    pageCount = itemsHtml.text();
    return pageCount
}

function extractCarListFromPage(html) {
    let carList = [];
    const $ = cheerio.load(html);
    itemsHtml = $('article.list-item');
    itemsHtml.each((i, e) => {

        autoName = $(e).find('.item-title').text();
        autoDescription = $(e).find('.primary').text();
        autoPrice = $(e).find(".item-price meta[itemprop='price']").attr('content');
        autoCurrency = $(e).find(".item-price meta[itemprop='priceCurrency']").attr('content');
        autoHref = $(e).find("a").attr("href");

        jsonItem = {
            name: autoName,
            desc: autoDescription,
            price: autoPrice,
            currency: autoCurrency,
            href: autoHref
        }
        carList.push(jsonItem)
    })
    return carList;
}

module.exports.getCars = getCars;
module.exports.getCarListFromPage = getCarListFromPage;
module.exports.getCarDetails = getCarDetails;