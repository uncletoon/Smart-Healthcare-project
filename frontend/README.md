<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kizazi Health - Frontend App

This is the React frontend for the Kizazi Health (Healthcare Facility Registry), built with Vite, React Router, and Tailwind CSS. It connects dynamically to a Django REST Framework backend to seamlessly display healthcare facilities, services, and inventory.

## 🚀 Features & Recent Updates

We have significantly upgraded the frontend to transition from static mock data to a fully integrated, dynamic architecture:

- **API Service Layer**: Native `fetch` with `async/await` is implemented in `src/services/api.js`, providing clean and reusable methods for all backend endpoints (Facilities, Services, Categories, Locations, etc.).
- **Dynamic Data Resolution**:
  - Pages like `Facilities.tsx`, `FacilityDetail.tsx`, and `Services.tsx` now fetch real-time data from the database.
  - Foreign key IDs (like `location` or `company_categories`) are automatically resolved via `Promise.all()` fetching, meaning the UI accurately displays human-readable names instead of raw IDs.
- **Media & Image Handling**: Images uploaded to the Django backend (via `ImageField`) are properly rendered in the frontend cards.
- **UI Modernization & Refactoring**:
  - Rebuilt the `Services.tsx` page to utilize modular components like `SearchSection` and `ServiceCard`.
  - Added a pure Tailwind CSS animated **Dark Mode Switch** integrated directly into the `Layout.tsx` navigation bar (both desktop and mobile).
  - Cleaned up all Tailwind CSS classes to adhere to modern v4 syntax (e.g., using `grow` instead of `flex-grow` and `aspect-4/3`).
- **Vite Proxy Setup**: `vite.config.ts` handles CORS by proxying both `/api` requests and `/media` files directly to the Django server.

## 🏗️ Architecture

- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **Icons & Animations:** Lucide React & Motion (Framer Motion)
- **State Management:** Standard React Hooks (`useState`, `useEffect`)

## 💻 Run Locally

**Prerequisites:** Node.js (v18+) and Django backend fully configured.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Ensure the Django Backend is Running:**
   In a separate terminal, start your Django backend server. By default, the frontend expects the backend to be running on port 8000.

   ```bash
   python manage.py runserver
   ```

3. **Run the frontend dev server:**
   ```bash
   npm run dev
   ```
   The application will start, and any calls to `/api/...` or `/media/...` will be automatically proxied to `http://127.0.0.1:8000`, bypassing any CORS issues during local development.

> **Note on Medicines:** The `Medicines.tsx` page currently retains its mock data layout as a placeholder until the specific Pharmacy/Medicines backend models are finalized.
