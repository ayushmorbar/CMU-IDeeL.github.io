import argparse
import os
import re
import subprocess
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo
from ruamel.yaml import YAML

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))

def parse_lecture_date(date_str, year=2026):
    parts = date_str.split("<br>")
    target_part = parts[1].strip() if len(parts) > 1 else parts[0].strip()
    month_day = target_part.split()
    month_str, day = month_day[0].strip(), int(month_day[1].strip())
    try:
        month = datetime.strptime(month_str, "%b").month
    except ValueError:
        month = datetime.strptime(month_str, "%B").month
    return date(year, month, day)

def find_slide_by_lecture_number(slides_dir, lecture_num):
    n = int(lecture_num)
    pattern = re.compile(rf"(?<![A-Za-z0-9])lec(?:ture)?[\s._-]*0*{n}(?!\d)", re.I)
    for name in os.listdir(slides_dir):
        if not name.lower().endswith(".pdf"):
            continue
        base = os.path.splitext(name)[0]
        if pattern.search(base):
            print(f"[INFO] Found lecture slides for lecture {n}: {name}")
            return name
    return None

def upload_slides(semester="f26"):
    yaml = YAML()
    yaml.preserve_quotes = True
    yaml.indent(mapping=2, sequence=4, offset=2)

    lectures_yaml_path = os.path.join(REPO_ROOT, "content", "semesters", semester.lower(), "lectures.yaml")
    slides_dir = os.path.join(REPO_ROOT, semester.upper(), "documents", "slides")

    if not os.path.isfile(lectures_yaml_path):
        print(f"[ERROR] lectures.yaml not found at: {lectures_yaml_path}")
        return False
    if not os.path.isdir(slides_dir):
        print(f"[ERROR] Slides directory not found at: {slides_dir}")
        return False

    tz = ZoneInfo("America/New_York")
    now = datetime.now(tz)
    today = now.date()

    with open(lectures_yaml_path, "r", encoding="utf-8") as f:
        data = yaml.load(f)
    lectures = data.get("lectures", [])

    target = None
    lec_num = None
    for lec in lectures:
        if lec.get("number", -1) == 0:
            continue
        raw_date = lec.get("date", "")
        if not raw_date:
            continue
        try:
            lec_date = parse_lecture_date(raw_date, year=now.year)
        except Exception:
            continue
        if lec_date == today:
            target = lec
            lec_num = lec.get("number")
            break

    if target is None or lec_num is None:
        print(f"[INFO] No lecture scheduled for today ({today}) in {semester.upper()}.")
        return False

    print(f"[INFO] Target Lecture Number: {lec_num}, scheduled for {today}")

    slides_videos = target.get("slides_videos", [])
    for item in slides_videos:
        if item.get("text") == "Slides" and item.get("url"):
            print("[INFO] Slides already linked for this lecture.")
            return False

    pdf_name = find_slide_by_lecture_number(slides_dir, lec_num)
    if not pdf_name:
        print(f"[WARN] No slide PDF matching lecture {lec_num} found in {slides_dir}.")
        return False

    rel_pdf_path = f"./documents/slides/{pdf_name}"
    target["slides_videos"].insert(0, {"text": "Slides", "url": rel_pdf_path})

    with open(lectures_yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)
    print(f"[SUCCESS] Linked slides {rel_pdf_path} to lecture {lec_num}.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deterministic slide uploader for semester content")
    parser.add_argument("--semester", default="f26", help="Semester identifier (e.g. f26)")
    args = parser.parse_args()
    upload_slides(args.semester)
