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
