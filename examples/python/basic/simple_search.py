#!/usr/bin/env python3
"""
Simple Search Example
Basic postal code search functionality for Kodepos API Indonesia

This example demonstrates the simplest way to search for postal codes
using the Kodepos API Indonesia with Python.

Author: Maxwell Alpha
License: MIT
"""

import requests
import json
import sys
from typing import Dict, List, Any, Optional

# Configuration
API_BASE_URL = "https://your-api.workers.dev"
TIMEOUT_SECONDS = 10
USER_AGENT = "Kodepos-Python-Example/1.0"


class SimpleKodeposClient:
    """Simple client for Kodepos API Indonesia"""

    def __init__(self, base_url: str = API_BASE_URL):
        """
        Initialize the client

        Args:
            base_url: Base URL for the API
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate'
        })

    def search_postal_codes(self, query: str) -> Dict[str, Any]:
        """
        Search for postal codes by query

        Args:
            query: Search query (village, district, city, or postal code)

        Returns:
            API response data

        Raises:
            ValueError: If query is invalid
            requests.RequestException: If request fails
        """
        if not query or not isinstance(query, str):
            raise ValueError("Query must be a non-empty string")

        query = query.strip()
        if len(query) < 2:
            raise ValueError("Query must be at least 2 characters long")

        url = f"{self.base_url}/search"
        params = {'q': query}

        try:
            response = self.session.get(
                url,
                params=params,
                timeout=TIMEOUT_SECONDS
            )
            response.raise_for_status()
            return response.json()

        except requests.Timeout:
            raise requests.RequestException(f"Request timeout after {TIMEOUT_SECONDS} seconds")
        except requests.ConnectionError:
            raise requests.RequestException("Failed to connect to API")
        except requests.HTTPError as e:
            raise requests.RequestException(f"HTTP error: {e.response.status_code}")

    def detect_location(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Detect postal code by coordinates

        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate

        Returns:
            API response data

        Raises:
            ValueError: If coordinates are invalid
            requests.RequestException: If request fails
        """
        # Validate Indonesian coordinate bounds
        if not (-11 <= latitude <= 6):
            raise ValueError("Latitude must be between -11 and 6 degrees (Indonesian bounds)")
        if not (95 <= longitude <= 141):
            raise ValueError("Longitude must be between 95 and 141 degrees (Indonesian bounds)")

        url = f"{self.base_url}/detect"
        params = {'latitude': latitude, 'longitude': longitude}

        try:
            response = self.session.get(
                url,
                params=params,
                timeout=TIMEOUT_SECONDS
            )
            response.raise_for_status()
            return response.json()

        except requests.Timeout:
            raise requests.RequestException(f"Request timeout after {TIMEOUT_SECONDS} seconds")
        except requests.ConnectionError:
            raise requests.RequestException("Failed to connect to API")
        except requests.HTTPError as e:
            raise requests.RequestException(f"HTTP error: {e.response.status_code}")


def format_results(results: List[Dict[str, Any]]) -> None:
    """
    Display search results in a user-friendly format

    Args:
        results: List of postal code results
    """
    if not results:
        print("No results found.")
        return

    print(f"\n📋 Found {len(results)} results:")
    print("=" * 60)

    for index, item in enumerate(results, 1):
        print(f"\n{index}. 🏠 {item.get('village', 'N/A')}")
        print(f"   📍 Postal Code: {item.get('code', 'N/A')}")
        print(f"   🏘️  District: {item.get('district', 'N/A')}")
        print(f"   🌆 Regency: {item.get('regency', 'N/A')}")
        print(f"   🗺️  Province: {item.get('province', 'N/A')}")

        # Coordinates
        lat = item.get('latitude')
        lng = item.get('longitude')
        if lat and lng:
            print(f"   🧭 Coordinates: {lat:.6f}, {lng:.6f}")

        # Additional info
        if item.get('elevation'):
            print(f"   ⛰️  Elevation: {item['elevation']}m")

        if item.get('timezone'):
            print(f"   🕐 Timezone: {item['timezone']}")

        if item.get('distance'):
            print(f"   📏 Distance: {item['distance']:.3f} km")


