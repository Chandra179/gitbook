# Online Travel Agency (OTA) & Flight Distribution

This document outlines the end-to-end data lifecycle and functional modules required to operate a global OTA, from initial search to financial settlement.

***

#### Flight Search (The Interconnectivity Layer)

The "Shopping" phase where the OTA translates user intent into GDS (Global Distribution System) or NDC (New Distribution Capability) queries.

**Data Input (SearchRQ)**

* **Origin/Destination:** IATA Codes (e.g., `CGK`, `LHR`).
* **Passenger Mix:** ADT (Adult), CHD (Child), INF (Infant).
* **Cabin Preference:** Economy, Premium Economy, Business, First.
* **Journey Type:** One-way, Round-trip, Multi-city.
* **Filters:** Direct flights only, specific airlines, time windows.

**Data Output (SearchRS)**

* **Itinerary Options:** A list of "Priced Itineraries."
* **Segments:** Individual flight legs (e.g., Segment 1: CGK-SIN, Segment 2: SIN-LHR).
* **Booking Classes (RBD):** Single-letter codes (Y, J, F, M, L) determining price and flexibility.
* **Availability:** Number of seats remaining (GDS usually caps display at "9").
* **Validating Carrier:** The airline responsible for issuing the ticket and collecting payment.

***

#### Flight Price & Fare Logic

Price is a composite of multiple data points governed by the "Fare Basis Code."

| Component               | Data Source     | Description                                                    |
| ----------------------- | --------------- | -------------------------------------------------------------- |
| **Base Fare**           | ATPCO / Airline | The core price linked to a "Fare Basis Code" (e.g., `WH7LNR`). |
| **Taxes**               | Government/IATA | Mandatory regulatory fees (e.g., US Security Fee, UK APD).     |
| **Surcharges (YQ/YR)**  | Airline         | Airline-imposed fees, often for fuel or carrier services.      |
| **OTA Markup/Discount** | Internal DB     | The "Merchant" layer where the OTA applies profit margins.     |
| **Ancillaries**         | NDC/Direct API  | Optional add-ons: Baggage, seats, meals, lounge access.        |

***

#### Caching & Runtime Data Changes

High-scale OTAs use caching to reduce GDS costs and latency, leading to "Data Drift."

* **The Cache (LFS):** Redis/Memcached stores "Low Fare Search" results for 15–60 minutes.
* **Runtime Re-price:** When a user selects a flight, a `PriceCheck` call is made. If the cache is stale (the $500 seat is gone), the system returns a "Price Jump" to the current live rate (e.g., $550).
* **Married Segment Logic:** A provider constraint where `A-B-C` is priced as a unit. If you attempt to book only `A-B` using that specific fare, the price logic breaks or increases.

***

#### Order Management & Post-Booking (The "Servicing" Module)

This module handles everything that happens between payment and departure.

* **Voluntary Changes:** User-initiated refunds or date changes. Requires calculating "Penalty Fees" + "Fare Difference."
* **Involuntary Changes (Schedule Change):** Airline changes flight times. The OTA receives a **Queue Alert** (Type B message) and must synchronize the local DB with the GDS PNR.
* **Voiding:** Canceling a ticket within the "Void Window" (usually before midnight of the date of issue) to avoid merchant fees.

***

#### Identity, Security & Fraud

Data compliance and traveler verification.

* **PII & APIS:** Collection of "Advance Passenger Information" (Passport No, Expiry, Nationality).
* **Timatic Integration:** Real-time data check to see if a passenger's nationality requires a visa for their specific itinerary/layovers.
* **Fraud Detection:** Analysis of "Velocity" (many bookings in a short time) and "Route Risk" (one-way high-value tickets purchased last minute).
* **PCI-DSS:** Tokenization of payment data; OTAs must not store raw Credit Card numbers.

***

#### Airport Operations & DCS

Data moves from the OTA/GDS to the airline’s **DCS (Departure Control System)**.

* **Terminal & Gate Data:** Real-time feeds (often via FlightStats or OAG) showing dynamic gate assignments and delays.
* **Check-in Status:** Data flags indicating `CI` (Checked In), `BD` (Boarded), or `NS` (No Show).
* **Baggage Tracking:** Unique 10-digit **License Plate** tags (e.g., `0012345678`) linked to the PNR.
* **Ground Handling:** Data sent to third-party handlers for meal preferences and wheelchair assistance (SSR - Special Service Requests).

***

#### Ticketing System

The legal bridge between a "reservation" and a "contract."

* **PNR (Passenger Name Record):** A 6-character locator (e.g., `Z3X9PL`)—this is just a "folder" holding the data.
* **E-Ticket (ETKT):** A 13-digit legal document (e.g., `001-2345678901`). No ticket number means no flight.
* **VCR (Virtual Coupon Record):** The status of each leg.
  * `OPEN`: Ready to fly.
  * `USED/FLOWN`: Passenger has boarded.
  * `VOID/RFND`: Ticket is no longer valid.

***

#### Airplane Data (Fleet & Equipment)

Static and real-time data about the physical aircraft.

* **Equipment Codes:** IATA 3-character codes (e.g., `789` = Boeing 787-9).
* **Tail Number:** The unique "Registration" (e.g., `VH-ZNK`). Used for precise flight tracking.
* **Seat Map (RSM):** A JSON/XML grid showing physical layout, "Blocked" seats (for elites), and "Occupied" seats.

***

#### Settlement & FinTech (The Back Office)

How the money actually moves.

* **BSP (Billing and Settlement Plan):** The IATA "clearing house." The OTA pays one lump sum to BSP, which then pays all airlines.
* **IATA Hot Files:** Daily data files provided to the OTA to reconcile sold tickets against airline expectations.
* **ADM (Agency Debit Memo):** A "bill" sent by an airline to an OTA if the OTA made a pricing error or violated a fare rule.

***

#### The End-to-End User Journey (Data Thread)

1. **Inspiration/Search:** User queries `Cache`.
2. **Selection:** `Live Price Check` verifies availability.
3. **Ancillaries:** User adds bags/seats (JSON/NDC data).
4. **Booking:** `PNR` created in GDS (Status: `HK` - Confirmed).
5. **Payment:** Credit card tokenized; Fraud check passed.
6. **Ticketing:** `TKT` command issued; `E-Ticket` generated; `VCR` status = `OPEN`.
7. **Pre-Flight:** `APIS` data sent to government; `PNR` pushed to airport `DCS`.
8. **At Airport:** Passport scanned; `Gate` data updated; `Bag Tag` printed.
9. **Boarding:** `VCR` status flips to `USED`.
10. **Settlement:** OTA pays `BSP`; Airline pays `Commission` or `Segment Incentive` to OTA.
