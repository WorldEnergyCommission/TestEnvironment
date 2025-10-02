#!/usr/bin/env python3
"""Fetch recent measurements for a project from PostgreSQL and write to CSV."""
from __future__ import annotations

import csv
import os
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, Tuple

try:
    import psycopg  # type: ignore[import-untyped]
except ImportError as import_error:  # pragma: no cover - dependency guard
    raise SystemExit(
        "psycopg (v3) is required. Install it with 'pip install psycopg[binary]'"
    ) from import_error

PROJECT_ID = os.getenv("PROJECT_ID", "d4b83101-a39e-4d93-a0b2-0cece421e5ea")

RECENT_MEASUREMENTS_QUERY = """
    SELECT timestamp, variable_name, variable_value
    FROM public.recent_measurements
    WHERE project_id = %s
    ORDER BY timestamp DESC
    LIMIT %s;
"""


@dataclass
class DatabaseSettings:
    """Database connection settings with sensible defaults."""

    host: str = os.getenv("PGHOST", "localhost")
    port: int = int(os.getenv("PGPORT", "5432"))
    dbname: str = os.getenv("PGDATABASE", "lynus")
    user: str = os.getenv("PGUSER", "")
    password: str = os.getenv("PGPASSWORD", "")

    def as_connection_kwargs(self) -> dict[str, object]:
        return {
            "host": self.host,
            "port": self.port,
            "dbname": self.dbname,
            "user": self.user,
            "password": self.password,
        }


def fetch_recent_measurements(
    settings: DatabaseSettings, project_id: str, limit: int
) -> list[Tuple[datetime, str, float]]:
    """Fetch recent measurements from the materialized view for the project."""

    with psycopg.connect(**settings.as_connection_kwargs()) as connection:
        with connection.cursor() as cursor:
            cursor.execute(RECENT_MEASUREMENTS_QUERY, (project_id, limit))
            measurements = cursor.fetchall()

    return [
        (measurement_time, str(variable_name), float(variable_value))
        for measurement_time, variable_name, variable_value in measurements
    ]


def write_measurements_csv(
    measurements: Iterable[Tuple[datetime, str, float]], output_path: Path
) -> None:
    """Write measurements to a CSV file."""

    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["timestamp", "variable_name", "variable_value"])
        for measurement_time, variable_name, measurement_value in measurements:
            writer.writerow(
                [measurement_time.isoformat(), variable_name, measurement_value]
            )


def main() -> int:
    settings = DatabaseSettings()
    project_id = os.getenv("PROJECT_ID", PROJECT_ID)
    limit = int(os.getenv("RECENT_LIMIT", "10000000000000000"))

    try:
        measurements = fetch_recent_measurements(settings, project_id, limit)
    except psycopg.Error as error:  # pragma: no cover - psycopg specific
        print(f"Failed to fetch measurements: {error}", file=sys.stderr)
        return 1

    if not measurements:
        print(f"No recent measurements found for project {project_id}")
        return 0

    output_path = Path(f"{project_id}.csv")
    write_measurements_csv(measurements, output_path)
    print(f"Wrote {output_path} with {len(measurements)} rows")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
