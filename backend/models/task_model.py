"""Task model with status and due date."""
from datetime import date
from . import db


class Task(db.Model):
    __tablename__ = "tasks"

    STATUS_TODO = "todo"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_DONE = "done"
    STATUSES = (STATUS_TODO, STATUS_IN_PROGRESS, STATUS_DONE)

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default=STATUS_TODO, index=True)
    due_date = db.Column(db.Date, nullable=True)
    assigned_to = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=False, index=True
    )

    assignee = db.relationship(
        "User", back_populates="tasks_assigned", foreign_keys=[assigned_to]
    )
    project = db.relationship("Project", back_populates="tasks")

    def is_overdue(self):
        if self.status == self.STATUS_DONE or self.due_date is None:
            return False
        return self.due_date < date.today()

    def to_dict(self):
        overdue = self.is_overdue()
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "assigned_to": self.assigned_to,
            "project_id": self.project_id,
            "is_overdue": overdue,
            "project_title": self.project.title if self.project else None,
            "assignee_name": self.assignee.name if self.assignee else None,
        }
