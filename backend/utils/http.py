from flask import jsonify


def error_response(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


def success_response(data=None, message: str = None, status_code: int = 200):
    body = {}
    if message:
        body["message"] = message
    if data is not None:
        body["data"] = data
    return jsonify(body), status_code
