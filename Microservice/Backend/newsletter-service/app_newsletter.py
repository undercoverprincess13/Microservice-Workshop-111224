import json
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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

Newsletter_file = 'data/newsletter_mails.json'


# Helper functions:
# Define the model for the newsletter request
class NewsletterRequest(BaseModel):
    email: str


def save_newsletter_mail(email):
    """
    Save the email to the Newsletter_file (newsletter_mails.json)
    :param email:
    """
    try:
        with open(Newsletter_file, "r") as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        raise HTTPException(status_code=500)
    data["mails"].append(email)
    with open(Newsletter_file, "w") as file:
        json.dump(data, file, indent=4)


@app.post("/newsletter")
def newsletter(newsletter: NewsletterRequest):
    """
    Save the email to the Newsletter_file (newsletter_mails.json)
    :param newsletter:
    :return: message that email was saved successfully
    """
    try:
        save_newsletter_mail(newsletter.email)
        return {"message": "Email saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5003)
