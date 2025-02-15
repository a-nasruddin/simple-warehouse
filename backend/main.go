package main

import (
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gorilla/mux"
    _ "github.com/lib/pq"
    "github.com/joho/godotenv" // Import godotenv
    "github.com/rs/cors"
)

var db *sql.DB

type Product struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Stock int    `json:"stock"`
}

func initDB() {
    // Load environment variables from .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Buat connection string dari environment variables
    connStr := "user=" + os.Getenv("DB_USER") +
        " password=" + os.Getenv("DB_PASSWORD") +
        " dbname=" + os.Getenv("DB_NAME") +
        " host=" + os.Getenv("DB_HOST") +
        " port=" + os.Getenv("DB_PORT") +
        " sslmode=disable"

    // Retry logic untuk menunggu database siap
    for i := 0; i < 5; i++ {
        db, err = sql.Open("postgres", connStr)
        if err == nil {
            err = db.Ping()
            if err == nil {
                log.Println("Connected to the database successfully!")
                return
            }
        }
        log.Printf("Attempt %d: Failed to connect to the database. Retrying...\n", i+1)
        time.Sleep(5 * time.Second) // Tunggu 5 detik sebelum retry
    }

    log.Fatal("Error connecting to the database:", err)
}

func getProducts(w http.ResponseWriter, r *http.Request) {
    rows, err := db.Query("SELECT id, name, stock FROM products")
    if err != nil {
        log.Println("Error querying the database:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var products []Product
    for rows.Next() {
        var p Product
        if err := rows.Scan(&p.ID, &p.Name, &p.Stock); err != nil {
            log.Println("Error scanning row:", err)
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        products = append(products, p)
    }

    // Jika tidak ada data, kirim response kosong
    if len(products) == 0 {
        log.Println("No products found in the database.")
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]Product{}) // Kirim array kosong
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(products)
}

func addProduct(w http.ResponseWriter, r *http.Request) {
    var newProduct Product
    err := json.NewDecoder(r.Body).Decode(&newProduct)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Insert data ke database
    query := `INSERT INTO products (name, stock) VALUES ($1, $2) RETURNING id`
    err = db.QueryRow(query, newProduct.Name, newProduct.Stock).Scan(&newProduct.ID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(newProduct)
}

func updateProduct(w http.ResponseWriter, r *http.Request) {
    var updatedProduct Product
    err := json.NewDecoder(r.Body).Decode(&updatedProduct)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Update data di database
    query := `UPDATE products SET name = $1, stock = $2 WHERE id = $3`
    _, err = db.Exec(query, updatedProduct.Name, updatedProduct.Stock, updatedProduct.ID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(updatedProduct)
}

func deleteProduct(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    // Hapus data dari database
    query := `DELETE FROM products WHERE id = $1`
    _, err := db.Exec(query, id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent) // Response 204 (No Content)
}

func main() {
    initDB()
    r := mux.NewRouter()

    // Endpoint untuk mendapatkan data produk
    r.HandleFunc("/products", getProducts).Methods("GET")

    // Endpoint untuk menambah data produk
    r.HandleFunc("/products", addProduct).Methods("POST")

    // Endpoint untuk mengupdate data produk
    r.HandleFunc("/products/{id}", updateProduct).Methods("PUT")

    // Endpoint untuk menghapus data produk
    r.HandleFunc("/products/{id}", deleteProduct).Methods("DELETE")

    // Tambahkan CORS middleware
    c := cors.New(cors.Options{
        AllowedOrigins: []string{"*"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    })

    handler := c.Handler(r)
    log.Println("Server started on :8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}