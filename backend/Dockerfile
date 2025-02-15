# Gunakan image Golang resmi
FROM golang:1.20

# Set working directory di dalam container
WORKDIR /app

# Copy file go.mod dan go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy seluruh kode ke container
COPY . .

# Build aplikasi
RUN go build -o warehouse-backend .

# Expose port aplikasi
EXPOSE 8080

# Jalankan aplikasi
CMD ["./warehouse-backend"]