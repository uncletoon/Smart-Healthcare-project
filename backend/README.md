# Healthcare Facility API

This project provides a Django REST Framework API for managing healthcare facilities, categories, locations, insurances, and languages.

## Installation

1. Navigate to the `backend` folder.
2. Ensure you have installed requirements including `djangorestframework` and `Pillow`.
   ```bash
   pip install django djangorestframework Pillow
   ```
3. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Run the server:
   ```bash
   python manage.py runserver
   ```

## Endpoints

The API is structured around Django Rest Framework's DefaultRouter. All standard CRUD operations (GET, POST, PUT, PATCH, DELETE) are supported.

- **Categories**: `/api/categories/`
  - Get list of categories or create a new one.
  
- **Locations**: `/api/locations/`
  - Manage locations.
  
- **Insurances**: `/api/insurances/`
  - Manage insurance providers.
  
- **Languages**: `/api/languages/`
  - Manage available languages.
  
- **Facilities**: `/api/facilities/`
  - Manage facilities. Includes fields such as `company_name`, `company_logo` (image upload supported), contact details, precise location coordinates (`latitude`, `longitude`), and relationships to Categories (One-to-One), Locations (Foreign Key), Insurances (Many-to-Many), and Languages (Many-to-Many).