def interactive_search():
    """Interactive command-line search interface"""
    client = SimpleKodeposClient()

    print("🔍 Kodepos API Indonesia - Interactive Search")
    print("=" * 50)
    print("Enter location names, postal codes, or administrative areas")
    print("Examples: 'Jakarta', 'Menteng', '10110', 'DKI Jakarta'")
    print("Commands: 'exit' to quit, 'help' for assistance")
    print()

    while True:
        try:
            query = input("🔍 Search (or 'exit'): ").strip()

            if query.lower() == 'exit':
                print("\n👋 Goodbye!")
                break
            elif query.lower() == 'help':
                print("\n📖 Help:")
                print("- Search by village name: 'Menteng'")
                print("- Search by district: 'Gambir'")
                print("- Search by city: 'Jakarta Pusat'")
                print("- Search by province: 'DKI Jakarta'")
                print("- Search by postal code: '10110'")
                print("- Type 'exit' to quit")
                print()
                continue
            elif not query:
                print("⚠️  Please enter a search term\n")
                continue
            elif len(query) < 2:
                print("⚠️  Query must be at least 2 characters long\n")
                continue

            print(f"\n🔍 Searching for: '{query}'...")

            try:
                results = client.search_postal_codes(query)

                if results.get('statusCode') == 200:
                    data = results.get('data', [])
                    if data:
                        format_results(data)
                    else:
                        print("No results found for your search query.")
                else:
                    error_msg = results.get('error', 'Unknown error')
                    print(f"❌ Search failed: {error_msg}")

            except ValueError as e:
                print(f"⚠️  Invalid input: {e}")
            except requests.RequestException as e:
                print(f"❌ Network error: {e}")
            except Exception as e:
                print(f"❌ Unexpected error: {e}")

            print("\n" + "=" * 60)

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except EOFError:
            print("\n\n👋 Goodbye!")
            break


def interactive_location_detection():
    """Interactive location detection interface"""
    client = SimpleKodeposClient()

    print("📍 Location Detection")
    print("=" * 30)
    print("Enter coordinates to find postal codes")
    print("Format: latitude,longitude (e.g., -6.2088,106.8456)")
    print("Commands: 'exit' to quit, 'help' for assistance")
    print()

    while True:
        try:
            input_str = input("📍 Coordinates (or 'exit'): ").strip()

            if input_str.lower() == 'exit':
                print("\n👋 Goodbye!")
                break
            elif input_str.lower() == 'help':
                print("\n📖 Help:")
                print("- Enter coordinates in format: latitude,longitude")
                print("- Example: -6.2088,106.8456 (Jakarta)")
                print("- Example: -7.2575,112.7521 (Surabaya)")
                print("- Coordinates must be within Indonesian bounds")
                print("- Type 'exit' to quit")
                print()
                continue
            elif not input_str:
                print("⚠️  Please enter coordinates\n")
                continue

            try:
                # Parse coordinates
                parts = input_str.split(',')
                if len(parts) != 2:
                    raise ValueError("Format should be: latitude,longitude")

                latitude = float(parts[0].strip())
                longitude = float(parts[1].strip())

                print(f"\n🔍 Detecting postal code for: {latitude}, {longitude}")

                results = client.detect_location(latitude, longitude)

                if results.get('statusCode') == 200 and results.get('data'):
                    format_results([results['data']])
                else:
                    error_msg = results.get('error', 'No postal code found for these coordinates')
                    print(f"❌ Detection failed: {error_msg}")

            except ValueError as e:
                print(f"⚠️  Invalid coordinates: {e}")
            except requests.RequestException as e:
                print(f"❌ Network error: {e}")
            except Exception as e:
                print(f"❌ Unexpected error: {e}")

            print("\n" + "=" * 50)

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except EOFError:
            print("\n\n👋 Goodbye!")
            break


