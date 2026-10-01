import argparse
import csv
import json
import math
import os
import subprocess
import statistics
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parents[2]
DATASET_PATH = BASE_DIR / "remind_eval_dataset.csv"
COMPOSE_PATH = BASE_DIR / "docker-compose.eval.yml"
ENV_FILE_PATH = BASE_DIR / ".env.eval"
RESULTS_PATH = BASE_DIR / "remind_eval_results.csv"
SUMMARY_PATH = BASE_DIR / "remind_eval_summary.csv"
ERRORS_PATH = BASE_DIR / "remind_eval_errors.csv"
PILOT_SCORES_PATH = BASE_DIR / "pilot_sentiment_scores.csv"
PILOT_THRESHOLD_PATH = BASE_DIR / "pilot_threshold_candidates.csv"

EXPECTED_TOTAL_ROWS = 30
PILOT_SAMPLE_IDS = ["S03", "M05", "L03", "L08", "M09"]
PILOT_REASONS = {
    "S03": "short/positive/repeated-word",
    "M05": "medium/neutral/no-punctuation",
    "L03": "long/positive/mixed-emotion",
    "L08": "long/negative/repeated-word",
    "M09": "medium/negative/repeated-word",
}
SENTIMENT_MARGINS = [5, 10, 15, 20]
SENTIMENT_MIN_SCORES = [30, 40, 50]
SAFE_SCRIPT_DB_HOSTS = {"127.0.0.1", "localhost"}


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def require_safe_db_config() -> None:
    host = env("EVAL_DB_HOST", "127.0.0.1")
    port = env("EVAL_DB_PORT", "3307")
    db_name = env("EVAL_DB_NAME", "remind_eval")
    compose_db_name = env("REMIND_EVAL_DB_NAME", "remind_eval")
    if host not in SAFE_SCRIPT_DB_HOSTS:
        raise RuntimeError(
            "Unsafe DB host for evaluation script. EVAL_DB_HOST must be 127.0.0.1 or localhost."
        )
    if port != "3307":
        raise RuntimeError("Unsafe DB port for evaluation script. EVAL_DB_PORT must be 3307.")
    if not db_name.startswith("remind_eval"):
        raise RuntimeError("Unsafe DB name for evaluation script. EVAL_DB_NAME must be evaluation-only.")
    if not compose_db_name.startswith("remind_eval"):
        raise RuntimeError("Unsafe DB name for evaluation compose. REMIND_EVAL_DB_NAME must be evaluation-only.")
    if db_name != compose_db_name:
        raise RuntimeError("EVAL_DB_NAME and REMIND_EVAL_DB_NAME must point to the same evaluation DB.")


def require_safe_api_base_url(api_base_url: str) -> None:
    parsed = urlparse(api_base_url)
    if parsed.hostname not in {"127.0.0.1", "localhost"} or parsed.port != 8011:
        raise RuntimeError("Unsafe API base URL. EVAL_API_BASE_URL must point to localhost:8011.")


def verify_compose_file_safety() -> None:
    text = COMPOSE_PATH.read_text(encoding="utf-8")
    forbidden_tokens = ["env_file", "backend/.env", "amazonaws.com", "rds.amazonaws.com"]
    for token in forbidden_tokens:
        if token in text:
            raise RuntimeError(f"Unsafe evaluation compose file contains forbidden token: {token}")
    required_tokens = [
        '"127.0.0.1:3307:3306"',
        '"127.0.0.1:8011:8001"',
        "DB_HOST: eval-mysql",
        "DB_PORT: 3306",
        "MYSQL_DATABASE: ${REMIND_EVAL_DB_NAME:-remind_eval}",
        "MYSQL_USER: ${REMIND_EVAL_DB_USER:-remind_eval}",
    ]
    missing = [token for token in required_tokens if token not in text]
    if missing:
        raise RuntimeError(f"Evaluation compose file is missing required local-only settings: {missing}")


