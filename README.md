# IQD Exchange API

A lightweight REST API that serves the live USD to IQD (Iraqi Dinar) street exchange rate. Official rates in Iraq often differ from the parallel-market rate people actually trade at — this API tracks the street rate so apps can display real numbers.

## How it works

- Scrapes a public exchange-rate tracker for the current USD-IQD parallel rate using Axios and Cheerio
- Caches the result in memory with a refresh interval, so the source site is never spammed
- Serves the cached value through a CORS-enabled JSON endpoint, ready to be consumed by any frontend

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/rate` | Returns the latest cached USD-IQD street rate as JSON |

## Tech stack

Node.js, Express, Axios, Cheerio

## Run locally

```bash
npm install
node server.js
```

The server starts on `http://localhost:3000`.
