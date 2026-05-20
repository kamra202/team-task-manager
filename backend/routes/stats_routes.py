"""Dashboard statistics."""
from datetime import date

from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from models import Task, db
from utils.auth_helpers import get_current_user
from utils.http import error_response, success_response

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/stats", methods=["GET"])
@jwt_required()
def dashboard_stats():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", 401)

    if user.role == "admin":
        from models import Project

        total_projects = Project.query.count()
        tasks = Task.query.all()
        recent_query = Task.query
    else:
        total_projects = (
            db.session.query(func.count(func.distinct(Task.project_id)))
            .filter(Task.assigned_to == user.id)
            .scalar()
            or 0
        )
        tasks = Task.query.filter(Task.assigned_to == user.id).all()
        recent_query = Task.query.filter(Task.assigned_to == user.id)

    total_tasks = len(tasks)
    todo_count = sum(1 for t in tasks if t.status == Task.STATUS_TODO)
    in_progress_count = sum(1 for t in tasks if t.status == Task.STATUS_IN_PROGRESS)
    completed = sum(1 for t in tasks if t.status == Task.STATUS_DONE)
    overdue = sum(
        1
        for t in tasks
        if t.status != Task.STATUS_DONE
        and t.due_date
        and t.due_date < date.today()
    )

    recent = recent_query.order_by(Task.id.desc()).limit(5).all()

    return success_response(
        data={
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "todo_tasks": todo_count,
            "in_progress_tasks": in_progress_count,
            "completed_tasks": completed,
            "overdue_tasks": overdue,
            "recent_tasks": [t.to_dict() for t in recent],
        }
    )
