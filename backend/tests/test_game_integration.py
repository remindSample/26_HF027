import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from pydantic import ValidationError
from sqlalchemy.dialects.mysql import ENUM

from app.models.game_event import GameEvent
from app.schemas.game_event import EventCreate
from app.services.game_schema import ensure_game_gesture_columns


class GameGestureIntegrationTests(unittest.TestCase):
    def test_scissors_is_accepted_for_each_hand_and_for_missed_notes(self):
        for hand in ("LEFT", "RIGHT"):
            for user_input in ("FIST", "PALM", "SCISSORS", None):
                event = EventCreate(
                    session_id=1,
                    hand_side=hand,
                    target_gesture="SCISSORS",
                    user_input=user_input,
                    is_correct=user_input == "SCISSORS",
                )
                self.assertEqual(event.target_gesture, "SCISSORS")

        for column_name in ("target_gesture", "user_input"):
            self.assertIn("SCISSORS", GameEvent.__table__.c[column_name].type.enums)

    def test_unknown_gestures_remain_invalid(self):
        with self.assertRaises(ValidationError):
            EventCreate(
                session_id=1,
                hand_side="LEFT",
                target_gesture="UNKNOWN",
                is_correct=False,
            )

    @patch("app.services.game_schema.inspect")
    def test_existing_mysql_enum_columns_are_extended_together(self, inspect_mock):
        engine = MagicMock()
        engine.dialect.name = "mysql"
        inspect_mock.return_value.get_columns.return_value = [
            {"name": "target_gesture", "type": ENUM("FIST", "PALM"), "nullable": False},
            {"name": "user_input", "type": ENUM("FIST", "PALM"), "nullable": True},
        ]

        ensure_game_gesture_columns(engine)

        connection = engine.begin.return_value.__enter__.return_value
        statement = str(connection.execute.call_args.args[0])
        self.assertIn("ENUM('FIST','PALM','SCISSORS') NOT NULL", statement)
        self.assertIn("ENUM('FIST','PALM','SCISSORS') NULL", statement)
        self.assertEqual(connection.execute.call_count, 1)

    @patch("app.services.game_schema.inspect")
    def test_updated_mysql_tables_need_no_schema_write(self, inspect_mock):
        engine = MagicMock()
        engine.dialect.name = "mysql"
        inspect_mock.return_value.get_columns.return_value = [
            {
                "name": "target_gesture",
                "type": ENUM("FIST", "PALM", "SCISSORS"),
                "nullable": False,
            },
            {
                "name": "user_input",
                "type": ENUM("FIST", "PALM", "SCISSORS"),
                "nullable": True,
            },
        ]

        ensure_game_gesture_columns(engine)

        engine.begin.assert_not_called()

    @patch("app.services.game_schema.inspect")
    def test_other_database_dialects_need_no_mysql_migration(self, inspect_mock):
        engine = SimpleNamespace(dialect=SimpleNamespace(name="sqlite"))

        ensure_game_gesture_columns(engine)

        inspect_mock.assert_not_called()


if __name__ == "__main__":
    unittest.main()
