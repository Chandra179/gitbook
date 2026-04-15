# Online Travel Agency

This document outlines the end-to-end data lifecycle, technical protocols, and functional modules required to operate a global OTA, from initial search to financial settlement.

***

#### Connectivity & Protocols

Before data flows, the system must speak the languages of various providers.

* **EDIFACT (Legacy):** The text-based, cryptic protocol used by GDS (Sabre, Amadeus). It is highly efficient for bandwidth but lacks "rich" descriptive data.
* **NDC (New Distribution Capability):** An XML/JSON-based standard allowing airlines to bypass GDS limitations. It supports "Rich Content" (photos, videos) and personalized bundles.
* **LCC Aggregators:** Specialized APIs (e.g., Travelfusion) that scrape or connect to Low-Cost Carrier websites that do not participate in traditional GDS.

***

#### Flight Search

The "Shopping" phase where the OTA translates user intent and normalizes disparate provider data.

**Data Input (SearchRQ)**

* **Origin/Destination:** IATA Codes (e.g., `CGK`, `LHR`).
* **Passenger Mix:** ADT (Adult), CHD (Child), INF (Infant).
* **Cabin Preference:** Economy, Premium Economy, Business, First.
* **Journey Type:** One-way, Round-trip, Multi-city.

**The "Golden Record" (Content Normalization)**

* **The Normalizer:** A module that takes different baggage descriptions (e.g., "1PC" from Sabre vs. "23KG" from NDC) and maps them to a single internal format for the UI.

**Marketing vs. Operating Carriers**

* **Codeshare Logic:** The data must distinguish between the **Marketing Carrier** (who sold the seat) and the **Operating Carrier** (who owns the plane). Failure to show this leads to check-in failures.

**Data Output (SearchRS)**

* **Itinerary Options:** A list of "Priced Itineraries."
* **Segments:** Individual flight legs.
* **Booking Classes (RBD):** Single-letter codes (Y, J, F, M, L) determining price and flexibility.
* **Availability:** Number of seats remaining (GDS usually caps display at "9").

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
* **Runtime Re-price:** When a user selects a flight, a `PriceCheck` call is made. If the cache is stale, the system returns a "Price Jump."
* **Married Segment Logic:** A provider constraint where `A-B-C` is priced as a unit. If you attempt to book only `A-B` using that specific fare, the price logic breaks or increases.

***

#### Order Management & Post-Booking

This module handles everything that happens between payment and departure.

* **Voluntary Changes:** Requires calculating "Penalty Fees" + "Fare Difference" based on ATPCO Category 31 rules.
* **Involuntary Changes (Schedule Change):** The OTA receives a **Queue Alert** (Type B message) and must synchronize the local DB with the GDS PNR.
* **Voiding:** Canceling a ticket within the "Void Window" (usually 24 hours) to avoid merchant fees.

***

#### Identity, Security & Fraud

Data compliance and traveler verification.

* **PII & APIS:** Collection of "Advance Passenger Information" (Passport No, Expiry, Nationality).
* **Timatic Integration:** Real-time data check to see if a passenger's nationality requires a visa.
* **Fraud Detection:** Analysis of "Velocity" and "Route Risk."
* **PCI-DSS:** Tokenization of payment data; OTAs must not store raw Credit Card numbers.

***

#### Airport Operations & DCS

Data moves from the OTA/GDS to the airline’s **DCS (Departure Control System)**.

* **Terminal & Gate Data:** Real-time feeds (e.g., OAG) showing dynamic gate assignments.
* **Check-in Status:** Data flags indicating `CI` (Checked In), `BD` (Boarded), or `NS` (No Show).
* **Baggage Tracking:** Unique 10-digit **License Plate** tags linked to the PNR.

***

#### Ticketing System

The legal bridge between a "reservation" and a "contract."

* **PNR (Passenger Name Record):** A 6-character locator (e.g., `Z3X9PL`)—this is the data folder.
* **E-Ticket (ETKT):** A 13-digit legal document number. No ticket number means no flight.
* **VCR (Virtual Coupon Record):** The status of each leg (`OPEN`, `USED`, `VOID`, `RFND`).

***

#### Airplane Data (Fleet & Equipment)

* **Equipment Codes:** IATA 3-character codes (e.g., `789` = Boeing 787-9).
* **Tail Number:** The unique "Registration" (e.g., `VH-ZNK`) for precise flight tracking.
* **Seat Map (RSM):** A JSON/XML grid showing physical layout and occupancy.

