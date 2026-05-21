"""Authentication: signup and login."""
from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required
from sqlalchemy.exc import IntegrityError

from models import db, User
from utils.auth_helpers import get_current_user
from utils.http import error_response, success_response
from utils.passwords import hash_password, verify_password
from utils.validators import validate_email, validate_password, validate_non_empty_string

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    ok, err = validate_non_empty_string(name, "Name", max_len=120)
    if not ok:
        return error_response(err, 400)
    if not validate_email(email):
        return error_response("Invalid email address.", 400)
    ok, err = validate_password(password)
    if not ok:
        return error_response(err, 400)

    # First user becomes admin for easy bootstrap; others are members
    # Fixed admin email for demo/deployment
    if email == "kashish23@gmail.com":
        role = "admin"
    else:
        role = "member"

    user = User(
        name=name.strip(),
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("Email already registered.", 409)

    token = create_access_token(identity=str(user.id))
    return success_response(
        data={
            "access_token": token,
            "user": user.to_dict(),
        },
        status_code=201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return error_response("Email and password are required.", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return error_response("Invalid email or password.", 401)

    token = create_access_token(identity=str(user.id))
    return success_response(
        data={
            "access_token": token,
            "user": user.to_dict(),
        }
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return error_response("Unauthorized", 401)
    return success_response(data={"user": user.to_dict()})
