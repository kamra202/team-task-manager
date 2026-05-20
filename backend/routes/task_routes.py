"""Task CRUD with role-based access."""
from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from models import db, Task, Project, User
from utils.auth_helpers import admin_required, get_current_user
from utils.http import error_response, success_response
from utils.validators import validate_non_empty_string

task_bp = Blueprint("tasks", __name__)


def _parse_date(value):
    if value is None or value == "":
        return None
    if isinstance(value, str):
        try:
            return datetime.strptime(value[:10], "%Y-%m-%d").date()
        except ValueError:
            return "invalid"
    return None


@task_bp.route("/tasks", methods=["GET"])
@jwt_required()
def list_tasks():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", 401)

    project_id = request.args.get("project_id", type=int)

    q = Task.query
    if user.role != "admin":
        q = q.filter(Task.assigned_to == user.id)
    if project_id:
        q = q.filter(Task.project_id == project_id)

    tasks = q.order_by(Task.id.desc()).all()
    return success_response(data={"tasks": [t.to_dict() for t in tasks]})


@task_bp.route("/tasks", methods=["POST"])
@jwt_required()
@admin_required
def create_task():
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    description = data.get("description") or ""
    status = data.get("status") or Task.STATUS_TODO
    project_id = data.get("project_id")
    assigned_to = data.get("assigned_to")
    due_date_raw = data.get("due_date")

    ok, err = validate_non_empty_string(title, "Title", max_len=200)
    if not ok:
        return error_response(err, 400)

    if not project_id:
        return error_response("project_id is required.", 400)
    if not assigned_to:
        return error_response("assigned_to (user id) is required.", 400)

    project = Project.query.get(project_id)
    if not project:
        return error_response("Project not found.", 404)

    assignee = User.query.get(int(assigned_to))
    if not assignee:
        return error_response("Assignee user not found.", 404)

    if status not in Task.STATUSES:
        return error_response(
            f"Invalid status. Use one of: {', '.join(Task.STATUSES)}.", 400
        )

    due = _parse_date(due_date_raw)
    if due == "invalid":
        return error_response("Invalid due_date format. Use YYYY-MM-DD.", 400)

    task = Task(
        title=title.strip(),
        description=str(description).strip() if description else None,
        status=status,
        due_date=due,
        assigned_to=assignee.id,
        project_id=project.id,
    )
    db.session.add(task)
    db.session.commit()
    return success_response(data={"task": task.to_dict()}, status_code=201)


@task_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user = get_current_user()
    task = Task.query.get(task_id)
    if not task:
        return error_response("Task not found.", 404)

    data = request.get_json(silent=True) or {}

    if user.role == "admin":
        if "title" in data:
            ok, err = validate_non_empty_string(data["title"], "Title", max_len=200)
            if not ok:
                return error_response(err, 400)
            task.title = str(data["title"]).strip()
        if "description" in data:
            task.description = (
                str(data["description"]).strip() if data["description"] else None
            )
        if "status" in data:
            if data["status"] not in Task.STATUSES:
                return error_response("Invalid status.", 400)
            task.status = data["status"]
        if "due_date" in data:
            due = _parse_date(data["due_date"])
            if due == "invalid":
                return error_response("Invalid due_date format. Use YYYY-MM-DD.", 400)
            task.due_date = due
        if "assigned_to" in data:
            u = User.query.get(int(data["assigned_to"]))
            if not u:
                return error_response("Assignee not found.", 404)
            task.assigned_to = u.id
        if "project_id" in data:
            p = Project.query.get(int(data["project_id"]))
            if not p:
                return error_response("Project not found.", 404)
            task.project_id = p.id
    else:
        # Member: only own tasks, only status updates
        if task.assigned_to != user.id:
            return error_response("You can only update tasks assigned to you.", 403)
        allowed = {"status"}
        extra = set(data.keys()) - allowed
        if extra:
            return error_response(
                "Members may only update task status.", 403
            )
        if "status" not in data:
            return error_response("status is required.", 400)
        if data["status"] not in Task.STATUSES:
            return error_response("Invalid status.", 400)
        task.status = data["status"]

    db.session.commit()
    return success_response(data={"task": task.to_dict()})


@task_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return error_response("Task not found.", 404)
    db.session.delete(task)
    db.session.commit()
    return success_response(message="Task deleted.")


@task_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def list_users_for_assignment():
    """Helper for admin UI: list members for task assignment."""
    users = User.query.order_by(User.name).all()
    return success_response(data={"users": [u.to_dict() for u in users]})
