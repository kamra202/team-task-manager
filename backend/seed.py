"""
Seed sample users, a project, and tasks (SQLite dev DB by default).

Run from backend/:  python seed.py
Requires existing DB (run app once) or tables created via create_all.
"""
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app  # noqa: E402
from models import db, User, Project, Task  # noqa: E402
from utils.passwords import hash_password  # noqa: E402


def run():
    app = create_app()
    with app.app_context():
        if User.query.filter_by(email="admin@example.com").first():
            print("Sample data already exists. Skipping.")
            return

        admin = User(
            name="Admin User",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role="admin",
        )
        member = User(
            name="Member User",
            email="member@example.com",
            password_hash=hash_password("member123"),
            role="member",
        )
        db.session.add_all([admin, member])
        db.session.flush()

        project = Project(
            title="Website Redesign",
            description="Refresh marketing site and dashboard UI.",
            created_by=admin.id,
        )
        db.session.add(project)
        db.session.flush()

        t1 = Task(
            title="Wireframes",
            description="Low-fidelity wireframes for main pages.",
            status=Task.STATUS_DONE,
            due_date=date.today() - timedelta(days=2),
            assigned_to=member.id,
            project_id=project.id,
        )
        t2 = Task(
            title="Implement dashboard cards",
            description="React components for stats and recent tasks.",
            status=Task.STATUS_IN_PROGRESS,
            due_date=date.today() + timedelta(days=3),
            assigned_to=member.id,
            project_id=project.id,
        )
        t3 = Task(
            title="API documentation",
            description="Document endpoints in README.",
            status=Task.STATUS_TODO,
            due_date=date.today() - timedelta(days=1),
            assigned_to=admin.id,
            project_id=project.id,
        )
        db.session.add_all([t1, t2, t3])
        db.session.commit()
        print("Seed complete.")
        print("  admin@example.com / admin123")
        print("  member@example.com / member123")


if __name__ == "__main__":
    run()
