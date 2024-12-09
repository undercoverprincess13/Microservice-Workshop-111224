from fastapi import FastAPI, Request
import httpx
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
app = FastAPI()


MICROSERVICES = {
    "products": "http://product-service:5001",
    "reviews": "http://review-service:5002",
    "newsletter": "http://newsletter-service:5003",
}
#
# MICROSERVICES = {
#     "products": "http://localhost:5001",
#     "reviews": "http://localhost:5002",
#     "newsletter": "http://localhost:5003",
# }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Erlaubt alle Ursprünge (kann auf spezifische URLs eingeschränkt werden)
    allow_credentials=True,
    allow_methods=["*"],  # Erlaubt alle HTTP-Methoden
    allow_headers=["*"],  # Erlaubt alle Header
)

@app.api_route("/{service}/{path:path}", methods=["GET", "POST"])
async def proxy(service: str, path: str, request: Request):
    if service not in MICROSERVICES:
        return {"error": "Service not found"}

    async with httpx.AsyncClient() as client:
        url = f"{MICROSERVICES[service]}/{path}"
        if request.method == "GET":
            response = await client.get(url, params=request.query_params)
        elif request.method == "POST":
            body = await request.json()
            response = await client.post(url, json=body)
        return response.json()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
