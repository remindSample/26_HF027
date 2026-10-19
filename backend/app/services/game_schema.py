from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def ensure_game_gesture_columns(engine: Engine) -> None:
    """Extend existing MySQL game tables without replacing their records."""
    if engine.dialect.name != "mysql":
        return

    columns = inspect(engine).get_columns("game_events")
    changes = []
    for column in columns:
        if column["name"] not in {"target_gesture", "user_input"}:
            continue
        values = getattr(column["type"], "enums", ())
        if "SCISSORS" in values:
            continue
        nullable = "NULL" if column["nullable"] else "NOT NULL"
        changes.append(
            f"MODIFY COLUMN `{column['name']}` "
            f"ENUM('FIST','PALM','SCISSORS') {nullable}"
        )

    if changes:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE game_events " + ", ".join(changes)))
