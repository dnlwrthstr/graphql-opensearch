from seed_data.seed_partners import seed_partners
from seed_data.seed_portfolios import seed_portfolios
from seed_data.seed_instruments import seed_instruments

def seed_all():
    """Seed all data into OpenSearch"""
    seed_partners()
    seed_portfolios()
    seed_instruments()
    print("All data seeded successfully.")

if __name__ == "__main__":
    seed_all()