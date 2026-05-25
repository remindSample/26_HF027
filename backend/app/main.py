from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import game_sessions, game_events, answers


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="ReMind API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game_sessions.router)
app.include_router(game_events.router)
app.include_router(answers.router)


@app.get("/")
def root():
    return {"message": "ReMind API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
