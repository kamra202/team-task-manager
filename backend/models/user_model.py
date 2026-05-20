"""User model with role-based access (admin / member)."""
from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")  # admin | member

    projects_created = db.relationship(
        "Project", back_populates="creator", foreign_keys="Project.created_by"
    )
    tasks_assigned = db.relationship(
        "Task", back_populates="assignee", foreign_keys="Task.assigned_to"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
        }
