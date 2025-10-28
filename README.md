# Inventory Management System

A modern, user-friendly web application for managing inventory across multiple physical stores. Built with Vue 3, Vuetify 3, and Pinia for state management.

## 🚀 Features

### 🔐 Authentication & User Management
- **Role-based access control** (Admin, Manager, Employee)
- **Secure login system** with email/password
- **User management** for administrators
- **Session persistence** with localStorage

### 📊 Dashboard
- **Summary cards** showing key metrics
- **Real-time statistics** for products, stores, and transactions
- **Low stock alerts** with visual indicators
- **Recent activity** overview
- **Performance insights** and trends

### 📦 Product Management
- **Complete CRUD operations** for products
- **Advanced search** by name, SKU, or category
- **Product categorization** system
- **Price and description management**
- **Bulk operations** support

### 🏪 Inventory Management
- **Multi-store inventory** tracking
- **Real-time stock levels** with low stock alerts
- **Stock movement** history
- **Store-specific** inventory views
- **Stock level** customization per store

### 💰 Transaction Management
- **Multiple transaction types**: Sales, Transfers, Receptions
- **Comprehensive tracking** of all inventory movements
- **Date-based filtering** and reporting
- **Transaction history** with detailed information
- **Store-to-store transfers**

### 📈 Reports & Analytics
- **Sales trends** and performance metrics
- **Store comparison** analytics
- **Top-performing products** analysis
- **Inventory value** calculations
- **Export functionality** for reports

## 🛠️ Technology Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **UI Framework**: Vuetify 3
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **Icons**: Material Design Icons (MDI)
- **Styling**: CSS with Vuetify design system

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tbd-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔑 Demo Credentials

### Admin User
- **Email**: admin@store.com
- **Password**: admin123
- **Access**: Full system access including user management

### Employee User
- **Email**: employee@store.com
- **Password**: emp123
- **Access**: Limited access (no user management)

## 📱 User Interface

### Design Principles
- **Modern and clean** Material Design aesthetic
- **Responsive layout** for all device sizes
- **Intuitive navigation** with sidebar menu
- **Consistent color scheme** and typography
- **Accessibility-focused** design elements

### Navigation Structure
- **Dashboard**: Overview and key metrics
- **Products**: Product catalog management
- **Inventory**: Stock level management
- **Transactions**: Movement tracking
- **Reports**: Analytics and insights
- **Users**: User management (Admin only)

## 🏗️ Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   └── NavigationSidebar.vue
├── views/              # Page components
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── ProductsView.vue
│   ├── InventoryView.vue
│   ├── TransactionsView.vue
│   ├── ReportsView.vue
│   └── UsersView.vue
├── store/              # Pinia stores
│   ├── auth.js         # Authentication state
│   └── inventory.js    # Inventory data
├── router/             # Vue Router configuration
│   └── index.js
└── main.js             # Application entry point
```

### State Management
- **Auth Store**: User authentication and session management
- **Inventory Store**: Products, stores, inventory, and transactions data

### Routing
- **Protected routes** with authentication guards
- **Role-based access** control for admin-only pages
- **Automatic redirects** for unauthenticated users

## 🎨 Customization

### Theme Configuration
The application uses Vuetify's theming system with customizable colors:

```javascript
theme: {
  defaultTheme: 'light',
  themes: {
    light: {
      colors: {
        primary: '#1976D2',    // Main brand color
        secondary: '#424242',  // Secondary elements
        success: '#388E3C',    // Success states
        warning: '#F57C00',    // Warning states
        error: '#D32F2F',      // Error states
      },
    },
  },
}
```

### Adding New Features
1. Create new view components in `src/views/`
2. Add routes in `src/router/index.js`
3. Extend stores in `src/store/` as needed
4. Update navigation in `NavigationSidebar.vue`

## 📊 Data Structure

### Product Model
```javascript
{
  id: Number,
  name: String,
  description: String,
  price: Number,
  sku: String,
  category: String
}
```

### Inventory Model
```javascript
{
  id: Number,
  productId: Number,
  storeId: Number,
  quantity: Number,
  minStock: Number
}
```

### Transaction Model
```javascript
{
  id: Number,
  type: 'sale' | 'transfer' | 'reception',
  date: String,
  productId: Number,
  quantity: Number,
  storeId: Number,
  amount: Number,        // For sales
  fromStoreId: Number,   // For transfers
  toStoreId: Number,     // For transfers
  supplier: String       // For receptions
}
```

## 🔒 Security Features

- **Route protection** for authenticated users
- **Role-based access** control
- **Input validation** on all forms
- **Secure password** handling
- **Session management** with localStorage

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_TITLE=Inventory Pro
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Real-time notifications** for low stock
- **Advanced analytics** with Chart.js integration
- **Mobile app** development
- **API integration** with backend services
- **Multi-language** support
- **Dark theme** option
- **Advanced reporting** with PDF export
- **Barcode scanning** integration
- **Inventory forecasting** algorithms
- **Supplier management** system

---

**Built with ❤️ using Vue 3 and Vuetify**
