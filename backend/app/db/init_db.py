from backend.app.db.session import engine, Base
from backend.app.models import models

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Initializing FlameX database tables...")
    init_db()
    print("Database tables initialized successfully.")
