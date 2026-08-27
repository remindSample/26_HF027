from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth,
    users,
    guardian_links,
    keywords,
    questions,
    answers,
    answer_favorites,
    answer_likes,
    emotion_logs,
    cognitive_reports,
    game_sessions,
    game_events,
    dataset_answers,
    notifications,
)


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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(guardian_links.router)
app.include_router(keywords.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(answer_favorites.router)
app.include_router(answer_likes.router)
app.include_router(emotion_logs.router)
app.include_router(cognitive_reports.router)
app.include_router(game_sessions.router)
app.include_router(game_events.router)
app.include_router(dataset_answers.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"message": "ReMind API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
