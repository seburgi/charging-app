# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based EV charging calculator application that helps users optimize their charging schedule based on real-time electricity pricing from the Austrian market (aWATTar API). The app displays cost visualization and battery state-of-charge planning.

## Technology Stack

- **React 19** with TypeScript/JSX
- **Vite** for build tooling and development server
- **Tailwind CSS 4.0** for styling
- **Recharts** for data visualization
- **ESLint** for code linting

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check without emitting files
npx tsc --noEmit
```

## Architecture

### Core Components

- **App.tsx**: Main application component that manages state for user inputs (current charge, willing to pay price, network costs) and fetches market data from aWATTar API
- **ChartSection.tsx**: Visualization component that renders both graph and table views of charging optimization data using Recharts

### Data Flow

1. App component fetches hourly market data from `https://api.awattar.at/v1/marketdata`
2. Market prices are converted from EUR/MWh to Euro cents/kWh
3. ChartSection calculates optimal charging schedule based on:
   - Market price + network costs vs. willing-to-pay threshold
   - Battery capacity constraints (75 kWh Tesla Model Y)
   - Charging rate (11 kW/hour AC charging)
   - Time-based logic for partial hours

### Key Business Logic

- **Charging Decision**: `shouldCharge()` function determines if charging should occur based on total cost (market + network) vs. user's price threshold
- **Battery Simulation**: Tracks battery state-of-charge over time, respecting capacity limits and charging rates
- **Cost Calculation**: Accumulates total charging costs and kWh charged across the optimal schedule

## Configuration Files

- **vite.config.js**: Vite configuration with React and Tailwind plugins
- **tailwind.config.js**: Tailwind CSS configuration covering HTML and JSX files
- **eslint.config.js**: ESLint configuration with React-specific rules

## API Integration

The app integrates with the aWATTar API to fetch day-ahead market data:
- Endpoint: `https://api.awattar.at/v1/marketdata`
- Data format: Array of objects with `start_timestamp`, `end_timestamp`, `marketprice` (EUR/MWh)
- Conversion: EUR/MWh × 0.1 = Euro cents/kWh

## View Modes

The application supports two visualization modes:
- **Graph Mode**: Combined chart showing price bars and battery SoC line
- **Table Mode**: Comparison table of different price thresholds and their outcomes