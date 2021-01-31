
// product object constructor
function Product (id, name, price, photo, listenCount){
    this.id = id;
    this.name = name;
    this.price = parseFloat(price);
    this.photo = photo;
    this.listenCount = parseInt(listenCount);
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
        let obj = new Product(productsArrayTemp[i].id, productsArrayTemp[i].name, productsArrayTemp[i].price, productsArrayTemp[i].photo, productsArrayTemp[i].listenCount); 
        // console.log("photolink: " + productsArrayTemp[i].photo)
        // console.log("listenCount: " + productsArrayTemp[i].listenCount)
        productArray.push(obj);
      }
    return productArray
}
// showAllProducts does the DOM manipulation for the product information
function showAllProducts(array){
    const container = document.getElementById('product-container');
    console.log(array[0].name)
    for (i = 0; i < array.length; i++){
       // console.log("adding products to html")
       console.log(array[i].name)
        const content = `
            <div class="product-card">
                <img src="${array[i].photo}">
                <div class="product-info">
                    <p class="product-name">${array[i].name}</p>
                    <p class="product-price">$ ${array[i].price}</p>
                </div>
            </div>
        `;
        container.innerHTML+=content
    }
}

function getArtistList(products){
    let list = document.getElementById('artist-select');
    products.sort(compareValues('name'));
    products.forEach(function(r) {
        list.options[list.options.length]= new Option(r.name,r.name)
    })
}

function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }

      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

function filterProducts(){
    var paras = document.getElementsByClassName('product-card')
    while(paras[0]){
        paras[0].parentNode.removeChild(paras[0])
    }
    let productTemp = products.slice();
    var artist_select = document.getElementById('artist-select').value
    if(artist_select != "default"){
        for(i=0; i<productTemp.length;i++){
            //change to r.artist once available!!!
            if (productTemp[i].name != artist_select){
                delete productTemp[i]
            }      
        }
    }
    var ele = document.getElementsByName('sort');
    let filters = ''
    for (i=0;i<ele.length;i++){
        if(ele[i].checked){
            filters = ele[i].value
        }
    }
    console.log(products.length)
    console.log("filter: " + filters)
    if(filters == "price_desc"){
        showAllProducts(productTemp.sort(compareValues('price', 'desc')))
    } else if(filters == "price_asc"){
        productTemp.sort(compareValues('price'))
        console.log(productTemp[0].name)
        showAllProducts(productTemp)
    } else if(filters == "listen_count_asc"){
        showAllProducts(productTemp.sort(compareValues('listenCount')))
    } else if(filters == "listen_count_desc"){
        showAllProducts(productTemp.sort(compareValues('listenCount', 'desc')))
    } else {
        console.log("did not filter products")
        console.log(productTemp[0].name)
        showAllProducts(productTemp);
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
            products = parseProductsResponse()
            showAllProducts(products)  
            getArtistList(products)  
        } else {
            // if request fails
            console.log(`The request failed, with status: ${oReq.status}`)
        }
    };
}

init();

