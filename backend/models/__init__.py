"""SQLAlchemy instance and model exports."""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user_model import User  # noqa: E402
from .project_model import Project  # noqa: E402
from .task_model import Task  # noqa: E402

__all__ = ["db", "User", "Project", "Task"]
