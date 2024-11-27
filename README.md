# API Documentation

This document provides documentation for the Points Management API, a Node.js/Express application that handles point transactions and balance management for multiple payers.

This API is written in JavaScript and uses the Express framework for routing and handling HTTP requests.

## Table of Contents
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Data Structures](#data-structures)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)

## Setup
### Installing Required Tools

1. **Install Node.js**
   - Go to [https://nodejs.org](https://nodejs.org)
   - Download and install the "LTS" (Long Term Support) version
   - To verify installation, open your terminal/command prompt and type:
     ```bash
     node --version
     ```
   - You should see a version number like `v18.x.x`

2. **Verify npm installation** (npm comes with Node.js)
   ```bash
   npm --version
   ```
   You should see a version number like `9.x.x`

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
node server.js
```
The server will start on `http://localhost:8000`

## API Endpoints

### 1. Add Points
**POST** `/add`

Adds points to a payer's account.

#### Request Body
```json
{
    "payer": "DANNON",
    "points": 300,
    "timestamp": "2022-10-31T10:00:00Z"
}
```

#### Required Fields
- `payer` (string): The name of the payer
- `points` (number): The number of points to add
- `timestamp` (string): ISO 8601 timestamp

#### Response
- Status: 200 OK on success
- Status: 400 Bad Request if required fields are missing

### 2. Spend Points
**POST** `/spend`

Spends points according to the rules:
- Oldest points are spent first (based on transaction timestamp)
- Points are spent from available payer balances

#### Request Body
```json
{
    "points": 500
}
```

#### Required Fields
- `points` (number): The number of points to spend

#### Response
Returns the current balance for each payer after spending points:
```json
{
    "DANNON": 800,
    "UNILEVER": 200,
    "MILLER COORS": 100
}
```

#### Error Cases
- Status: 400 Bad Request if points to spend exceed available points
- Status: 400 Bad Request if points are not specified

### 3. Get Balance
**GET** `/balance`

Returns the current point balance for each payer.

#### Response
```json
{
    "DANNON": 800,
    "UNILEVER": 200,
    "MILLER COORS": 100
}
```

## Data Structures

### Transaction Object
```javascript
{
    payer: string,
    points: number,
    timestamp: string (ISO 8601)
}
```

## Example Usage

Here's a complete example of using the API:

```bash
# Add points for DANNON
curl -X POST http://localhost:8000/add \
-H "Content-Type: application/json" \
-d '{"payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z"}'

# Add points for UNILEVER
curl -X POST http://localhost:8000/add \
-H "Content-Type: application/json" \
-d '{"payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z"}'

# Spend points
curl -X POST http://localhost:8000/spend \
-H "Content-Type: application/json" \
-d '{"points": 200}'

# Check balance
curl http://localhost:8000/balance
```

## Error Handling

The API implements the following error handling:

1. Missing Required Fields
- Returns 400 Bad Request
- Includes error message specifying missing fields

2. Insufficient Points
- Returns 400 Bad Request
- Includes error message indicating insufficient points

3. Invalid Points Value
- Returns 400 Bad Request
- Includes error message for undefined points value

## Implementation Notes

1. The application maintains an in-memory array of transactions
2. Points are spent in chronological order based on transaction timestamps
3. Negative point balances for any payer are not allowed
4. When points are spent, new negative point transactions are created to track the spending