def verify_compose_config_safety() -> None:
    if not ENV_FILE_PATH.exists():
        raise RuntimeError(
            "Missing backend/tests/evaluation/.env.eval. Copy .env.eval.example and fill secrets before running."
        )
    command = [
        "docker",
        "compose",
        "--env-file",
        str(ENV_FILE_PATH),
        "-f",
        str(COMPOSE_PATH),
        "config",
    ]
    try:
        result = subprocess.run(
            command,
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except FileNotFoundError as exc:
        raise RuntimeError("Docker CLI was not found. Refusing to run evaluation API calls.") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError("docker compose config failed. Fix Docker/.env.eval before evaluation.") from exc

    config = result.stdout
    forbidden_tokens = ["backend/.env", "amazonaws.com", "rds.amazonaws.com"]
    for token in forbidden_tokens:
        if token in config:
            raise RuntimeError(f"Unsafe final compose config contains forbidden token: {token}")
    required_tokens = [
        "DB_HOST: eval-mysql",
        "published: \"3307\"",
        "target: 3306",
        "host_ip: 127.0.0.1",
        "published: \"8011\"",
        "target: 8001",
        "MYSQL_DATABASE:",
        "MYSQL_USER:",
    ]
    missing = [token for token in required_tokens if token not in config]
    if missing:
        raise RuntimeError(f"Final compose config is missing required local-only settings: {missing}")


def preflight_safety(api_base_url: str) -> None:
    require_safe_db_config()
    require_safe_api_base_url(api_base_url)
    verify_compose_file_safety()
    verify_compose_config_safety()
    print("safety_check=OK")
    print("compose_file=backend/tests/evaluation/docker-compose.eval.yml")
    print("api_base_url=localhost:8011")
    print("script_db=localhost:3307/remind_eval")
    print("backend_db_host=eval-mysql")


def load_dataset() -> list[dict[str, str]]:
    with DATASET_PATH.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    ids = [row["sample_id"] for row in rows]
    if len(rows) != EXPECTED_TOTAL_ROWS:
        raise RuntimeError(f"Dataset must contain exactly {EXPECTED_TOTAL_ROWS} rows.")
    if len(ids) != len(set(ids)):
        raise RuntimeError("Dataset has duplicate sample_id values.")
    return rows


def pilot_rows_from_dataset(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    by_id = {row["sample_id"]: row for row in rows}
    missing = [sample_id for sample_id in PILOT_SAMPLE_IDS if sample_id not in by_id]
    if missing:
        raise RuntimeError(f"Pilot sample IDs are missing from dataset: {missing}")
    return [by_id[sample_id] for sample_id in PILOT_SAMPLE_IDS]


def read_existing_results(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def require_no_duplicate_ids(rows: list[dict[str, Any]], label: str) -> None:
    ids = [row["sample_id"] for row in rows]
    duplicates = sorted({sample_id for sample_id in ids if ids.count(sample_id) > 1})
    if duplicates:
        raise RuntimeError(f"{label} has duplicate sample_id values: {duplicates}")


def print_pilot_selection() -> None:
    print("pilot_selection=fixed")
    for sample_id in PILOT_SAMPLE_IDS:
        print(f"pilot_id={sample_id}, reason={PILOT_REASONS[sample_id]}")
    print(f"planned_api_calls={len(PILOT_SAMPLE_IDS)}")


def apply_sentiment_thresholds(
    rows: list[dict[str, Any]],
    score_margin: int | None,
    min_score: int | None,
) -> list[dict[str, Any]]:
    updated_rows: list[dict[str, Any]] = []
    for row in rows:
        updated = dict(row)
        updated["predicted_sentiment"] = classify_sentiment(
            int(updated.get("positive_score") or 0),
            int(updated.get("negative_score") or 0),
            score_margin,
            min_score,
        )
        updated_rows.append(updated)
    return updated_rows


def build_threshold_candidates(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    candidate_rows: list[dict[str, Any]] = []
    for margin in SENTIMENT_MARGINS:
        for min_score in SENTIMENT_MIN_SCORES:
            predictions = []
            correct = 0
            for row in rows:
                predicted = classify_sentiment(
                    int(row.get("positive_score") or 0),
                    int(row.get("negative_score") or 0),
                    margin,
                    min_score,
                )
                predictions.append(f"{row['sample_id']}={predicted}/{row['expected_sentiment']}")
                if predicted == row["expected_sentiment"]:
                    correct += 1
            candidate_rows.append({
                "sentiment_margin": margin,
                "sentiment_min_score": min_score,
                "pilot_accuracy_pct": round(correct / len(rows) * 100, 2) if rows else 0,
                "predictions_vs_expected": "; ".join(predictions),
            })
    return candidate_rows


def env(name: str, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value or ""


def db_connection():
    require_safe_db_config()
    try:
        import pymysql
    except ModuleNotFoundError as exc:
        raise RuntimeError("Missing dependency: pymysql. Run this script in the backend Python environment.") from exc
    return pymysql.connect(
        host=env("EVAL_DB_HOST", "127.0.0.1"),
        port=int(env("EVAL_DB_PORT", "3307")),
        user=env("EVAL_DB_USER", "remind_eval"),
        password=env("EVAL_DB_PASSWORD", required=True),
        database=env("EVAL_DB_NAME", "remind_eval"),
        charset="utf8mb4",
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor,
    )


def seed_eval_entities() -> tuple[int, int]:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    email = f"eval.remind.{timestamp}@example.invalid"
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user (name, email, password_hash, role)
                VALUES (%s, %s, %s, 'USER')
                """,
                ("Eval User", email, "eval-password-hash-not-for-login"),
            )
            user_id = int(cur.lastrowid)
            cur.execute(
                """
                INSERT INTO question (created_by, target_user_id, content, q_type, source)
                VALUES (%s, %s, %s, 'memory_recall', 'AI_GENERATED')
                """,
                (user_id, user_id, "평가용 회상 답변을 작성해주세요."),
            )
            question_id = int(cur.lastrowid)
    return user_id, question_id


def post_answer(api_base_url: str, user_id: int, question_id: int, answer_text: str) -> tuple[dict[str, Any], float]:
    payload = {
        "user_id": user_id,
        "question_id": question_id,
        "input_type": "text",
        "content_text": answer_text,
        "is_private": False,
    }
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        f"{api_base_url.rstrip('/')}/answers",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            elapsed_ms = (time.perf_counter() - started) * 1000
            return json.loads(response.read().decode("utf-8")), elapsed_ms
    except urllib.error.HTTPError as error:
        elapsed_ms = (time.perf_counter() - started) * 1000
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code}: {body}") from error


def classify_sentiment(
    positive_score: int | None,
    negative_score: int | None,
    score_margin: int | None,
    min_score: int | None,
) -> str:
    if score_margin is None or min_score is None:
        return "UNCLASSIFIED_NEEDS_THRESHOLD"
    positive = positive_score or 0
    negative = negative_score or 0
    diff = positive - negative
    if diff >= score_margin and positive >= min_score:
        return "positive"
    if -diff >= score_margin and negative >= min_score:
        return "negative"
    return "neutral"


def exact_match(expected: str, actual: Any) -> bool:
    return str(expected) == str(actual)


def mean_absolute_error(rows: list[dict[str, Any]], expected_key: str, actual_key: str) -> float:
    values = [abs(float(row[expected_key]) - float(row[actual_key])) for row in rows]
    return round(sum(values) / len(values), 4) if values else 0.0


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def run_api_rows(
    rows: list[dict[str, str]],
    api_base_url: str,
    user_id: int,
    question_id: int,
    sentiment_margin: int | None,
    sentiment_min_score: int | None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], int]:
    result_rows: list[dict[str, Any]] = []
    error_rows: list[dict[str, Any]] = []
    api_call_count = 0

    for row in rows:
        try:
            api_call_count += 1
            response, elapsed_ms = post_answer(api_base_url, user_id, question_id, row["answer_text"])
            predicted_sentiment = classify_sentiment(
                response.get("positive_score"),
                response.get("negative_score"),
                sentiment_margin,
                sentiment_min_score,
            )
            possible_fallback = int(
                (response.get("positive_score") or 0) == 0
                and (response.get("negative_score") or 0) == 0
            )
            result_rows.append({
                "sample_id": row["sample_id"],
                "length_group": row["length_group"],
                "expected_sentiment": row["expected_sentiment"],
                "predicted_sentiment": predicted_sentiment,
                "expected_word_count": row["expected_word_count"],
                "actual_word_count": response.get("word_count"),
                "expected_sentence_count": row["expected_sentence_count"],
                "actual_sentence_count": response.get("sentence_count"),
                "expected_avg_sentence_length": row["expected_avg_sentence_length"],
                "actual_avg_sentence_length": response.get("avg_sentence_length"),
                "expected_unique_word_ratio": row["expected_unique_word_ratio"],
                "actual_unique_word_ratio": response.get("unique_word_ratio"),
                "expected_repeated_word_count": row["expected_repeated_word_count"],
                "actual_repeated_word_count": response.get("repeated_word_count"),
                "positive_score": response.get("positive_score"),
                "negative_score": response.get("negative_score"),
                "possible_llm_fallback_0_0": possible_fallback,
                "fallback_evidence": "scores_both_zero_after_success" if possible_fallback else "",
                "api_status": "success",
                "elapsed_ms": round(elapsed_ms, 2),
            })
        except Exception as exc:
            error_rows.append({
                "sample_id": row["sample_id"],
                "api_status": "error",
                "error": str(exc),
            })

    return result_rows, error_rows, api_call_count


def summarize_results(
    result_rows: list[dict[str, Any]],
    error_rows: list[dict[str, Any]],
    sentiment_margin: int | None,
    sentiment_min_score: int | None,
) -> dict[str, Any]:
    total = len(result_rows)
    elapsed_values = [float(row["elapsed_ms"]) for row in result_rows]
    return {
        "word_count_accuracy_pct": round(
            sum(exact_match(row["expected_word_count"], row["actual_word_count"]) for row in result_rows) / total * 100,
            2,
        ) if total else 0,
        "sentence_count_accuracy_pct": round(
            sum(exact_match(row["expected_sentence_count"], row["actual_sentence_count"]) for row in result_rows) / total * 100,
            2,
        ) if total else 0,
        "avg_sentence_length_mae": mean_absolute_error(
            result_rows, "expected_avg_sentence_length", "actual_avg_sentence_length"
        ),
        "unique_word_ratio_mae": mean_absolute_error(
            result_rows, "expected_unique_word_ratio", "actual_unique_word_ratio"
        ),
        "repeated_word_count_accuracy_pct": round(
            sum(exact_match(row["expected_repeated_word_count"], row["actual_repeated_word_count"]) for row in result_rows) / total * 100,
            2,
        ) if total else 0,
        "sentiment_accuracy_pct": round(
            sum(row["expected_sentiment"] == row["predicted_sentiment"] for row in result_rows) / total * 100,
            2,
        ) if total and sentiment_margin is not None and sentiment_min_score is not None else "NEEDS_THRESHOLD",
        "api_response_mean_ms": round(statistics.mean(elapsed_values), 2) if elapsed_values else 0,
        "api_response_stdev_ms": round(statistics.pstdev(elapsed_values), 2) if len(elapsed_values) > 1 else 0,
        "possible_llm_fallback_0_0_count": sum(int(row["possible_llm_fallback_0_0"]) for row in result_rows),
        "api_error_count": len(error_rows),
    }


def main() -> int:
    load_env_file(ENV_FILE_PATH)
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["pilot", "full"], default="pilot")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--sentiment-margin", type=int, default=None)
    parser.add_argument("--sentiment-min-score", type=int, default=None)
    args = parser.parse_args()

    api_base_url = env("EVAL_API_BASE_URL", "http://localhost:8011")
    preflight_safety(api_base_url)

    if args.mode == "pilot":
        if args.limit is not None and args.limit != len(PILOT_SAMPLE_IDS):
            raise RuntimeError(f"Pilot must run exactly {len(PILOT_SAMPLE_IDS)} fixed samples.")
    elif args.limit is not None:
        raise RuntimeError("Do not use --limit in full mode. Full mode runs only non-pilot remaining samples.")

    if args.mode == "full" and (args.sentiment_margin is None or args.sentiment_min_score is None):
        raise RuntimeError("Full mode requires --sentiment-margin and --sentiment-min-score approved after pilot.")

    dataset_rows = load_dataset()
    dataset_by_id = {row["sample_id"]: row for row in dataset_rows}

    if args.mode == "pilot":
        rows = pilot_rows_from_dataset(dataset_rows)
        print_pilot_selection()
        if len(rows) > EXPECTED_TOTAL_ROWS:
            raise RuntimeError("Planned API calls exceed the allowed evaluation maximum.")

        user_id, question_id = seed_eval_entities()
        result_rows, error_rows, api_call_count = run_api_rows(
            rows,
            api_base_url,
            user_id,
            question_id,
            args.sentiment_margin,
            args.sentiment_min_score,
        )
        require_no_duplicate_ids(result_rows, "pilot results")
        write_csv(PILOT_SCORES_PATH, result_rows)
        write_csv(ERRORS_PATH, error_rows)

        threshold_rows = build_threshold_candidates(result_rows)
        write_csv(PILOT_THRESHOLD_PATH, threshold_rows)

        print(f"pilot_rows={len(result_rows)}")
        print(f"actual_api_calls={api_call_count}")
        print(f"pilot_output={PILOT_SCORES_PATH}")
        print(f"threshold_candidates_output={PILOT_THRESHOLD_PATH}")
        print(f"errors_output={ERRORS_PATH}")
        print("threshold_candidates")
        print(json.dumps(threshold_rows, ensure_ascii=False, indent=2))
        if error_rows:
            raise RuntimeError("Pilot completed with API errors. Do not continue to full evaluation yet.")
        if len(result_rows) != len(PILOT_SAMPLE_IDS):
            raise RuntimeError("Pilot did not complete exactly 5 samples.")
        elapsed_values = [float(row["elapsed_ms"]) for row in result_rows]
        print(f"api_response_mean_ms={round(statistics.mean(elapsed_values), 2) if elapsed_values else 0}")
        print(
            "fallback_suspected_count="
            f"{sum(int(row['possible_llm_fallback_0_0']) for row in result_rows)}"
        )
        print("remaining_full_mode_calls=25")
        return 0

    pilot_result_rows = read_existing_results(PILOT_SCORES_PATH)
    require_no_duplicate_ids(pilot_result_rows, "pilot result file")
    completed_ids = {row["sample_id"] for row in pilot_result_rows if row.get("api_status") == "success"}
    expected_pilot_ids = set(PILOT_SAMPLE_IDS)
    if completed_ids != expected_pilot_ids:
        raise RuntimeError(
            "Pilot result file must contain exactly the 5 fixed successful pilot IDs before full mode."
        )
    pending_rows = [row for row in dataset_rows if row["sample_id"] not in completed_ids]
    if len(pending_rows) != EXPECTED_TOTAL_ROWS - len(PILOT_SAMPLE_IDS):
        raise RuntimeError("Full mode must call exactly the 25 non-pilot samples.")
    if len(completed_ids) + len(pending_rows) > EXPECTED_TOTAL_ROWS:
        raise RuntimeError("Evaluation would exceed the 30-call maximum. Refusing to run.")

    print(f"completed_pilot_ids={','.join(PILOT_SAMPLE_IDS)}")
    print(f"planned_additional_api_calls={len(pending_rows)}")
    print("pilot_results_reused=true")

    user_id, question_id = seed_eval_entities()
    new_rows, error_rows, api_call_count = run_api_rows(
        pending_rows,
        api_base_url,
        user_id,
        question_id,
        args.sentiment_margin,
        args.sentiment_min_score,
    )
    require_no_duplicate_ids(new_rows, "additional full-mode results")

    thresholded_pilot_rows = apply_sentiment_thresholds(
        pilot_result_rows,
        args.sentiment_margin,
        args.sentiment_min_score,
    )
    combined_by_id = {row["sample_id"]: row for row in thresholded_pilot_rows + new_rows}
    if len(combined_by_id) != EXPECTED_TOTAL_ROWS:
        write_csv(ERRORS_PATH, error_rows)
        raise RuntimeError("Final combined results must contain exactly 30 unique sample IDs.")
    missing_ids = [row["sample_id"] for row in dataset_rows if row["sample_id"] not in combined_by_id]
    if missing_ids:
        write_csv(ERRORS_PATH, error_rows)
        raise RuntimeError(f"Final combined results are missing sample IDs: {missing_ids}")
    if error_rows:
        write_csv(ERRORS_PATH, error_rows)
        raise RuntimeError("Full evaluation completed with API errors. Summary was not generated.")

    combined_rows = [combined_by_id[row["sample_id"]] for row in dataset_rows]
    for row in combined_rows:
        source = dataset_by_id[row["sample_id"]]
        row["length_group"] = source["length_group"]
        row["expected_sentiment"] = source["expected_sentiment"]

    write_csv(RESULTS_PATH, combined_rows)
    write_csv(ERRORS_PATH, error_rows)
    summary = summarize_results(
        combined_rows,
        error_rows,
        args.sentiment_margin,
        args.sentiment_min_score,
    )
    write_csv(SUMMARY_PATH, [summary])
    print(f"actual_additional_api_calls={api_call_count}")
    print(f"total_api_calls_including_pilot={len(PILOT_SAMPLE_IDS) + api_call_count}")
    print(f"results={RESULTS_PATH}")
    print(f"summary={SUMMARY_PATH}")
    print(f"errors={ERRORS_PATH}")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
