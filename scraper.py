"""
Scrape current Chief Ministers and Governors of Indian states/UTs from Wikipedia
and save structured data to state_data.json.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup, Tag

USER_AGENT = "IndiaGKPortal/1.0 (educational project; Python requests)"
OUTPUT_FILE = Path(__file__).resolve().parent / "state_data.json"

CM_URL = "https://en.wikipedia.org/wiki/List_of_current_Indian_chief_ministers"
GOVERNOR_URL = "https://en.wikipedia.org/wiki/List_of_current_Indian_governors"
LOK_SABHA_URL = "https://en.wikipedia.org/wiki/List_of_constituencies_of_the_Lok_Sabha"
RAJYA_SABHA_URL = "https://en.wikipedia.org/wiki/Rajya_Sabha"
GSDP_URL = "https://en.wikipedia.org/wiki/List_of_Indian_states_and_union_territories_by_GDP"
SEX_RATIO_URL = "https://en.wikipedia.org/wiki/List_of_states_and_union_territories_of_India_by_sex_ratio"
CPI_PDF_URL = (
  "https://www.mospi.gov.in/uploads/latestReleases/"
  "latest_release_1770891893893_6b458c0a-c327-4fef-a554-41131ea67273_Press_Relase_of_CPI_for_Jan26.pdf"
)

STATE_NAME_ALIASES = {
  "NCT of Delhi": "Delhi",
  "National Capital Territory of Delhi": "Delhi",
  "Jammu And Kashmir": "Jammu and Kashmir",
  "Jammu & Kashmir": "Jammu and Kashmir",
  "Jammu & Kashmir*": "Jammu and Kashmir",
  "Andaman And Nicobar Islands": "Andaman and Nicobar Islands",
  "Andaman & Nicobar Islands": "Andaman and Nicobar Islands",
  "The Dadra And Nagar Haveli And Daman And Diu": "Dadra and Nagar Haveli and Daman and Diu",
  "Dadra & Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "Daman & Diu": "Dadra and Nagar Haveli and Daman and Diu",
  "Keralam": "Kerala",
}

GSDP_FALLBACKS: dict[str, dict[str, int | str]] = {
  "Ladakh": {"gsdp_crore_inr": 8304, "gsdp_fiscal_year": "2023-24"},
  "Lakshadweep": {"gsdp_crore_inr": 324, "gsdp_fiscal_year": "2023"},
}

SEX_RATIO_OVERRIDES: dict[str, dict[str, int | str]] = {
  "Ladakh": {
    "sex_ratio_females_per_1000_males": 1125,
    "sex_ratio_source": "NFHS-5 (total population sex ratio)",
    "reference_period": "2019-21",
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    "sex_ratio_females_per_1000_males": 817,
    "sex_ratio_source": "NFHS-5 (sex ratio at birth; averaged for merged UT)",
    "reference_period": "2019-21",
  },
}

# Canonical 28 states + 8 union territories for GK portal consistency.
STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]


def fetch_page(url: str) -> BeautifulSoup:
  response = requests.get(
    url,
    headers={"User-Agent": USER_AGENT},
    timeout=30,
  )
  response.raise_for_status()
  return BeautifulSoup(response.text, "html.parser")


def clean_text(element: Tag | None) -> str:
  if element is None:
    return ""
  text = element.get_text(" ", strip=True)
  text = re.sub(r"\[[^\]]+\]", "", text)
  text = re.sub(r"[†‡*]+", "", text)
  return re.sub(r"\s+", " ", text).strip()


def normalize_state_name(name: str) -> str:
  name = re.sub(r"\[[^\]]+\]", "", name)
  name = re.sub(r"\s+", " ", name).strip()
  return STATE_NAME_ALIASES.get(name, name)


def parse_table(table: Tag) -> list[dict[str, str]]:
  header_row = table.find("tr")
  headers = [clean_text(th) for th in header_row.find_all(["th", "td"])]
  rows: list[dict[str, str]] = []

  for row in table.find_all("tr")[1:]:
    cells = row.find_all(["td", "th"])
    if not cells:
      continue
    values = [clean_text(cell) for cell in cells]
    if len(values) < len(headers):
      values.extend([""] * (len(headers) - len(values)))
    rows.append(dict(zip(headers, values)))

  return rows


def pick_column(row: dict[str, str], *candidates: str) -> str:
  lowered = {key.lower(): value for key, value in row.items()}
  for candidate in candidates:
    for key, value in lowered.items():
      if candidate in key and value:
        return value
  return ""


def looks_like_date(value: str) -> bool:
  return bool(
    re.search(
      r"\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b",
      value,
      re.IGNORECASE,
    )
  )


def pick_officeholder(row: dict[str, str]) -> str:
  officeholder = pick_column(row, "officeholder")
  if officeholder and not looks_like_date(officeholder):
    return officeholder
  portrait = pick_column(row, "portrait")
  if portrait and not looks_like_date(portrait):
    return portrait
  return officeholder


def scrape_officeholders(soup: BeautifulSoup) -> dict[str, str]:
  result: dict[str, str] = {}

  for table in soup.find_all("table", class_="wikitable"):
    header_row = table.find("tr")
    if not header_row:
      continue

    headers = [clean_text(th).lower() for th in header_row.find_all(["th", "td"])]
    if not any("officeholder" in header for header in headers):
      continue

    for row in parse_table(table):
      state = normalize_state_name(pick_column(row, "state/ut", "state", "union territory"))
      officeholder = pick_officeholder(row)
      if state and officeholder and not looks_like_date(officeholder):
        result[state] = officeholder

  return result


def scrape_chief_ministers() -> dict[str, str]:
  return scrape_officeholders(fetch_page(CM_URL))


def scrape_governors() -> dict[str, str]:
  return scrape_officeholders(fetch_page(GOVERNOR_URL))


def parse_int(value: str) -> int | None:
  digits = re.sub(r"[^\d]", "", value)
  return int(digits) if digits else None


def parse_float(value: str) -> float | None:
  cleaned = value.replace(",", "").strip()
  if not cleaned or cleaned in {"-", "N/A", "–"}:
    return None
  try:
    return float(cleaned)
  except ValueError:
    return None


def billion_to_crore_inr(value: float) -> int:
  # Wikipedia GSDP tables use Indian rupee billions (1 billion = 100 crore).
  return int(round(value * 100))


def scrape_lok_sabha_seats() -> dict[str, int]:
  soup = fetch_page(LOK_SABHA_URL)
  result: dict[str, int] = {}

  for table in soup.find_all("table", class_="wikitable"):
    header_row = table.find("tr")
    if not header_row:
      continue

    headers = [clean_text(th).lower() for th in header_row.find_all(["th", "td"])]
    if not any("state" in header and "union" in header for header in headers):
      continue

    for row in table.find_all("tr")[2:]:
      cells = [clean_text(cell) for cell in row.find_all(["td", "th"])]
      if len(cells) < 6:
        continue

      state = normalize_state_name(cells[1])
      seats = parse_int(cells[5])
      if state and seats is not None and state.lower() != "overall":
        result[state] = seats

  return result


def scrape_rajya_sabha_seats() -> dict[str, int]:
  soup = fetch_page(RAJYA_SABHA_URL)
  result: dict[str, int] = {}

  for table in soup.find_all("table", class_="wikitable"):
    header_row = table.find("tr")
    if not header_row:
      continue

    headers = [clean_text(th).lower() for th in header_row.find_all(["th", "td"])]
    if not ("state/ut" in headers and "seats" in headers):
      continue

    for row in parse_table(table):
      state = normalize_state_name(pick_column(row, "state/ut"))
      seats = parse_int(pick_column(row, "seats"))
      if state and seats is not None and state.lower() not in {"total", "presidential nominees"}:
        result[state] = seats

  return result


def scrape_gsdp() -> dict[str, dict[str, int | str]]:
  soup = fetch_page(GSDP_URL)
  tables = soup.find_all("table", class_="wikitable")
  current_rows = parse_table(tables[0]) if tables else []
  historical_rows = parse_table(tables[1]) if len(tables) > 1 else []

  historical_2022_23: dict[str, float] = {}
  for row in historical_rows:
    state = normalize_state_name(row.get("State/Union Territory", "").replace(" *", ""))
    if not state:
      continue
    for column, value in row.items():
      if column.replace("–", "-").startswith("2022-23"):
        parsed = parse_float(value)
        if parsed is not None:
          historical_2022_23[state] = parsed

  result: dict[str, dict[str, int | str]] = {}
  for row in current_rows:
    state = normalize_state_name(row.get("State/Union Territory", ""))
    if not state:
      continue

    for fiscal_year, column in [
      ("2024-25", "2024-25"),
      ("2025-26", "2025-26"),
      ("2023-24", "2023-24"),
    ]:
      value = parse_float(row.get(column, ""))
      if value is not None:
        result[state] = {
          "gsdp_crore_inr": billion_to_crore_inr(value),
          "gsdp_fiscal_year": fiscal_year,
        }
        break

    if state not in result:
      fallback = historical_2022_23.get(state)
      if fallback is not None:
        result[state] = {
          "gsdp_crore_inr": billion_to_crore_inr(fallback),
          "gsdp_fiscal_year": "2022-23",
        }

  for state, fallback in GSDP_FALLBACKS.items():
    if state not in result:
      result[state] = fallback

  return result


def scrape_sex_ratio() -> dict[str, dict[str, int | float | str]]:
  soup = fetch_page(SEX_RATIO_URL)
  table = soup.find("table", class_="wikitable")
  result: dict[str, dict[str, int | float | str]] = {}

  for row in table.find_all("tr")[2:]:
    cells = [clean_text(cell) for cell in row.find_all(["td", "th"])]
    if len(cells) < 6 or cells[1] in {"India", ""}:
      continue

    state = normalize_state_name(cells[1])
    nfhs5 = parse_int(cells[3])
    census_2011 = parse_int(cells[5])
    females_per_1000_males = nfhs5 or census_2011
    if not state or females_per_1000_males is None:
      continue

    result[state] = {
      "sex_ratio_females_per_1000_males": females_per_1000_males,
      "male_to_female_ratio": round(1000 / females_per_1000_males, 3),
      "sex_ratio_source": "NFHS-5 (sex ratio at birth)" if nfhs5 else "2011 Census",
      "reference_period": "2019-21" if nfhs5 else "2011",
    }

  for state, override in SEX_RATIO_OVERRIDES.items():
    females_per_1000_males = int(override["sex_ratio_females_per_1000_males"])
    result[state] = {
      "sex_ratio_females_per_1000_males": females_per_1000_males,
      "male_to_female_ratio": round(1000 / females_per_1000_males, 3),
      "sex_ratio_source": str(override["sex_ratio_source"]),
      "reference_period": str(override["reference_period"]),
    }

  return result


def scrape_state_cpi() -> dict[str, dict[str, float | str]]:
  from io import BytesIO

  from pypdf import PdfReader

  response = requests.get(
    CPI_PDF_URL,
    headers={"User-Agent": USER_AGENT},
    timeout=60,
  )
  response.raise_for_status()
  reader = PdfReader(BytesIO(response.content))
  text = " ".join(page.extract_text() or "" for page in reader.pages)
  text = re.sub(r"\s+", " ", text)

  full_pattern = re.compile(
    r"(?P<state>Andaman And Nicobar Islands|Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|"
    r"Chandigarh|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jammu And Kashmir|"
    r"Jharkhand|Karnataka|Kerala|Ladakh|Lakshadweep|Madhya Pradesh|Maharashtra|Manipur|"
    r"Meghalaya|Mizoram|Nagaland|NCT of Delhi|Odisha|Puducherry|Punjab|Rajasthan|Sikkim|"
    r"Tamil Nadu|Telangana|The Dadra And Nagar Haveli And\s+Daman And Diu|Tripura|"
    r"Uttar Pradesh|Uttarakhand|West Bengal)"
    r"\s+\*?\s*(?P<rural_index>\d+\.\d{2})\s+(?P<urban_index>\d+\.\d{2})\s+(?P<combined_index>\d+\.\d{2})\s+"
    r"(?P<rural_inflation>-?\d+\.\d{2})\s+(?P<urban_inflation>-?\d+\.\d{2})\s+(?P<combined_inflation>-?\d+\.\d{2})"
  )
  urban_only_pattern = re.compile(
    r"Chandigarh\s+\*\s+(?P<urban_index>\d+\.\d{2})\s+(?P<combined_index>\d+\.\d{2})\s+\*\s+"
    r"(?P<urban_inflation>-?\d+\.\d{2})\s+(?P<combined_inflation>-?\d+\.\d{2})"
  )

  result: dict[str, dict[str, float | str]] = {}
  for match in full_pattern.finditer(text):
    state = normalize_state_name(re.sub(r"\s+", " ", match.group("state")).strip())
    result[state] = {
      "consumer_price_index": float(match.group("combined_index")),
      "inflation_yoy_percent": float(match.group("combined_inflation")),
      "cpi_reference_month": "2026-01",
      "cpi_sector": "combined",
    }

  urban_match = urban_only_pattern.search(text)
  if urban_match:
    result["Chandigarh"] = {
      "consumer_price_index": float(urban_match.group("combined_index")),
      "inflation_yoy_percent": float(urban_match.group("combined_inflation")),
      "cpi_reference_month": "2026-01",
      "cpi_sector": "urban",
    }

  if not result:
    raise ValueError("Could not parse state-wise CPI data from MOSPI release")

  return result


def scrape_economic_metrics() -> dict[str, dict[str, int | float | str]]:
  gsdp = scrape_gsdp()
  cpi = scrape_state_cpi()
  metrics: dict[str, dict[str, int | float | str]] = {}

  for state in STATES_AND_UTS:
    state_gsdp = gsdp.get(state, {})
    state_cpi = cpi.get(state, {})
    metrics[state] = {
      "gsdp_crore_inr": state_gsdp.get("gsdp_crore_inr"),
      "gsdp_fiscal_year": state_gsdp.get("gsdp_fiscal_year"),
      "consumer_price_index": state_cpi.get("consumer_price_index"),
      "inflation_yoy_percent": state_cpi.get("inflation_yoy_percent"),
      "cpi_reference_month": state_cpi.get("cpi_reference_month"),
      "cpi_sector": state_cpi.get("cpi_sector"),
    }

  return metrics


def scrape_demographics() -> dict[str, dict[str, int | float | str]]:
  return scrape_sex_ratio()


def scrape_parliamentary_metrics() -> dict[str, dict[str, int]]:
  lok_sabha = scrape_lok_sabha_seats()
  rajya_sabha = scrape_rajya_sabha_seats()
  metrics: dict[str, dict[str, int]] = {}

  for state in STATES_AND_UTS:
    metrics[state] = {
      "lok_sabha_seats": lok_sabha[state],
      "rajya_sabha_seats": rajya_sabha.get(state, 0),
    }

  return metrics


def load_existing_data() -> dict | None:
  if not OUTPUT_FILE.exists():
    return None
  return json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))


def enrich_existing_data() -> dict:
  existing = load_existing_data()
  if existing is None:
    raise FileNotFoundError(f"No existing data found at {OUTPUT_FILE}")

  parliamentary_metrics = scrape_parliamentary_metrics()
  for entry in existing["states"]:
    state = entry["state"]
    entry["parliamentary_metrics"] = parliamentary_metrics[state]

  existing.setdefault("source", {})
  existing["source"]["lok_sabha"] = LOK_SABHA_URL
  existing["source"]["rajya_sabha"] = RAJYA_SABHA_URL
  existing["last_updated"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
  return existing


def enrich_economic_demographic_data() -> dict:
  existing = load_existing_data()
  if existing is None:
    raise FileNotFoundError(f"No existing data found at {OUTPUT_FILE}")

  economic_metrics = scrape_economic_metrics()
  demographics = scrape_demographics()

  for entry in existing["states"]:
    state = entry["state"]
    entry["economic_metrics"] = economic_metrics[state]
    entry["demographics"] = demographics[state]

  existing.setdefault("source", {})
  existing["source"]["gsdp"] = GSDP_URL
  existing["source"]["cpi"] = CPI_PDF_URL
  existing["source"]["sex_ratio"] = SEX_RATIO_URL
  existing["last_updated"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
  return existing


def build_state_data() -> dict:
  chief_ministers = scrape_chief_ministers()
  governors = scrape_governors()
  parliamentary_metrics = scrape_parliamentary_metrics()

  states: list[dict[str, str | None | dict[str, int]]] = []
  for state in STATES_AND_UTS:
    states.append(
      {
        "state": state,
        "chief_minister": chief_ministers.get(state),
        "governor": governors.get(state),
        "parliamentary_metrics": parliamentary_metrics[state],
      }
    )

  return {
    "source": {
      "chief_ministers": CM_URL,
      "governors": GOVERNOR_URL,
      "lok_sabha": LOK_SABHA_URL,
      "rajya_sabha": RAJYA_SABHA_URL,
    },
    "last_updated": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "total_states_and_uts": len(states),
    "states": states,
  }


def main() -> None:
  import sys

  if "--economic" in sys.argv:
    data = enrich_economic_demographic_data()
    print(f"Enriched existing data with economic and demographic metrics for {data['total_states_and_uts']} states/UTs")
  elif OUTPUT_FILE.exists():
    data = enrich_existing_data()
    print(f"Enriched existing data with parliamentary metrics for {data['total_states_and_uts']} states/UTs")
  else:
    data = build_state_data()
    print(f"Saved {data['total_states_and_uts']} states/UTs to {OUTPUT_FILE}")

  OUTPUT_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
  print(f"Updated {OUTPUT_FILE}")


if __name__ == "__main__":
  main()
