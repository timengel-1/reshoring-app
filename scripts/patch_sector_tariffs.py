"""
Standalone patch script — adds tariff_sectors + export_tariff_weighted_mean
to an existing countries.json without re-downloading all other data.

Usage:
    python3 scripts/patch_sector_tariffs.py

Saves progress every 10 countries. Safe to re-run (skips countries that
already have tariff_sectors populated).
"""

import json
import os
import re
import time
import requests

BASE      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE, "src", "data", "countries.json")

# WITS product code → our sector key
WITS_PRODUCT_TO_SECTOR = {
    "Food":             "agriculture_food",
    "Textiles":         "textiles_apparel",
    "72-83_Metals":     "base_metals",
    "Chemical":         "chemicals",
    "84-85_MachElec":   "machinery_electrical",
    "86-89_Transport":  "transportation",
    "44-49_Wood":       "wood_paper",
    "68-71_StoneGlas":  "stone_glass",
}
ALL_SECTOR_KEYS = list(WITS_PRODUCT_TO_SECTOR.values())
WITS_BASE = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/tradestats-tariff"


def wits_fetch_all(iso3, indicator, year=2022, retries=2):
    """Single WITS call returning all product sector values for one indicator."""
    url = f"{WITS_BASE}/reporter/{iso3}/year/{year}/partner/WLD/product/all/indicator/{indicator}"
    for attempt in range(retries + 1):
        try:
            r = requests.get(url, timeout=20)
            if r.status_code == 200:
                result = {}
                for m in re.finditer(
                    r'PRODUCTCODE="([^"]+)"[^>]*>.*?OBS_VALUE="([0-9.]+)"',
                    r.text, re.DOTALL
                ):
                    pcode, val = m.group(1), float(m.group(2))
                    key = WITS_PRODUCT_TO_SECTOR.get(pcode)
                    if key:
                        result[key] = val
                return result
            elif r.status_code == 429:
                print(f"    Rate limited, waiting {3*(attempt+1)}s...")
                time.sleep(3 * (attempt + 1))
        except Exception as e:
            print(f"    Attempt {attempt+1} failed: {e}")
        if attempt < retries:
            time.sleep(1)
    return {}


def fetch_export_tariff(iso3, year=2022, retries=2):
    """Fetch aggregate export tariff (Total product) for one country."""
    url = f"{WITS_BASE}/reporter/{iso3}/year/{year}/partner/WLD/product/Total/indicator/XPRT-WGHTD-AVRG"
    for attempt in range(retries + 1):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                m = re.search(r'OBS_VALUE="([0-9.]+)"', r.text)
                if m:
                    return round(float(m.group(1)), 2)
            elif r.status_code == 429:
                time.sleep(3 * (attempt + 1))
        except Exception as e:
            print(f"    Export tariff attempt {attempt+1} failed: {e}")
        if attempt < retries:
            time.sleep(1)
    return None


def fetch_sectors(iso3):
    """Returns (sectors_dict, export_tariff) for one country."""
    wmean = wits_fetch_all(iso3, "AHS-WGHTD-AVRG")
    time.sleep(0.35)
    smean = wits_fetch_all(iso3, "AHS-SMPL-AVRG")
    time.sleep(0.35)
    xprt  = fetch_export_tariff(iso3)
    time.sleep(0.35)

    sectors = {
        key: {
            "weighted_mean": round(wmean[key], 2) if key in wmean else None,
            "simple_mean":   round(smean[key], 2) if key in smean else None,
        }
        for key in ALL_SECTOR_KEYS
    }
    return sectors, xprt


def main():
    print(f"Loading {DATA_PATH}...")
    with open(DATA_PATH) as f:
        countries = json.load(f)

    # Only process countries that have aggregate tariff data and no sector data yet
    to_process = [
        c for c in countries
        if c.get("trade", {}).get("tariff_rate_weighted_mean") is not None
        and c.get("trade", {}).get("tariff_sectors") is None
    ]
    already_done = sum(1 for c in countries if c.get("trade", {}).get("tariff_sectors") is not None)
    print(f"  {len(countries)} total countries")
    print(f"  {already_done} already have sector tariffs (skipping)")
    print(f"  {len(to_process)} to fetch\n")

    code_to_idx = {c["code"]: i for i, c in enumerate(countries)}
    done = 0
    errors = 0

    for i, country in enumerate(to_process):
        code = country["code"]
        name = country["name"]
        print(f"[{i+1}/{len(to_process)}] {code} {name}...")
        try:
            sectors, xprt = fetch_sectors(code)
            has_data = any(v["weighted_mean"] is not None for v in sectors.values())

            idx = code_to_idx[code]
            countries[idx]["trade"]["tariff_sectors"] = sectors if has_data else None
            countries[idx]["trade"]["export_tariff_weighted_mean"] = xprt

            sector_count = sum(1 for v in sectors.values() if v["weighted_mean"] is not None)
            print(f"  {sector_count}/8 sectors, export={xprt}%")
            done += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            errors += 1

        # Save progress every 10 countries
        if (i + 1) % 10 == 0:
            with open(DATA_PATH, "w") as f:
                json.dump(countries, f, indent=2)
            print(f"  --- Progress saved ({i+1} processed) ---\n")

    # Final save
    with open(DATA_PATH, "w") as f:
        json.dump(countries, f, indent=2)

    total_with_sectors = sum(1 for c in countries if c.get("trade", {}).get("tariff_sectors") is not None)
    print(f"\n✓ Done. {done} fetched, {errors} errors.")
    print(f"  {total_with_sectors} countries now have sector tariff data.")


if __name__ == "__main__":
    main()
