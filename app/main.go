package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/shkh/lastfm-go/lastfm"
)

var db *sql.DB

// .env file, needs change to dockerfile
const (
	//host = "localhost"
	host = "psql_db"
	//host    = "172.17.0.2"
	dbport   = 5432
	user     = "maximilien"
	password = "verygoodsecurity"
	dbname   = "records"
	appport  = 8000
)

type Product struct {
	ID    int64   `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func main() {
	// connect to the postgresDB
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, dbport, user, password, dbname)
	//psqlInfo := "postgresql://postgres:password@psql_db:5432?sslmode=disable"
	db, err := sql.Open("postgres", psqlInfo)
	fmt.Println(psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println(fmt.Sprintf("Successfully connected to %s!! Nice!", dbname))

	// LAST FM connection
	api := lastfm.New("d966588655693e6ca5d6e0c1b78142c0", "5a11e218afd808b894843323291e39fc")

	result, _ := api.User.GetTopAlbums(lastfm.P{"user": "bmmckay", "period": "1month"}) //discarding error
	for _, album := range result.Albums {
		fmt.Println(fmt.Sprintf("album %v artist %v playcount %v image", album.Name, album.Artist.Name, album.PlayCount)) //album.Image["large"]))
	}
	// LAST FM connection

	// setting up the mux router
	router := mux.NewRouter()

	// telling the server what it should listen for, and what to do!
	router.HandleFunc("/api/products", getAllProducts)

	// creating the server
	fmt.Printf("Listening on port %s\n", strconv.Itoa(appport))
	if err := http.ListenAndServe(":"+strconv.Itoa(appport), router); err != nil {
		fmt.Println(err)
	}
}

// getAllProducts queries all products and runs getMultipleProducts to execute the query
func getAllProducts(w http.ResponseWriter, r *http.Request) {
	query := "SELECT * FROM products"
	// fmt.Println("getMultipleProductsCalled")
	getMultipleProducts(w, r, query)
	fmt.Println("finshed getAllProducts")
}

// getMultipleProducts queries & retrieves multiple products from the database
func getMultipleProducts(w http.ResponseWriter, r *http.Request, query string) {
	// fmt.Println("getMultipleProducts started...")
	setHeaders(w, r)
	// If it's a get request, we want to query and return the products
	if r.Method == http.MethodGet {
		products := []Product{}
		fmt.Println("initalized empty array of product structs")

		// Testing connection to DB, again
		// WHY IS THIS NECESSARY ? ?
		psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, dbport, user, password, dbname)
		db, err := sql.Open("postgres", psqlInfo)
		fmt.Println(fmt.Sprintf("Successfully connected to %s, Again!! Nice!", dbname))
		//
		//
		rows, err := db.Query(query)
		fmt.Println("ran db.Query(query)")
		if err != nil {
			fmt.Println("error querying products:")
			fmt.Println(err)
			return
		}
		// Taking all of the results & putting them into a Product struct
		// As long as there is a next row, we are defining which fields the product struct will be assigned
		for rows.Next() {
			var product Product
			err := rows.Scan(&product.ID, &product.Name, &product.Price)
			if err != nil {
				fmt.Println("error storing results:")
				fmt.Println(err)
				return
			}
			// Appending all product structs to the products slice
			products = append(products, product)
		}
		// Encoding the struct into JSON will allow us to access the JSON object using javascript
		json.NewEncoder(w).Encode(products)
	}
	// fmt.Println("end of getMultipleProducts Func")
}

// setHeaders sets the headers for the response
func setHeaders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// remove CORS wildcard!!!!!!!
	w.Header().Set("Access-Control-Allow-Origin", "*")
}
