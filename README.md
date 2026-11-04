# AgriTech – Smart Farming Platform (MERN)

A full-stack farm management application designed to help farmers manage farms, monitor crops and soil health, access weather forecasts, identify pest risks, purchase agricultural resources, and track orders.

**Tech Stack:** MongoDB · Express.js · React (Vite) · Node.js · Bootstrap 5 · Axios · React Router · Recharts · JWT · bcrypt

## Features

| Module | Description |
|---|---|
| Authentication & Roles | User registration, login, JWT authentication, password hashing, and role-based access |
| Farms | Create, view, update, and delete farm profiles with farm size, location, and soil details |
| Crops & Soil | Crop management, soil information, soil health analysis, and fertilizer recommendations |
| Weather & Pest Risks | Weather information, forecasts, and rule-based pest-risk assessment |
| Resources & Orders | Agricultural resource store, product listings, order placement, and order status tracking |
| Community & Experts | Community and expert consultation features |
| Admin Dashboard | Administrative dashboard, user management, and order management |

## Technology Stack

### Frontend
- React 18
- Vite
- React Bootstrap
- Bootstrap 5
- Axios
- React Router
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- Helmet
- Express Rate Limit

## Project Structure

```text
agritech/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
└── README.md