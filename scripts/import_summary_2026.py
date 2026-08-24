"""Create the Summary 2026 table and import its first ten CSV columns."""

import argparse
import csv
import os
from pathlib import Path

import psycopg
from psycopg import sql
from dotenv import load_dotenv

TABLE_NAME = "summary_2026"
COLUMNS = (
    "sr_no",
    "customer_name",
    "rfq_description",
    "rfq_date",
    "due_date",
    "status",
    "po_status",
    "po_amount",
    "bid_security",
    "remarks",
)


def parse_csv(csv_path: Path) -> list[dict[str, str | None]]:
    rows: list[dict[str, str | None]] = []
    with csv_path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.reader(file, strict=True)
        headings = next(reader, None)
        if headings is None:
            raise ValueError("The CSV file is empty.")

        actual_headings = [heading.strip() for heading in headings[:10]]
        expected_headings = [
            "Sr. #",
            "Customer Name",
            "RFQ / Description",
            "RFQ Date",
            "Due Date",
            "Status",
            "P.O Status",
            "P.O Amount",
            "Bid Security",
            "Remarks",
        ]
        if actual_headings != expected_headings:
            raise ValueError(
                "The first ten headings do not match the expected Summary 2026 headings. "
                f"Found: {actual_headings}"
            )

        for line_number, values in enumerate(reader, 2):
            if len(values) > 10 and any(value.strip() for value in values[10:]):
                raise ValueError(f"Row {line_number} has data after column J.")
            values = (values + [""] * 10)[:10]
            rows.append(
                {
                    column: value.strip() or None
                    for column, value in zip(COLUMNS, values)
                }
            )
    return rows


def import_rows(database_url: str, rows: list[dict[str, str | None]], replace: bool) -> None:
    table = sql.Identifier(TABLE_NAME)
    columns = sql.SQL(", ").join(sql.Identifier(column) for column in COLUMNS)
    placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in COLUMNS)
    values = [tuple(row[column] for column in COLUMNS) for row in rows]

    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                sql.SQL("CREATE TABLE IF NOT EXISTS {} ({})").format(
                    table,
                    sql.SQL(", ").join(
                        [sql.SQL("{} text").format(sql.Identifier(column)) for column in COLUMNS]
                    ),
                )
            )
            if replace:
                cursor.execute(sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY").format(table))
            if values:
                cursor.executemany(
                    sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
                        table, columns, placeholders
                    ),
                    values,
                )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", type=Path)
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Remove existing rows before importing the CSV.",
    )
    args = parser.parse_args()

    load_dotenv()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit(
            "DATABASE_URL is missing. Get the PostgreSQL connection string from "
            "Supabase Dashboard > Connect and add it to your local .env file."
        )
    if database_url.startswith("http://") or database_url.startswith("https://"):
        raise SystemExit(
            "DATABASE_URL contains the Supabase API URL. Use the PostgreSQL connection "
            "string from Supabase Dashboard > Connect instead. It starts with postgres://."
        )

    rows = parse_csv(args.csv_path)
    import_rows(database_url, rows, args.replace)
    print(f"Imported {len(rows)} rows into {TABLE_NAME}.")


if __name__ == "__main__":
    main()
