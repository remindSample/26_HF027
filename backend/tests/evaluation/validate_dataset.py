import csv
import re
from pathlib import Path


DATASET_PATH = Path(__file__).with_name("remind_eval_dataset.csv")


def calculate_metrics(text: str) -> dict[str, int | float]:
    words = text.split()
    word_count = len(words)
    sentences = [s.strip() for s in re.split(r"[.!?。\n]", text) if s.strip()]
    sentence_count = max(len(sentences), 1)
    avg_sentence_length = round(word_count / sentence_count, 2)
    unique_word_ratio = round(len(set(words)) / word_count, 3) if word_count > 0 else 0
    repeated_word_count = word_count - len(set(words))

    return {
        "expected_word_count": word_count,
        "expected_sentence_count": sentence_count,
        "expected_avg_sentence_length": avg_sentence_length,
        "expected_unique_word_ratio": unique_word_ratio,
        "expected_repeated_word_count": repeated_word_count,
    }


def main() -> int:
    mismatches: list[str] = []
    with DATASET_PATH.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        calculated = calculate_metrics(row["answer_text"])
        for key, expected in calculated.items():
            actual_raw = row[key]
            actual = float(actual_raw) if "." in actual_raw else int(actual_raw)
            if actual != expected:
                mismatches.append(
                    f"{row['sample_id']} {key}: csv={actual_raw}, calculated={expected}"
                )

    print(f"rows={len(rows)}")
    if mismatches:
        print("mismatches:")
        for item in mismatches:
            print(f"- {item}")
        return 1

    print("dataset_expected_metrics=OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

