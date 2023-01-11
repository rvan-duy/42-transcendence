# Use an official Postgres image as the base image
FROM postgres:12

# Set the environment variables for the Postgres user, password, and database
ENV POSTGRES_USER dbuser
ENV POSTGRES_PASSWORD dbpassword
ENV POSTGRES_DB dbname

# Expose port 5432 to the host
EXPOSE 5432

# Create a volume for the Postgres data directory
VOLUME /var/lib/postgresql/data
