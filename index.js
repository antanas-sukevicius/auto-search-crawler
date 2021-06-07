const cars = require("./getCars");
const url = "https://autogidas.lt/skelbimai/automobiliai/?f_1%5B0%5D=";
const carModel = "Alfa+Romeo"
const hostUrl = "https://autogidas.lt";
const fs = require('fs');

(async () => {

    const carList = await cars.getCarListFromPage("https://autogidas.lt/skelbimai/automobiliai/?f_1%5B0%5D=" + carModel)
    for (let p = 0; p < carList.length; p++) {
        const pageList = carList[p];
        
        console.log("parsing data");

        for (let c = 0; c < pageList.length; c++) {
            const element = pageList[c];
            a = hostUrl + element.href;
            console.log(element.href)
            element["details"] = await cars.getCarDetails(hostUrl + element.href)
            
        }
    }

    fs.writeFileSync(carModel+"-data.json", JSON.stringify(carList, null, 4));
    console.log("completed");
    
}
)()
