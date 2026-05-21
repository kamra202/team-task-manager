"""
Team Task Manager API — Flask application factory.
"""
import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import config_by_name
from models import db
from routes.auth_routes import auth_bp
from routes.project_routes import project_bp
from routes.stats_routes import stats_bp
from routes.task_routes import task_bp


def create_app():
    load_dotenv()
    app = Flask(__name__)
    env = os.environ.get("FLASK_ENV", "development")
    app.config.from_object(config_by_name.get(env, config_by_name["default"]))

    # JWT
    JWTManager(app)

    # CORS
    CORS(
    app,
    origins=["https://team-task-manager-seven-mu.vercel.app"],
    supports_credentials=True
    )
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(stats_bp)

    @app.route("/")
    def health():
        return jsonify(
            {
                "service": "Team Task Manager API",
                "status": "ok",
            }
        )

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
