# Backend CLAUDE.md Template

A template for Python/FastAPI backend projects using AI coding agents.

---

## How to Use This Template

1. Copy this file to your backend project root as `CLAUDE.md`
2. Update framework-specific details (FastAPI, Django, etc.)
3. Add database and API patterns specific to your project
4. Extend with constraints discovered through friction

---

```markdown
# Backend Implementation Context

## Project Structure

```
app/
├── api/              # Route handlers
│   └── v1/
│       ├── routes/
│       └── deps.py   # Shared dependencies
├── core/             # Config, security, db setup
│   ├── config.py
│   ├── database.py
│   └── security.py
├── models/           # SQLAlchemy ORM models
├── schemas/          # Pydantic request/response schemas
├── services/         # Business logic
└── utils/            # Helpers

tests/
├── conftest.py       # Fixtures
├── test_api/
└── test_services/
```

---

## Development Commands

```bash
# Start dev server
uvicorn app.main:app --reload

# Run tests
pytest -q

# Run tests with coverage
pytest --cov=app

# Start full stack (app + postgres + pgadmin)
docker-compose up

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## API Documentation

- FastAPI auto-generates OpenAPI docs at `/docs`
- **Every new route MUST include proper request/response schemas**
- Docstrings become endpoint descriptions in Swagger

### Example Route

```python
@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    item: ItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ItemResponse:
    """
    Create a new item.
    
    - **name**: Item name (required)
    - **description**: Optional description
    """
    return await item_service.create(db, item, current_user.id)
```

---

## Schema Conventions

### Naming

```python
# Request schemas
class ItemCreate(BaseModel):    # For POST
class ItemUpdate(BaseModel):    # For PUT/PATCH
class ItemQuery(BaseModel):     # For query params

# Response schemas  
class ItemResponse(BaseModel):  # Single item
class ItemList(BaseModel):      # List with pagination
```

### Validation

```python
from pydantic import BaseModel, Field, validator

class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., ge=0, decimal_places=2)
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

---

## Database Patterns

### Model Definition

```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="items")
```

### Async Operations

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def get_items(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Item).offset(skip).limit(limit)
    )
    return result.scalars().all()
```

---

## Service Layer Pattern

Business logic lives in services, not routes:

```python
# app/services/item_service.py

class ItemService:
    async def create(
        self, 
        db: AsyncSession, 
        item_data: ItemCreate, 
        user_id: int
    ) -> Item:
        item = Item(**item_data.dict(), owner_id=user_id)
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item
    
    async def get_by_id(
        self, 
        db: AsyncSession, 
        item_id: int
    ) -> Item | None:
        result = await db.execute(
            select(Item).where(Item.id == item_id)
        )
        return result.scalar_one_or_none()

item_service = ItemService()
```

---

## Error Handling

### Use HTTPException

```python
from fastapi import HTTPException, status

async def get_item(item_id: int, db: AsyncSession):
    item = await item_service.get_by_id(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found"
        )
    return item
```

### Custom Exceptions

```python
# app/core/exceptions.py

class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

# Register handler in main.py
@app.exception_handler(AppException)
async def app_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
```

---

## Testing

### Fixtures (conftest.py)

```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture
async def db_session():
    # Setup test database
    async with AsyncSession(engine) as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(db_session):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

### Test Structure

```python
# tests/test_api/test_items.py

async def test_create_item(client, db_session, auth_headers):
    response = await client.post(
        "/api/v1/items",
        json={"name": "Test Item", "price": "9.99"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Item"

async def test_create_item_unauthorized(client):
    response = await client.post(
        "/api/v1/items",
        json={"name": "Test Item"},
    )
    assert response.status_code == 401
```

---

## Critical Rules

### Security
- ❌ **NEVER commit secrets** — Use `.env` and environment variables
- ❌ **NEVER log sensitive data** — No passwords, tokens, PII in logs
- ❌ **NEVER trust user input** — Always validate with Pydantic
- ✅ **ALWAYS use parameterized queries** — SQLAlchemy handles this

### API Design
- ❌ **NEVER return database models directly** — Always use response schemas
- ❌ **NEVER skip validation** — Every endpoint needs input schemas
- ✅ **ALWAYS version your API** — `/api/v1/...`
- ✅ **ALWAYS include proper status codes** — 201 for create, 204 for delete

### Database
- ❌ **NEVER use raw SQL** unless absolutely necessary
- ❌ **NEVER skip migrations** — All schema changes go through Alembic
- ✅ **ALWAYS use async operations** — `AsyncSession`, `await`
- ✅ **ALWAYS handle transactions properly** — Commit or rollback

---

## Coding Style

- Python 3.11+
- 4-space indentation
- Type hints required for function signatures
- Docstrings for public functions
- `snake_case` for functions and variables
- `PascalCase` for classes
- Linting: ruff + mypy must pass

---

## Workflow

1. **Plan** — Understand requirements
2. **Implement** — Write code with tests
3. **Self-review** — Check against these patterns
4. **Test** — Run pytest, ensure passing
5. **Document** — Update OpenAPI schemas
```

---

## Customization Notes

Add sections for your specific needs:

- **Authentication patterns** (JWT, OAuth, API keys)
- **Background tasks** (Celery, ARQ)
- **Caching** (Redis patterns)
- **File handling** (S3, local storage)
- **External API integrations**

Remember: **Add constraints when you correct the agent twice for the same mistake.**
