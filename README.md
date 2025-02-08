# EV Charging Calculator App

> **Disclaimer**: This entire application was **exclusively generated** using ChatGPT.  
> The code quality, organization, and architecture do **not** necessarily represent the author’s personal coding abilities or standards.

## Overview

This project demonstrates a **React** application for planning and visualizing electric vehicle (EV) charging costs and schedules using **Tailwind CSS** and **Recharts**. It fetches **day-ahead market data** from [aWATTar](https://api.awattar.at/) to display the cost of electricity over time, then highlights which hours are optimal for charging based on a user-defined cost threshold and network costs.

## Features

- **Sidebar Inputs**  
  - Current EV battery charge level (in %)  
  - Maximum price (cents/kWh) the user is willing to pay  
  - Network costs (cents/kWh)

- **Chart Area**  
  - **Bar chart** of electricity prices for each hour (colored green or orange depending on charging).
  - **Line chart** showing the battery’s state of charge (SoC) over time.
  - **Total charging cost** and **total kWh charged** displayed at the top.

## Usage

1. **Install dependencies**:
   ```bash
   npm install
   ```

2.	Run development server:

    ```bash
    npm run dev
    ```

3.	Open your browser to the address shown in your terminal (usually http://localhost:5173).

4.	Build for production:
    ```bash
    npm run build
    ```

5.	Preview production build:
    ```bash
    npm run preview
    ```


## Code Generation Disclaimer
-	All files and logic in this repository were generated exclusively with the assistance of ChatGPT.
-	The code quality, structure, and style do not reflect the author’s personal skills or best practices.
-	Use at your own discretion; there may be bugs or suboptimal implementation details.

## License

This project is distributed for demonstration purposes. Refer to the LICENSE file if one is provided, or feel free to add your own terms if you fork or reuse this work.

