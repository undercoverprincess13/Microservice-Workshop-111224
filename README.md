# Microservice Project

This project is a microservice-based application that includes an API Gateway, Product Service, Review Service, Newsletter Service, and a Frontend. The services are containerized using Docker and orchestrated with Docker Compose. Additionally, the project can be run as a monolithic application.

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Monolithic Setup](#monolithic-setup)
- [License](#license)

## Project Structure

```plaintext
.
├── Microservice-Workshop
│   ├── Microservice
│   │   ├── Backend
│   │   │   ├── newsletter-service
│   │   │   │   ├── data
│   │   │   │   │   └── newsletter_mails.json
│   │   │   │   ├── app_newsletter.py
│   │   │   │   └── Dockerfile
│   │   │   ├── product-service
│   │   │   │   ├── data
│   │   │   │   │   └── data.json
│   │   │   │   ├── app_product.py
│   │   │   │   └── Dockerfile
│   │   │   ├── review-service
│   │   │   │   ├── data
│   │   │   │   │   └── rating_and_review.json
│   │   │   │   ├── app_review.py
│   │   │   │   └── Dockerfile
│   │   ├── Frontend
│   │   │   ├── Dockerfile
│   │   │   ├── index.html
│   │   │   ├── product.html
│   │   │   ├── product.js
│   │   │   ├── product_style.css
│   │   │   ├── script.js
│   │   │   ├── style.css
│   │   │   ├── api-gateway.Dockerfile
│   │   │   ├── api-gateway.py
│   │   │   └── docker-compose.yml
│   ├── Monolith
│       ├── static
│       │   ├── index.html
│       │   ├── product.html
│       │   ├── product.js
│       │   ├── product_style.css
│       │   ├── script.js
│       │   └── style.css
│       ├── data.json
│       ├── Dockerfile
│       ├── newsletter_mails.json
│       ├── rating_and_review.json
│       └── server.py
└── README.md

```


## Technologies Used

- **Python**: Backend services
- **FastAPI**: Web framework for building APIs
- **Uvicorn**: ASGI server for FastAPI
- **JavaScript**: Frontend
- **Docker**: Containerization
- **Docker Compose**: Container orchestration

## Setup and Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/your-repo.git
    
    ```

2. **Build and run the containers**:
    ```sh
    docker-compose up --build
    ```

3. **Access the application**:
    - Frontend: `http://localhost:3000`
    - API Gateway: `http://localhost:8080`

## Usage

- The frontend allows users to browse products, view product details, and submit reviews.
- The API Gateway routes requests to the appropriate backend services.

## API Endpoints

### Product Service

- `GET /products/new`: Get new products
- `GET /products/bestseller`: Get bestsellers
- `GET /products/recommended`: Get recommended products
- `GET /products/products/{id}`: Get product details by ID
- `GET /products/similar_items/{id}`: Get similar products by ID

### Review Service

- `GET /reviews/{product_id}/rating`: Get product rating
- `GET /reviews/{product_id}/reviews`: Get product reviews
- `POST /reviews/{product_id}/review`: Submit a product review

### Newsletter Service

- `POST /newsletter/newsletter`: Subscribe to the newsletter

## Monolithic Setup

To run the application as a monolithic application:

1. **Build the Docker image**:
    ```sh
    docker build -t my-monolith .
    ```

2. **Run the Docker container**:

    - **Without persistent storage**:
        ```sh
        docker run -p 8081:8081 my-monolith
        ```

    - **With persistent storage using Docker Volumes**:
        ```sh
        docker run -d -p 8088:8088 -v 
        ```

4. **Access the application**:
    - `http://localhost:8081`


## License

This project is licensed under the MIT License.