def main():
    """Main function with menu selection"""
    print("🇮🇩 Kodepos API Indonesia - Python Examples")
    print("=" * 50)
    print("Choose an option:")
    print("1. Search postal codes")
    print("2. Detect location by coordinates")
    print("3. Quick demo")
    print("4. Exit")

    while True:
        try:
            choice = input("\nEnter your choice (1-4): ").strip()

            if choice == '1':
                print("\n" + "=" * 50)
                interactive_search()
                break
            elif choice == '2':
                print("\n" + "=" * 50)
                interactive_location_detection()
                break
            elif choice == '3':
                print("\n" + "=" * 50)
                quick_demo()
                break
            elif choice == '4':
                print("\n👋 Goodbye!")
                sys.exit(0)
            else:
                print("⚠️  Invalid choice. Please enter 1-4.")
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            sys.exit(0)
        except EOFError:
            print("\n\n👋 Goodbye!")
            sys.exit(0)


def quick_demo():
    """Quick demonstration of API capabilities"""
    client = SimpleKodeposClient()

    demo_queries = [
        ("Jakarta", "Search by city name"),
        ("Menteng", "Search by village name"),
        ("10110", "Search by postal code"),
        ("DKI Jakarta", "Search by province")
    ]

    print("🚀 Quick Demo")
    print("=" * 30)

    for query, description in demo_queries:
        print(f"\n{description}: '{query}'")
        print("-" * 40)

        try:
            results = client.search_postal_codes(query)

            if results.get('statusCode') == 200:
                data = results.get('data', [])
                if data:
                    first_result = data[0]
                    print(f"✅ Found {len(data)} results")
                    print(f"   Example: {first_result['village']} - {first_result['code']}")
                    print(f"   Location: {first_result['district']}, {first_result['regency']}")
                else:
                    print("❌ No results found")
            else:
                error_msg = results.get('error', 'Unknown error')
                print(f"❌ Error: {error_msg}")

        except Exception as e:
            print(f"❌ Error: {e}")

    # Location detection demo
    print(f"\n{'Location Detection Demo'}")
    print("-" * 40)

    try:
        # Jakarta coordinates
        location_results = client.detect_location(-6.2088, 106.8456)

        if location_results.get('statusCode') == 200 and location_results.get('data'):
            location = location_results['data']
            print(f"✅ Location detected")
            print(f"   Postal Code: {location['code']}")
            print(f"   Area: {location['village']}, {location['district']}")
            print(f"   Coordinates: {location['latitude']}, {location['longitude']}")
        else:
            print("❌ Location detection failed")

    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "=" * 50)
    print("✨ Demo complete! Try the interactive modes for more exploration.")


if __name__ == "__main__":
    try:
        # Check if arguments provided for direct execution
        if len(sys.argv) > 1:
            client = SimpleKodeposClient()

            if len(sys.argv) == 2:
                # Simple search
                query = sys.argv[1]
                print(f"🔍 Searching for: {query}")
                results = client.search_postal_codes(query)

                if results.get('statusCode') == 200:
                    format_results(results.get('data', []))
                else:
                    print(f"❌ Error: {results.get('error', 'Unknown error')}")

            elif len(sys.argv) == 3:
                # Location detection
                try:
                    latitude = float(sys.argv[1])
                    longitude = float(sys.argv[2])
                    print(f"📍 Detecting location: {latitude}, {longitude}")
                    results = client.detect_location(latitude, longitude)

                    if results.get('statusCode') == 200 and results.get('data'):
                        format_results([results['data']])
                    else:
                        print(f"❌ Error: {results.get('error', 'No location found')}")
                except ValueError:
                    print("❌ Invalid coordinates. Use: python simple_search.py latitude longitude")
        else:
            # Interactive mode
            main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)