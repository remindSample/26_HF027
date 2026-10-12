import os
from pathlib import Path


SAFE_DB_HOSTS = {"127.0.0.1", "localhost"}
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE_PATH = BASE_DIR / ".env.eval"


def env(name: str, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value or ""


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def require_safe_db_host(host: str) -> None:
    if host not in SAFE_DB_HOSTS:
        raise RuntimeError(
            "Unsafe DB host for cleanup. Refusing to run because EVAL_DB_HOST "
            "is not localhost/127.0.0.1."
        )


def main() -> int:
    load_env_file(ENV_FILE_PATH)
    host = env("EVAL_DB_HOST", "127.0.0.1")
    port = env("EVAL_DB_PORT", "3307")
    db_name = env("EVAL_DB_NAME", "remind_eval")
    require_safe_db_host(host)
    if port != "3307":
        raise RuntimeError("Unsafe DB port for cleanup. EVAL_DB_PORT must be 3307.")
    if not db_name.startswith("remind_eval"):
        raise RuntimeError("Unsafe DB name for cleanup. EVAL_DB_NAME must be evaluation-only.")
    try:
        import pymysql
    except ModuleNotFoundError as exc:
        raise RuntimeError("Missing dependency: pymysql. Run this script in the backend Python environment.") from exc
    conn = pymysql.connect(
        host=host,
        port=int(port),
        user=env("EVAL_DB_USER", "remind_eval"),
        password=env("EVAL_DB_PASSWORD", required=True),
        database=db_name,
        charset="utf8mb4",
        autocommit=False,
        cursorclass=pymysql.cursors.DictCursor,
    )

    with conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM user WHERE email LIKE 'eval.remind.%@example.invalid'"
            )
            user_ids = [row["id"] for row in cur.fetchall()]
            if not user_ids:
                print("cleanup_rows=0")
                conn.commit()
                return 0

            placeholders = ",".join(["%s"] * len(user_ids))
            cur.execute(
                f"SELECT id FROM question WHERE target_user_id IN ({placeholders})",
                user_ids,
            )
            question_ids = [row["id"] for row in cur.fetchall()]

            deleted_answers = 0
            deleted_questions = 0
            if question_ids:
                q_placeholders = ",".join(["%s"] * len(question_ids))
                cur.execute(
                    f"DELETE FROM answers WHERE question_id IN ({q_placeholders})",
                    question_ids,
                )
                deleted_answers = cur.rowcount
                cur.execute(
                    f"DELETE FROM question WHERE id IN ({q_placeholders})",
                    question_ids,
                )
                deleted_questions = cur.rowcount

            cur.execute(f"DELETE FROM user WHERE id IN ({placeholders})", user_ids)
            deleted_users = cur.rowcount
            conn.commit()

    print(f"deleted_users={deleted_users}")
    print(f"deleted_questions={deleted_questions}")
    print(f"deleted_answers={deleted_answers}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
