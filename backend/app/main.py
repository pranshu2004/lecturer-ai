from fastapi import FastAPI
import logging

app = FastAPI()
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # This is the message we are looking for in the logs.
    logger.info("Barebones test server started successfully!")

@app.get("/")
async def root():
    return {"message": "Hello from the barebones test server!"}
