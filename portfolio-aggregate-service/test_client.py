import requests
import json
import sys
from tabulate import tabulate

def test_portfolio_service(portfolio_id, reference_currency, port=8000, endpoint="portfolio"):
    """
    Test the portfolio service by making a request to the API endpoint.

    Args:
        portfolio_id (str): The ID of the portfolio to retrieve
        reference_currency (str): The currency to convert all position values to
        port (int, optional): The port number where the service is running. Defaults to 8000.
        endpoint (str, optional): The endpoint to use. Defaults to "portfolio".
    """
    # API endpoint URL
    url = f"http://localhost:{port}/{endpoint}/{portfolio_id}?reference_currency={reference_currency}"

    try:
        # Make the request
        response = requests.get(url)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()

            # Print the JSON response
            print(json.dumps(data, indent=2))

            # Create portfolio header table
            portfolio_header = [
                ["Portfolio ID", data['portfolio_id']],
                ["Reference Currency", data['reference_currency']],
                ["Total Portfolio Value", f"{data['total_portfolio_value']:.2f} {reference_currency}"]
            ]
            print("\nPORTFOLIO")
            print(tabulate(portfolio_header, tablefmt="grid"))

            # Print instrument groups table
            print("\nINSTRUMENT GROUPS")
            groups_table = []
            for group in data['instrument_groups']:
                groups_table.append([
                    group['instrument_type'],
                    group['positions'].__len__(),
                    f"{group['total_value']:.2f} {reference_currency}"
                ])

            print(tabulate(groups_table, 
                  headers=["Instrument Type", "Positions Count", "Total Value"], 
                  tablefmt="grid"))

            # Print detailed positions for each group
            for group in data['instrument_groups']:
                print(f"\n{group['instrument_type'].upper()} POSITIONS")
                positions_table = []
                for position in group['positions']:
                    positions_table.append([
                        position['instrument_id'],
                        position['quantity'],
                        f"{position['market_value']:.2f} {position['currency']}",
                        f"{position['value_in_ref_currency']:.2f} {reference_currency}"
                    ])

                print(tabulate(positions_table, 
                      headers=["Instrument ID", "Quantity", "Market Value", f"Value in {reference_currency}"], 
                      tablefmt="grid"))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the portfolio service is running.")
    except Exception as e:
        print(f"Error: {e}")

def test_portfolio_aggregates(portfolio_id, reference_currency, port=8000):
    """
    Test the portfolio aggregates endpoint.

    Args:
        portfolio_id (str): The ID of the portfolio to retrieve
        reference_currency (str): The currency to convert all position values to
        port (int, optional): The port number where the service is running. Defaults to 8000.
    """
    # API endpoint URL
    url = f"http://localhost:{port}/portfolio-aggregates/{portfolio_id}?reference_currency={reference_currency}"

    try:
        # Make the request
        response = requests.get(url)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()

            # Print the JSON response
            print(json.dumps(data, indent=2))

            # Check if the response has the new format with a "portfolio" key
            if "portfolio" in data:
                portfolio = data["portfolio"]

                # Print portfolio summary
                print("\nPORTFOLIO SUMMARY")
                portfolio_summary = [
                    ["Portfolio ID", portfolio["id"]],
                    ["Valuation Currency", portfolio["valuation_currency"]],
                    ["Total Value", f"{portfolio['value']:.2f} {portfolio['valuation_currency']}"]
                ]
                print(tabulate(portfolio_summary, tablefmt="grid"))

                # Print instrument type exposure table
                print("\nINSTRUMENT TYPE EXPOSURE")
                instrument_table = []
                for instrument_exp in portfolio["instrument_exposures"]:
                    instrument_table.append([
                        instrument_exp["instrument_type"],
                        f"{instrument_exp['value']:.2f} {instrument_exp['valuation_currency']}",
                        f"{instrument_exp['value_in_valuation_currency']:.2f} {instrument_exp['valuation_currency']}"
                    ])

                print(tabulate(instrument_table, 
                      headers=["Instrument Type", "Value", "Total Portfolio Value"], 
                      tablefmt="grid"))

                # Print currency exposure table
                print("\nCURRENCY EXPOSURE")
                currency_table = []
                for currency_exp in portfolio["currency_exposure"]:
                    currency_table.append([
                        currency_exp["currency"],
                        f"{currency_exp['value']:.2f} {portfolio['valuation_currency']}"
                    ])

                print(tabulate(currency_table, 
                      headers=["Currency", "Value"], 
                      tablefmt="grid"))
            else:
                # Handle the old format for backward compatibility
                # Print instrument type exposure table
                print("\nINSTRUMENT TYPE EXPOSURE")
                instrument_table = []
                for instrument_exp in data:
                    instrument_table.append([
                        instrument_exp['instrument_type'],
                        f"{instrument_exp['value']:.2f} {instrument_exp['valuation_currency']}",
                        f"{instrument_exp['value_in_valuation_currency']:.2f} {instrument_exp['valuation_currency']}"
                    ])

                print(tabulate(instrument_table, 
                      headers=["Instrument Type", "Value", "Total Portfolio Value"], 
                      tablefmt="grid"))

                # Print currency exposure table (using the first item's currency exposure as they're all the same)
                if data:
                    print("\nCURRENCY EXPOSURE")
                    currency_table = []
                    for currency_exp in data[0]['currency_exposure']:
                        currency_table.append([
                            currency_exp['currency'],
                            f"{currency_exp['value']:.2f} {data[0]['valuation_currency']}"
                        ])

                    print(tabulate(currency_table, 
                          headers=["Currency", "Value"], 
                          tablefmt="grid"))

            return data
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the portfolio service is running.")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) < 3 or len(sys.argv) > 5:
        print("Usage: python test_client.py <portfolio_id> <reference_currency> [<port>] [--aggregates]")
        print("Example: python test_client.py portfolio_1 USD")
        print("Example with port: python test_client.py portfolio_1 USD 8001")
        print("Example with aggregates: python test_client.py portfolio_1 USD --aggregates")
        print("Example with port and aggregates: python test_client.py portfolio_1 USD 8001 --aggregates")
        sys.exit(1)

    # Get command line arguments
    portfolio_id = sys.argv[1]
    reference_currency = sys.argv[2]

    # Get optional port argument and check for --aggregates flag
    port = 8000
    use_aggregates = False

    for arg in sys.argv[3:]:
        if arg == "--aggregates":
            use_aggregates = True
        else:
            try:
                port = int(arg)
            except ValueError:
                print(f"Error: Port must be a number, got {arg}")
                sys.exit(1)

    # Run the test
    if use_aggregates:
        test_portfolio_aggregates(portfolio_id, reference_currency, port)
    else:
        test_portfolio_service(portfolio_id, reference_currency, port)