***

#### Settlement & FinTech (The Back Office)

How the money moves and how risk is managed.

* **BSP (Billing and Settlement Plan):** The IATA clearing house for financial distribution.
* **Multi-Currency & FX Buffer:** Logic to handle exchange rate volatility between the "Search" (in local currency) and "Settlement" (usually in USD/EUR).
* **ADM (Agency Debit Memo) Audit:** An internal engine that audits bookings to ensure they don't violate airline fare rules, preventing fines (ADMs) from airlines.

***

#### The End-to-End User Journey (Data Thread)

1. **Inspiration/Search:** User queries `Cache`. `Normalizer` standardizes the results.
2. **Selection:** `Live Price Check` verifies availability. System flags `Codeshares`.
3. **Ancillaries:** User adds bags/seats (NDC data).
4. **Booking:** `PNR` created in GDS. `Fraud Check` and `Timatic Visa Check` performed.
5. **Payment:** `FX Buffer` applied. Credit card tokenized.
6. **Ticketing:** `TKT` command issued; `E-Ticket` generated; **Audit Engine** verifies fare integrity.
7. **Pre-Flight:** `APIS` data sent to government; `PNR` pushed to airport `DCS`.
8. **At Airport:** Passport scanned; `Gate` data updated; `Bag Tag` printed.
9. **Boarding:** `VCR` status flips to `USED`.
10. **Settlement:** OTA reconciles `Hot Files` against internal sales and pays `BSP`.

#### Data

