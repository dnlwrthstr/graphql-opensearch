from seed_data.seed_partners import seed_partners
from seed_data.seed_portfolios import seed_portfolios
from seed_data.seed_instruments import seed_instruments
import os
import argparse

def seed_all(force=False):
    """Seed all data into OpenSearch

    Args:
        force (bool): If True, seed data regardless of SEED_DATA environment variable.
                     If False, only seed data if SEED_DATA environment variable is set to "true".
    """
    # Check if we should seed data
    seed_data_env = os.environ.get("SEED_DATA", "false").lower()

    if not force and seed_data_env != "true":
        print("Skipping data seeding. Set SEED_DATA=true environment variable or use --force flag to seed data.")
        return

    seed_partners()
    seed_portfolios()
    seed_instruments()
    print("All data seeded successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed data into OpenSearch")
    parser.add_argument("--force", action="store_true", help="Force seeding data regardless of SEED_DATA environment variable")
    args = parser.parse_args()

    seed_all(force=args.force)
