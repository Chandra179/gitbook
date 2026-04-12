# Domain Travel

prompt: so the modules that i want to break into markdown is, flight search (how ota search flight interconnectivity with provider like sabrepss what data input we send and what we get), the flight price (fare, tax, discount maybe), is there some caching and runtime data change from the provider, then airport operational (gates, terminal, handling checkin, baggage, passenger documents like passport etc..), then ticketing system (ticket number, ticket issuing format,), airplane data like equipment name, uniqueness data among all global airplanes, whole user journey from start to end, etc..

### Flight Search&#x20;

This is the "Shopping" phase. The OTA acts as a translator between the user’s intent and the GDS (Global Distribution System) like Sabre.

#### Data Input

* Origin/Destination: IATA Codes (e.g., `CGK` for Jakarta, `LHR` for London).
* Passenger Mix: Adult (ADT), Child (CHD), Infant (INF).
* Cabin Preference: Economy, Premium Economy, Business, First.
* Filters: Direct flights only, specific airlines, time windows.

#### Data Output

* Itinerary Options: A list of "Priced Itineraries."
* Segments: Each individual flight leg (e.g., CGK -> SIN is Segment 1, SIN -> LHR is Segment 2).
* Booking Classes (RBD): Single letters (Y, J, F, M, L) that determine the price and flexibility.
* Availability: Number of seats remaining in that specific class (usually capped at "9" in GDS).

***

### Flight Price

In travel, the "Price" is a sum of many independent data points.

<table data-header-hidden><thead><tr><th width="284.800048828125"></th><th></th></tr></thead><tbody><tr><td><strong>Component</strong></td><td><strong>Description</strong></td></tr><tr><td>Base Fare</td><td>The airline’s core price. Defined by the Fare Basis Code (e.g., <code>WH7LNR</code>).</td></tr><tr><td>Taxes</td><td>Government/Regulatory fees (e.g., UK Air Passenger Duty, US Security Fee).</td></tr><tr><td>Surcharges (YQ/YR)</td><td>Airline-imposed fees, usually for fuel or insurance.</td></tr><tr><td>OTA Markup/Discount</td><td>The "Merchant" layer. Data added by the OTA to manage profit.</td></tr><tr><td>Ancillaries</td><td>Extra data: Baggage, seats, meals, lounge access.</td></tr></tbody></table>

***

### Caching & Runtime Data Changes

Because querying Sabre for every search is slow and expensive, OTAs use LFS (Low Fare Search) caching.

* The Cache: A Redis or Memcached layer stores prices for common routes (e.g., "NYC to LON") for 15–60 minutes.
* Runtime Drift: When a user clicks "Book," the OTA performs a Re-price. This is where the "Price Jump" happens—the cache says $500, but the live GDS data says $550 because the last cheap seat was sold 2 seconds ago.
* Married Segment Logic: A data quirk where the price of `A -> B -> C` is cheaper than `A -> B` and `B -> C` combined. The provider links these segments in the data; if you try to break them, the price changes instantly.

***

### Airport Operations

Once the booking is done, the data moves from the GDS to the DCS (Departure Control System) at the airport.

* APIS (Advance Passenger Information System): Data required by governments (Passport number, expiry, nationality). If this data is missing, the OTA cannot "Issue" the ticket for international routes.
* Check-in Data: Statuses like `CI` (Checked In), `BD` (Boarded), or `NS` (No Show).
* Baggage (SITA/WorldTracer): A unique 10-character tag (e.g., `BA123456`) linked to the PNR that tracks the bag through terminals and gates.

***

### Ticketing System

his is the most critical distinction in travel tech: The PNR is not the Ticket.

* PNR (Passenger Name Record): A 6-character alphanumeric code (e.g., `RLX45P`). It is a _reservation_ (a seat is held).
* E-Ticket Number: A 13-digit number (e.g., `001-1234567890`). It is the _payment_ (the airline has been paid).
* Ticket Issuing Format: Usually a "TKT" command in Sabre that generates a VCR (Virtual Coupon Record). Each segment of the flight is a "coupon" that changes status from `OPEN` to `USED` as you fly.

***

### Airplane Data

To show the user "You are flying on a 787 Dreamliner," the OTA pulls from a Fleet Database.

* Equipment Codes: 3-character IATA codes (e.g., `788` for Boeing 787-8, `35K` for Airbus A350-1000).
* Tail Number: The "License Plate" of the plane (e.g., `PK-GAA`). This is unique globally and allows tracking via services like FlightRadar24.
* Seat Map Data: An XML/JSON grid showing which seats are occupied (Occupied/Available/Blocked).

***

### Settlement (BSP/ARC)

* BSP (Billing and Settlement Plan): A global "clearing house" by IATA. Instead of the OTA paying 100 different airlines every day, they pay the BSP once a week, and the BSP distributes the money.
* GDS Productivity: Sabre tracks how many segments the OTA books. If the OTA books enough, Sabre actually pays the OTA a "segment incentive."

***

### The End-to-End User Journey

1. Inspiration: User searches (Cache Data).
2. Selection: User picks a flight (Live Availability Check).
3. Authentication: User enters details (PII - Personally Identifiable Information).
4. Payment: Credit card processed (PCI-DSS Data compliance).
5. Ticketing: PNR is created -> Money is captured -> Ticket Number is issued.
6. Pre-Flight: 24 hours before, the PNR is pushed to the airport's DCS.
7. Departure: Passport is scanned (APIS verification) -> Bag tag is printed -> Passenger is marked as `USED`.
8. Post-Flight: OTA receives a "Flown" status, triggering loyalty points or review emails.
