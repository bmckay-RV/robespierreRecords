
// product object constructor
function Product (id, name, price){
    this.id = id;
    this.name = name;
    this.price = price;
}

// setting up the http request
let oReq = new XMLHttpRequest();
let url = document.url

// parseProductsResponse takes the response and parses it into an array of product objects
function parseProductsResponse(){
    // returned string into a json obj
    let products = JSON.parse(oReq.response)
    let productsArrayTemp = Array.from(products)
    // if array is empty, push the products object
    if (productsArrayTemp.length < 1) {
        productsArrayTemp.push(prod)
    }
    // creating array of product objects
    let productArray = []
    for (let i = 0; i < productsArrayTemp.length; i++) {
        let obj = new Product(productsArrayTemp[i].id, productsArrayTemp[i].name, productsArrayTemp[i].price); 
        productArray.push(obj);
      }
    console.log(`new productArray ${productArray}`)
    return productArray
}
// showAllProducts does the DOM manipulation for the product information
function showAllProducts(array){
    const container = document.getElementById('product-container')
    for (let i = 0; i < array.length; i++){
        console.log("adding products to html")
        const content = `
            <div class="product-card">
                <div class="product-info">
                    <p class="product-name">${array[i].name}</p>
                    <p class="product-price">${array[i].price}</p>
                </div>
            </div>
        `;
        container.innerHTML+=content
    }
}

function init() {
    // // sets endpoint for specific product
    // let productId = url.split('?pid=')[1]
    // let productApiString ='http://localhost:8000/api/products/' + productId

    // sets endpoint for product ingestion call
    oReq.open('GET', 'http://localhost:8000/api/products');
    oReq.send();

    // listener function to get product data, and edit the page
    oReq.onload = function () {
        if(oReq.status >= 200 && oReq.status < 300) {
            console.log("The request status is between 200 & 300. YOU DID IT")
            let products = parseProductsResponse()
            showAllProducts(products)    
        } else {
            // if request fails
            console.log(`The request failed, with status: ${oReq.status}`)
        }
    };
}

init();

