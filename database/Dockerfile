# Gunakan image PostgreSQL resmi
FROM postgres:13

# Set environment variables untuk database
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=mysecretpassword
ENV POSTGRES_DB=warehouse

# Copy file migrasi ke container
COPY ./migrations /docker-entrypoint-initdb.d/


# Expose port PostgreSQL
EXPOSE 5432