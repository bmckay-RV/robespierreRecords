// product object constructor
function Product(id, name, artist, mbid, price, photo, listenCount) {
    this.id = id;
    this.name = name;
    this.artist = artist;
    this.mbid = mbid;
    this.price = parseFloat(price);
    this.photo = photo;
    this.listenCount = parseInt(listenCount);
}
// setting up the http request
let oReq = new XMLHttpRequest();
let url = document.url

// parseProductsResponse takes the response from the app api and parses it into an array of product objects, 
// used for product listing
function parseProductsResponse() {
    // returned string into a json obj
    let products = JSON.parse(oReq.response)
    let productsArrayTemp = Array.from(products)
    if (productsArrayTemp.length < 1) {
        console.log("error: initialized empty product array after parsing json")
    }
    // creating array of product objects
    let productArray = []
    for (let i = 0; i < productsArrayTemp.length; i++) {
        let obj = new Product(productsArrayTemp[i].id, productsArrayTemp[i].name, productsArrayTemp[i].artist, productsArrayTemp[i].mbid, productsArrayTemp[i].price, productsArrayTemp[i].photo, productsArrayTemp[i].listenCount);
        productArray.push(obj);
    }
    return productArray
}
// really simple function, parses the response from the public last.fm api used for the product detail page 
function parseAlbumResponse() {
    const response = JSON.parse(oReq.response)
    console.log(response.album["name"])
    return response.album;
}
// populates the autocompletion dropdown list of artist names
function getArtistList(products) {
    let list = document.getElementById('artist-select');
    let temp_artists = products.slice()
    // this is probably slower than removing uniques before sorting ... but the set thing is easier :-) lazy!
    temp_artists.sort(compareValues('artist'));
    let unique = [...new Set(temp_artists.map(a => a.artist))];
    unique.forEach(function (r) {
        list.options[list.options.length] = new Option(r, r)
    })
}
// populates the autocompletion dropdown list of album names
function getAlbumList(products) {
    let list = ''
    let temp_albums = products.slice()
    temp_albums.sort(compareValues('album'));
    temp_albums.forEach(function (r) {
        list += '<option value="&artist=' + r.artist + '&album=' + r.name + '" label="' + r.name + '"/>'
        // list += '<option value="' + r.name + '"/>'
    })
    document.getElementById('album-list').innerHTML = list
}
// custom sorting function, fancy!
function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }
        const varA = (typeof a[key] === 'string') ?
            a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ?
            b[key].toUpperCase() : b[key];

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
// does the filtering of the SoT products array, calls showAllProducts() on a new array subset (counterintuitive!)
function filterProducts() {
    // removes all the current products from the page
    var paras = document.getElementsByClassName('product-card')
    while (paras[0]) {
        paras[0].parentNode.removeChild(paras[0])
    }
    // creates a copy (by value) of the product array
    var productTemp = products.slice();
    var artist_select = document.getElementById('artist-select').value
    if (artist_select != "default") {
        for (i = 0; i < productTemp.length; i++) {
            if (productTemp[i].artist != artist_select) {
                delete productTemp[i]
            }
        }
    }
    // if user inputted an album, redirect to the detail page based on the input value (not label! This is gross )
    // and should be fixed! Fails in cases of searching for anything not autocompleted!!!
    var album_select = document.getElementById('album-select').value
    if (album_select != "") {
        console.log("album_select" + album_select)
        window.location.href = 'detail.html?' + album_select
    }
    var ele = document.getElementsByName('sort');
    let filters = ''
    // finds first cehcked radio button
    for (i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            filters = ele[i].value
        }
    }
    console.log("full product array length" + products.length)
    console.log("filter: " + filters)
    if (filters == "price_desc") {
        showAllProducts(productTemp.sort(compareValues('price', 'desc')))
    } else if (filters == "price_asc") {
        productTemp.sort(compareValues('price'))
        console.log(productTemp[0].name)
        showAllProducts(productTemp)
    } else if (filters == "listen_count_asc") {
        showAllProducts(productTemp.reverse())
    } else if (filters == "listen_count_desc") {
        showAllProducts(productTemp)
    } else {
        console.log("did not filter products")
        showAllProducts(productTemp);
    }
}
// showAllProducts does the DOM manipulation for the product information
function showAllProducts(array) {
    const container = document.getElementById('product-container');
    console.log("array[0].name" + array[0].name)
    for (i = 0; i < array.length; i++) {
        // console.log("adding products to html")
        // console.log(array[i].name)
        const content = `
            <div class="product-card">
            <a href="detail.html?&artist=${array[i].artist}&album=${array[i].name}">
                <img src="${array[i].photo}" alt="${array[i].name} Album Art">
                </a>
                <div class="product-info">
                    <p class="product-name">${array[i].name}</p>
                    <p class="product-artist">${array[i].artist}</p>
                    <p class="product-price">$ ${array[i].price}</p>
                </div>
            </div>
        `;
        container.innerHTML += content
    }
}
// injects the album detail container based on response from album call, last.fm call
function showAlbumDetail(album) {
    const container = document.getElementById('detail-container');
    let content = `
            <div class="album-card">
                <img src="${album.image["4"]["#text"]}" alt=${album.name}>
                <div class="album-info">
                    <p class="album-name">${album.name}</p>
                    <a> by </a></br>
                    <p class="album-artist">${album.artist}</p>                    
    `;
    if (album.wiki) {
        content += `
            <p class="album-summary"> ${album.wiki["summary"]} </p>
        `
    }
    if (album["tracks"].length > 0) {
        content += `
        <a> tracks: </a></br>
        <ol class="track-list">
    `
        for (i = 0; i < album["tracks"]["track"].length; i++) {
            content += `
            <li class="track-name">${album.tracks["track"][i]["name"]}</li>
            `
        }
        content += `</ol>`
    }
    if (album["tags"]["tag"].length > 0) {
        content += `
            <a> tags: </a></br>
            <ul class="tag-list">
    `
        for (i = 0; i < album["tags"]["tag"].length; i++) {
            content += ` 
            <li class="tag"> ${album.tags["tag"][i]["name"]} </li>
            `
        }
        content += `
        </ul>
    `
    }
    content += `
            </ul>
        </div>
    </div>
    `
    container.innerHTML += content

}

