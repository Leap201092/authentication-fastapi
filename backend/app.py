from fastapi import FastAPI
from src.routes.PublicRoute import route as PublicRoute
from src.routes.AuthRoute import router as AuthUserRoute

# cors error solution
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# middleware
origins = [
    "http://localhost:5173",  # React (Vite)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# add routes
app.include_router(PublicRoute)
app.include_router(AuthUserRoute)