import json
from datetime import datetime
from random import random
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

Data_file = "data/data.json"


# Helper functions:
def load_data(name):
    """
    Load data from a json file
    :param name:
    :return: file content
    """
    with open(name) as file:
        return json.load(file)


@app.get("/new")
def new_products():
    """
    Needed for the home page (index.html / script.js) to get the newest products
    :return: 20 newest products
    """
    data = load_data(Data_file)['products']

    def sort_date(item):
        """
        Sort by date (key function for sorting)
        """
        print(item['meta']['createdAt'])
        print(datetime.strptime(item['meta']['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ"))
        return datetime.strptime(item['meta']['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ")

    data.sort(key=sort_date)
    return data[:20]


@app.get("/bestseller")
def bestseller_products():
    """
    Needed for the home page (index.html/ script.js) to get the bestseller products (right now the same 20 products with the highest rating)
    :return: 20 products with the best rating
    """
    # Todo sort by rating from rating_and_review.json so that reviews are updated
    data = load_data(Data_file)['products']

    def sort_rating(item):
        """
        Sort by rating (key function for sorting)
        :param item:
        :return:
        """
        return item['rating']

    data.sort(key=sort_rating, reverse=True)

    return data[:20]


@app.get("/recommended")
def recommended_products():
    """
    Needed for the home page (index.html / script.js) to get random recommended products
    :return: 20 random products
    """
    # 20 neusten aus data.json aus rating
    # lade daten
    data = load_data(Data_file)['products']
    return_array = []
    random_int_list = []
    for i in range(20):
        random_int = int(random() * len(data))
        while random_int in random_int_list:
            random_int = int(random() * len(data))
        random_int_list.append(random_int)
        return_array.append(data[random_int])

    return return_array


@app.get("/similar_items/{product_id}")
def similar_products(product_id: int):
    """
    Needed for the product page (product.html / product.js) to get similar products based on the category of the product
    :param product_id:
    :return: return maximum 20 similar products (same product category, as the product with the given id)
    """
    data = load_data(Data_file)['products']
    product_category = None
    # filter products by category
    for product in data:
        if product['id'] == product_id:
            product_category = product['category']
            break

    if not product_category:
        raise HTTPException(status_code=404, detail="Product with that id not found")

    filtered_data = [product for product in data if
                     product['category'] == product_category and product['id'] != product_id]

    return filtered_data[:20]


@app.get("/products/{product_id}")
def get_product(product_id: int):
    """
    Needed for the product page (product.html / product.js) to get the product by id and use product price, image and titel
    Get product by id
    :param product_id:
    :return: product with the given id
    """
    products = load_data(Data_file)['products']
    for product in products:
        if product["id"] == product_id:
            return product


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