```
{
  // ==========================================
  // 1. SEARCH & DISCOVERY (The Shopping Phase)
  // ==========================================
  "searchContext": {
    "searchId": "REQ-99482-XYZ",            // Unique trace ID for observability and distributed tracing
    "pointOfSale": "ID",                    // POS (Point of Sale) - Country code, affects pricing rules
    "providerContext": {
      "primaryGDS": "SABRE",                // Source of truth for this specific query
      "fallbackGDS": "AMADEUS",             // Failover routing if Sabre times out
      "cacheHit": false,                    // Did this come from Redis (true) or live API (false)?
      "latencyMs": 1402                     // Round-trip time from the provider
    },
    "requestCriteria": {
      "journeyType": "ROUND_TRIP",
      "origin": "CGK",                      // IATA Airport Code
      "destination": "LHR",
      "departureDate": "2026-05-10T00:00:00Z",
      "returnDate": "2026-05-20T00:00:00Z",
      "cabin": "Y",                         // Y = Economy, J = Business, F = First
      "passengers": {
        "ADT": 1,                           // Adult count
        "CHD": 0,                           // Child count
        "INF": 0                            // Infant count
      }
    }
  },

  // ==========================================
  // 2. THE ITINERARY & FLIGHT DATA
  // ==========================================
  "itinerary": {
    "boundId": "BND-01",                    // Represents the Outbound journey
    "totalDurationMins": 1045,              // Total time including layovers
    "segments": [
      {
        "segmentId": "SEG-01",
        "marketingCarrier": "SQ",           // The airline selling the ticket (Singapore Airlines)
        "operatingCarrier": "SQ",           // The airline flying the plane (Matches marketing here)
        "flightNumber": "SQ951",
        "departure": {
          "airportCode": "CGK",
          "terminal": "3",                  // Airport operational data
          "gate": "TBD",                    // Often updated via DCS closer to departure
          "timeLocal": "2026-05-10T05:25:00+07:00"
        },
        "arrival": {
          "airportCode": "SIN",
          "terminal": "2",
          "timeLocal": "2026-05-10T08:10:00+08:00"
        },
        "equipment": {
          "code": "359",                    // IATA Equipment code (Airbus A350-900)
          "tailNumber": "9V-SJA",           // Unique physical airplane identifier (added at check-in)
          "wifiAvailable": true
        },
        "status": "HK",                     // HK = Holds Confirmed (GDS status code)
        "bookingClass": "V",                // RBD (Reservation Booking Designator) - determines fare rules
        "marriedSegmentGroup": "MSG-1"      // Linking logic: cannot be separated from SEG-02 without breaking price
      }
      // ... subsequent segments (e.g., SIN to LHR) would go here
    ]
  },

  // ==========================================
  // 3. PRICING, FARE LOGIC & SETTLEMENT
  // ==========================================
  "pricingDetail": {
    "currencyCode": "IDR",                  // User-facing currency
    "baseFare": 8500000,                    // The raw cost of the flight from the airline
    "taxesAndFees": {
      "totalTaxes": 2100000,
      "breakdown": [
        { "code": "YQ", "amount": 1500000, "description": "Airline Fuel Surcharge" },
        { "code": "GB", "amount": 600000, "description": "UK Air Passenger Duty" }
      ]
    },
    "otaFinancials": {
      "merchantMarkup": 250000,             // The OTA's profit added to the base fare
      "discountApplied": 0,                 // Promo codes or dynamic yield discounts
      "forexBuffer": 50000,                 // Buffer for currency fluctuation before settlement
      "bspSettlementCurrency": "USD",       // The currency the OTA actually pays the airline via IATA BSP
      "commissionPercentage": 2.5           // Airline segment incentive paid back to OTA
    },
    "totalPrice": 10900000,
    "fareRules": {
      "fareBasisCode": "VLNCGB",            // The exact legal rulebook for this price
      "isRefundable": false,                // ATPCO Category 33
      "changeFeeAmount": 1500000            // ATPCO Category 31 (Voluntary Changes)
    }
  },

  // ==========================================
  // 4. PASSENGER & IDENTITY DATA (APIS)
  // ==========================================
  "travelers": [
    {
      "travelerId": "PAX-01",
      "type": "ADT",
      "personalInfo": {
        "firstName": "JOHN",
        "lastName": "DOE",
        "dateOfBirth": "1990-01-01",
        "gender": "M"
      },
      "identityDocuments": {                // APIS Data - Required for ticketing international flights
        "documentType": "PASSPORT",
        "documentNumber": "A1234567",
        "issuingCountry": "ID",
        "nationality": "ID",
        "expiryDate": "2030-01-01"
      },
      "timaticVerification": {
        "visaRequired": true,               // Result from Timatic API for the transit/destination
        "clearanceStatus": "VERIFIED"
      },
      "loyalty": {
        "program": "SQ",                    // Krisflyer
        "number": "888123456"               // FQTV (Frequent Traveller Data)
      },
      "ancillaries": [
        { "type": "SEAT", "code": "12A", "price": 0 },
        { "type": "BAGGAGE", "description": "1PC 23KG", "price": 0 }
      ]
    }
  ],

  // ==========================================
  // 5. TICKETING & ORDER MANAGEMENT
  // ==========================================
  "orderFulfillment": {
    "bookingStatus": "TICKETED",            // State Machine: PENDING -> CONFIRMED -> TICKETED -> FLOWN
    "pnr": {
      "gdsLocator": "Z3X9PL",               // The 6-character reservation code in Sabre
      "airlineLocator": "SQ88PL",           // The operating airline's internal PNR (often different from GDS)
      "creationDate": "2026-04-12T13:00:00Z"
    },
    "tickets": [
      {
        "travelerId": "PAX-01",
        "eTicketNumber": "618-1234567890",  // The actual 13-digit legal contract of carriage
        "issueDate": "2026-04-12T13:05:00Z",
        "vcrCoupons": [                     // VCR (Virtual Coupon Record) tracks if they actually flew
          { "segmentId": "SEG-01", "status": "OPEN" }, // OPEN = Ready to fly
          { "segmentId": "SEG-02", "status": "OPEN" }
        ]
      }
    ],
    "paymentDetails": {
      "transactionId": "TXN-777888",
      "paymentMethod": "CREDIT_CARD",
      "tokenizedCard": "tok_visa_xyz987",   // PCI-DSS compliant token (Never store raw PAN)
      "fraudScore": 0.02                    // Risk assessment score
    }
  },

  // ==========================================
  // 6. POST-BOOKING & AIRPORT OPERATIONS
  // ==========================================
  "operations": {
    "queueManagement": {
      "hasScheduleChange": false,           // Flags true if airline sends a Type B message changing the flight
      "lastSyncTimestamp": "2026-04-12T13:10:00Z"
    },
    "airportDCS": {                         // Departure Control System data (populated 24hrs before flight)
      "checkInStatus": "PENDING",           // Updates to CI (Checked In) or BD (Boarded)
      "baggageTags": []                     // E.g., ["0618123456"] - 10 digit SITA tracking license plate
    }
  }
}
```
