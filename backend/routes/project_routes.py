"""Project CRUD with role-based access."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from models import db, Project, Task
from utils.auth_helpers import admin_required, get_current_user
from utils.http import error_response, success_response
from utils.validators import validate_non_empty_string

project_bp = Blueprint("projects", __name__)


def _projects_for_member(user_id: int):
    """Projects where the member has at least one assigned task."""
    ids = (
        db.session.query(Task.project_id)
        .filter(Task.assigned_to == user_id)
        .distinct()
        .all()
    )
    pids = [row[0] for row in ids]
    if not pids:
        return []
    return (
        Project.query.filter(Project.id.in_(pids)).order_by(Project.id.desc()).all()
    )


@project_bp.route("/projects", methods=["GET"])
@jwt_required()
def list_projects():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", 401)

    if user.role == "admin":
        projects = Project.query.order_by(Project.id.desc()).all()
    else:
        projects = _projects_for_member(user.id)

    return success_response(
        data={
            "projects": [
                {
                    **p.to_dict(include_task_count=True),
                    "tasks": [t.to_dict() for t in p.tasks],
                }
                for p in projects
            ]
        }
    )


@project_bp.route("/projects", methods=["POST"])
@jwt_required()
@admin_required
def create_project():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    description = data.get("description") or ""

    ok, err = validate_non_empty_string(title, "Title", max_len=200)
    if not ok:
        return error_response(err, 400)

    project = Project(
        title=title.strip(),
        description=str(description).strip() if description else None,
        created_by=user.id,
    )
    db.session.add(project)
    db.session.commit()
    return success_response(data={"project": project.to_dict()}, status_code=201)


@project_bp.route("/projects/<int:project_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return error_response("Project not found.", 404)

    data = request.get_json(silent=True) or {}
    if "title" in data:
        ok, err = validate_non_empty_string(data["title"], "Title", max_len=200)
        if not ok:
            return error_response(err, 400)
        project.title = str(data["title"]).strip()
    if "description" in data:
        project.description = (
            str(data["description"]).strip() if data["description"] else None
        )

    db.session.commit()
    return success_response(data={"project": project.to_dict()})


@project_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return error_response("Project not found.", 404)
    db.session.delete(project)
    db.session.commit()
    return success_response(message="Project deleted.")
