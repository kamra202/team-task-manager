"""Project model."""
from . import db


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )

    creator = db.relationship(
        "User", back_populates="projects_created", foreign_keys=[created_by]
    )
    tasks = db.relationship(
        "Task", back_populates="project", cascade="all, delete-orphan"
    )

    def to_dict(self, include_task_count=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "created_by": self.created_by,
        }
        if include_task_count:
            data["task_count"] = len(self.tasks) if self.tasks is not None else 0
        return data
