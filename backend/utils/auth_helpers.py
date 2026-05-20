"""Helpers for role checks using JWT identity."""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from models import User


def get_current_user():
    """Return User from JWT subject (user id) or None."""
    uid = get_jwt_identity()
    if uid is None:
        return None
    try:
        user_id = int(uid)
    except (TypeError, ValueError):
        return None
    return User.query.get(user_id)


def admin_required(fn):
    """Allow only admin role."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        if user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)

    return wrapper
