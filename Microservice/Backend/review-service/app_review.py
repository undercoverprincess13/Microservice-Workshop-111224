import json
import os
from datetime import datetime
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Define the model for the review request
class ReviewRequest(BaseModel):
    reviewerName: str
    reviewerEmail: str
    rating: int
    comment: str


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

Reviews_File = "data/rating_and_review.json"


# Helper functions::
def calculate_rating(product_id):
    """
    Calculate the rating of a product based on the reviews
    :param product_id:
    :return: rating for product with product_id
    """
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
    """
    Load data from a json file
    :param name:
    :return: file content
    """
    with open(name) as file:
        return json.load(file)


def save_review(review, product_id):
    """
    Save a review to a product (product_id)
    :param review:
    :param product_id:

    """
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


@app.get("/{product_id}/rating")
def get_rating(product_id: int):
    """
    Get the rating of a product based on its product_id
    :param product_id:
    :return: rating of the product
    """



@app.get("/{product_id}/reviews")
def get_reviews(product_id: int):
    """
    Get the reviews of a product based on its product_id
    :param product_id:
    :return: the 3 newest reviews of the product
    """


@app.post("/{product_id}/review")
async def add_review(product_id: int, review: ReviewRequest):
    """
    Add a review to a product based on its product_id
    :param product_id:
    :param review:
    :return: message if the review was saved successfully
    """



if __name__ == "__main__":
    """
    Start the review-service which runs on port 5002
    """
    uvicorn.run(app, host="0.0.0.0", port=5002)
