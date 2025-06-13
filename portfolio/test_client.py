import requests
import json
import sys

def test_portfolio_service(portfolio_id, reference_currency, port=8000):
    """
    Test the portfolio service by making a request to the API endpoint.

    Args:
        portfolio_id (str): The ID of the portfolio to retrieve
        reference_currency (str): The currency to convert all position values to
        port (int, optional): The port number where the service is running. Defaults to 8000.
    """
    # API endpoint URL
    url = f"http://localhost:{port}/portfolio/{portfolio_id}?reference_currency={reference_currency}"

    try:
        # Make the request
        response = requests.get(url)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()

            # Print the JSON response
            print(json.dumps(data, indent=2))

            # Print portfolio information
            print(f"Portfolio ID: {data['portfolio_id']}")
            print(f"Reference Currency: {data['reference_currency']}")
            print(f"Total Portfolio Value: {data['total_portfolio_value']:.2f} {reference_currency}")
            print("\nInstrument Groups:")

            # Print instrument groups
            for group in data['instrument_groups']:
                print(f"\n  {group['instrument_type']}:")
                print(f"  Total Value: {group['total_value']:.2f} {reference_currency}")
                print("  Positions:")

                # Print positions in each group
                for position in group['positions']:
                    print(f"    - ID: {position['instrument_id']}")
                    print(f"      Quantity: {position['quantity']}")
                    print(f"      Original Value: {position['market_value']:.2f} {position['currency']}")
                    print(f"      Value in Ref Currency: {position['value_in_ref_currency']:.2f} {reference_currency}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the portfolio service is running.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) < 3 or len(sys.argv) > 4:
        print("Usage: python test_client.py <portfolio_id> <reference_currency> [<port>]")
        print("Example: python test_client.py portfolio_1 USD")
        print("Example with port: python test_client.py portfolio_1 USD 8001")
        sys.exit(1)

    # Get command line arguments
    portfolio_id = sys.argv[1]
    reference_currency = sys.argv[2]

    # Get optional port argument
    port = 8000
    if len(sys.argv) == 4:
        try:
            port = int(sys.argv[3])
        except ValueError:
            print(f"Error: Port must be a number, got {sys.argv[3]}")
            sys.exit(1)

    # Run the test
    test_portfolio_service(portfolio_id, reference_currency, port)
