import json
import os
from datetime import datetime
import random
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse


class ReviewRequest(BaseModel):
    reviewerName: str
    reviewerEmail: str
    rating: int
    comment: str


class NewsletterRequest(BaseModel):
    email: str

# json Files als Datenspeicherung
Newsletter_file = 'newsletter_mails.json'
Reviews_File = "rating_and_review.json"
app = FastAPI()

# Statische Dateien einbinden (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")


def calculate_rating(product_id):
    products = load_data(Reviews_File)
    total_rating = 0
    for product in products:
        if product["id"] == product_id:
            for review in product["reviews"]:
                total_rating += review["rating"]
            review_count = len(product["reviews"])
            with open(Reviews_File, "w") as file:
                product["rating"] = total_rating / len(product["reviews"]) if review_count > 0 else 0
                json.dump(products, file, indent=4)
            return total_rating / len(product["reviews"]) if review_count > 0 else 0

    return -1


def load_data(name):
    with open(name) as file:
        return json.load(file)


def save_review(review, product_id):
    if os.path.exists(Reviews_File):
        with open(Reviews_File, "r") as file:
            products = json.load(file)
            for product in products:
                if product["id"] == product_id:
                    product["reviews"].append(
                        {"reviewerName": review.reviewerName, "reviewerEmail": review.reviewerEmail,
                         "rating": review.rating, "comment": review.comment,
                         "date": str(datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ"))})
                    product["rating"] = calculate_rating(product_id)
                    break
        with open(Reviews_File, "w") as file:
            json.dump(products, file, indent=4)


def save_newsletter_mail(email):
    try:
        with open(Newsletter_file, "r") as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        raise HTTPException(status_code=500)
    data["mails"].append(email)
    with open(Newsletter_file, "w") as file:
        json.dump(data, file, indent=4)


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Startseite bereitstellen."""
    try:
        with open("static/index.html", "r") as file:
            return file.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Startseite nicht gefunden")


@app.get("/product", response_class=HTMLResponse)
async def serve_product():
    """Produktseite bereitstellen."""
    try:
        with open("static/product.html", "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Produktseite nicht gefunden")


@app.get("/products/new")
def new_products():
    data = load_data("data.json")['products']
    data.sort(key=lambda x: datetime.strptime(x['meta']['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ"))
    return data[:20]


@app.get("/products/bestseller")
def bestseller_products():
    data = load_data("data.json")['products']
    data.sort(key=lambda x: x['rating'], reverse=True)
    return data[:20]


@app.get("/products/recommended")
def recommended_products():
    data = load_data("data.json")['products']
    return random.sample(data, min(len(data), 20))


@app.get("/products/similar_items/{product_id}")
def similar_products(product_id: int):
    data = load_data("data.json")['products']
    category = next((product['category'] for product in data if product['id'] == product_id), None)

    if not category:
        raise HTTPException(status_code=404, detail="Product not found")

    similar = [product for product in data if product['category'] == category and product['id'] != product_id]
    return similar[:20]


@app.get("/products/{product_id}")
def get_product(product_id: int):
    """
    API-Endpunkt, der die Details eines Produkts basierend auf der ID liefert.
    """
    try:
        products = load_data("data.json")["products"]
        product = next((p for p in products if p["id"] == product_id), None)

        if not product:
            raise HTTPException(status_code=404, detail="Produkt nicht gefunden")

        return product
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Datenbankdatei nicht gefunden")


@app.get("/products/{product_id}/rating")
def get_rating(product_id: int):
    reviews = load_data(Reviews_File)
    rating = next((product["rating"] for product in reviews if product["id"] == product_id), None)

    if rating is None:
        raise HTTPException(status_code=404, detail="Rating not found")

    return rating


@app.get("/products/{product_id}/reviews")
def get_reviews(product_id: int):
    reviews = load_data(Reviews_File)
    product_reviews = next((product["reviews"] for product in reviews if product["id"] == product_id), None)

    if not product_reviews:
        raise HTTPException(status_code=404, detail="Reviews not found")

    return sorted(product_reviews, key=lambda x: datetime.strptime(x['date'], "%Y-%m-%dT%H:%M:%S.%fZ"), reverse=True)[
           :3]


@app.post("/products/{product_id}/review")
async def add_review(product_id: int, review: ReviewRequest):
    save_review(review, product_id)
    return {"message": "Review saved successfully"}


@app.post("/newsletter")
def newsletter(newsletter: NewsletterRequest):
    save_newsletter_mail(newsletter.email)
    return {"message": "Email saved successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)
