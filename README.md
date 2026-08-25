🛍️ Asmalabel.in

Asmalabel.in is a modern e-commerce platform built for a tailoring and textile business, bringing products, customer shopping, orders, inventory, and store management into one digital experience.

The platform is designed to provide customers with a smooth shopping experience while giving the business a dedicated administration system to manage its online store.

✨ Features

🛒 Customer Experience

* Browse products by category
* Search and discover products
* View detailed product information
* Product image galleries
* Product videos where available
* Product variants
* Add to cart
* Update cart quantities
* Wishlist management
* Customer account
* Checkout
* Delivery information
* UPI payment flow
* Order confirmation
* Order history
* Order status
* Buy Again functionality
* WhatsApp-based customer communication
* Responsive mobile experience

👤 Authentication & Account

* Customer registration and login
* Supabase authentication
* Authentication callback handling
* Password reset
* Customer profile
* Account information management
* Protected customer features

📦 Orders

Customers can:

* Place orders
* View order details
* View order history
* Check order status
* Check payment status
* Reorder previously purchased products

The administration system provides tools for managing and updating customer orders.

🧑‍💼 Admin Panel

The admin area provides business management functionality including:

* Product management
* Add, edit and remove products
* Product pricing
* Inventory management
* Product variants
* Product images
* Product videos
* Category management
* Order management
* Order status management
* Store content management

Admin functionality is protected separately from the customer-facing application.

🖼️ Product Management

Products can include:

* Product name
* Description
* Price
* Category
* Images
* Videos
* Variants
* Stock information
* Availability

Product media is managed using Supabase Storage.

📱 Responsive Design

Asmalabel.in is designed for:

* 📱 Mobile
* 💻 Laptop
* 🖥️ Desktop
* 📟 Tablet

The interface adapts to different screen sizes while maintaining a consistent shopping experience.

💬 WhatsApp

WhatsApp is integrated into the customer communication workflow for direct communication with the business regarding orders and support.

⸻

🛠️ Technology Stack

Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Lucide React

Backend & Database

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage

Deployment & Analytics

* Vercel
* Vercel Analytics

Development

* JavaScript
* Git
* GitHub
* VS Code
* npm

⸻

🏗️ Architecture

Asmalabel.in follows a component-based React architecture.
React Application
       │
       ├── Pages
       ├── Reusable Components
       ├── Application Context
       ├── Utilities
       └── Assets
              │
              ▼
          Supabase
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Database Auth  Storage
Supabase handles the application’s backend services including authentication, database operations, product data, customer data, orders, wishlist data, and media storage.

📁 Project Structure
Asmalabel.in/
│
├── public/
├── scripts/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   ├── common/
│   │   ├── layout/
│   │   └── products/
│   │
│   ├── config/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── database-setup.sql
├── database-products-update.sql
├── database-variants-update.sql
├── database-social-media.sql
├── database-payment-update.sql
├── create-admin.sql
├── storage-policies.sql
├── fix-orders-constraint.sql
├── fix-orders-rls.sql
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
⚙️ Local Development

1. Clone the repository
 git clone https://github.com/hameedshaikdev/Asmalabel.in.git
cd Asmalabel.in
2. Install dependencies
   npm install
3. Configure environment variables

Create a .env file in the project root:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Use the credentials from your Supabase project.

Never commit private credentials or .env files to GitHub.

4. Start the development server
   npm run dev
5. Create a production build
   npm run build
6. Run linting
   npm run lint
🗄️ Database

The application uses Supabase PostgreSQL as its primary database.

The repository contains SQL scripts for configuring:

* Database tables
* Products
* Product variants
* Orders
* Social media data
* Payment-related data
* Admin access
* Storage policies
* Row Level Security

Supabase Storage is used for product media.

⸻

🔐 Security

The application uses:

* Supabase Authentication
* Protected admin access
* Row Level Security
* Database security policies
* Environment variables
* Controlled storage access
* Client-side validation

Sensitive configuration should never be stored directly in the source code.
🚀 Deployment

The application is designed to be deployed using Vercel.
GitHub
   │
   ▼
Vercel
   │
   ▼
Asmalabel.in
   │
   ▼
Supabase
Production environment variables should be configured in the Vercel project settings.
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
📊 Analytics

Vercel Analytics is used to provide production usage insights and help monitor the application’s performance and traffic.

⸻

🔎 SEO

The project includes sitemap generation as part of the production build process to help search engines discover the application’s public pages.

⸻

📌 Current Status

Asmalabel.in is an actively developed e-commerce platform focused on the online sale of tailoring tools, sewing accessories, textiles, and related products.

The application continues to evolve as new business requirements and customer-facing features are introduced.

⸻

🔮 Future Improvements

Potential future improvements include:

* Enhanced order tracking
* More advanced inventory management
* Customer reviews and ratings
* Promotional and discount features
* Additional payment options
* Advanced analytics
* Additional customer communication tools
* Further performance improvements

These represent possible future development and are not necessarily part of the current application.

⸻

👨‍💻 Developer

Shaik Abdul Hameed

Computer Science Engineering Student
Aspiring Full Stack Developer

⸻

📄 Additional Documentation

Additional technical documentation is available in the repository, including deployment, production configuration, Supabase, and social media setup documentation.

⸻

📜 License

This project is developed for Asmalabel.in and its associated business operations.

The source code, design, branding, product information, images, and business data should not be reused or redistributed without permission.

⸻

🛍️ Asmalabel.in

Tailoring Tools • Sewing Accessories • Textiles & More

Built to bring a traditional tailoring and textile business into a modern digital shopping experience.
