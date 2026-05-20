import re
from typing import Optional, Tuple


def validate_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email.strip()))


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters."
    if len(password) > 128:
        return False, "Password is too long."
    return True, None


def validate_non_empty_string(value: str, field_name: str, max_len: int = 500) -> Tuple[bool, Optional[str]]:
    if not value or not str(value).strip():
        return False, f"{field_name} is required."
    s = str(value).strip()
    if len(s) > max_len:
        return False, f"{field_name} is too long (max {max_len} characters)."
    return True, None