function init() {
    var currentUrl = window.location.href.split('/').pop()
    if (currentUrl == "product.html") {
        // sets endpoint for product ingestion call
        oReq.open('GET', 'http://localhost:8000/api/products');
        oReq.send();

        // listener function to get product data, and edit the page
        oReq.onload = function () {
            if (oReq.status >= 200 && oReq.status < 300) {
                console.log("The request status is between 200 & 300. YOU DID IT")
                products = parseProductsResponse()
                showAllProducts(products)
                getArtistList(products)
                getAlbumList(products)
            } else {
                // if request fails
                console.log(`The request failed, with status: ${oReq.status}`)
            }
        };
    } else if (currentUrl.split('?')[0] == "detail.html") {
        // HOW TO STORE JS SECRETS????????? THIS BAD!
        // LIKE REALLY REALLY BAD
        let requestUrl = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=d966588655693e6ca5d6e0c1b78142c0' + currentUrl.split('?').pop() + '&format=json'
        console.log(requestUrl)
        oReq.open('GET', requestUrl);
        oReq.send();
        // listener function to get album data, and edit the page
        oReq.onload = function () {
            if (oReq.status >= 200 && oReq.status < 300) {
                console.log("The request status is between 200 & 300. YOU DID IT")
                album = parseAlbumResponse();
                showAlbumDetail(album)
            } else {
                // if request fails
                console.log(`The request failed, with status: ${oReq.status}`)
            }
        };
    }

}

init();