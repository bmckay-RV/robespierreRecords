package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

const (
	host    = "localhost"
	dbport  = 5432
	user    = "postgres"
	dbname  = "robespierre_records_db"
	appport = 8000
)

type Product struct {
	ID    int64   `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func main() {
	// connect to the postgresDB
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"dbname=%s sslmode=disable",
		host, dbport, user, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println(fmt.Sprintf("Successfully connected to %s!! Nice!", dbname))

	// setting up the mux router
	router := mux.NewRouter()

	// telling the server what it should listen for, and what to do!
	router.HandleFunc("/api/products", getAllProducts)

	// creating the server
	// SHOULD THIS BE A DIFFRENT PORT THAN THE DB PORT ??? PROBABLY !!! FIX !!!
	fmt.Printf("Listening on port %s\n", strconv.Itoa(appport))
	if err := http.ListenAndServe(":"+strconv.Itoa(appport), router); err != nil {
		fmt.Println(err)
	}
}

// getAllProducts queries all products and runs getMultipleProducts to execute the query
func getAllProducts(w http.ResponseWriter, r *http.Request) {
	query := "SELECT Id, Name, Price FROM products"
	getMultipleProducts(w, r, query)
	fmt.Println("all product api run")
}

// getMultipleProducts queries & retrieves multiple products from the database
func getMultipleProducts(w http.ResponseWriter, r *http.Request, query string) {
	setHeaders(w, r)
	// If it's a get request, we want to query and return the products
	if r.Method == http.MethodGet {
		products := []Product{}
		rows, err := db.Query(query)
		if err != nil {
			fmt.Println(err)
			return
		}
		// Taking all of the results & putting them into a Product struct
		// As long as there is a next row, we are defining which fields the product struct will be assigned
		for rows.Next() {
			var product Product
			err := rows.Scan(&product.ID, &product.Name, &product.Price)
			if err != nil {
				fmt.Println(err)
				return
			}
			// Appending all product structs to the products slice
			products = append(products, product)
		}
		// Encoding the struct into JSON will allow us to access the JSON object using javascript
		json.NewEncoder(w).Encode(products)
	}
}

// setHeaders sets the headers for the response
func setHeaders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9090")
}
