# 🍹 Fruity Soda POS System

A modern, responsive Point of Sale (POS) application built for fruity soda businesses using React.js and Tailwind CSS.

## ✨ Features

### Core POS Features

- **Intuitive Cashier Interface**: Clean, touch-friendly interface optimized for kiosk use
- **Product Catalog**: Browse products by category with real-time stock levels
- **Shopping Cart**: Add/remove items with quantity controls and real-time totals
- **Cash Payment Processing**: Complete transactions with automatic change calculation
- **Receipt Generation**: Printable receipts with business details and transaction info
- **Inventory Management**: Automatic stock updates and low stock alerts

### Admin Features

- **Sales Dashboard**: Real-time sales analytics and performance metrics
- **Transaction History**: Complete record of all sales with filtering options
- **Inventory Management**: Edit product details, prices, and stock levels
- **Sales Reporting**: Top-selling products and revenue analytics

### Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Data persistence using browser localStorage
- **Print Integration**: Built-in receipt printing functionality
- **Real-time Updates**: Live inventory and sales tracking
- **Error Handling**: Comprehensive error handling and validation

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fruity-soda-pos
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Building for Production

```bash
npm run build
```

## 📱 Usage Guide

### POS Interface

1. **Browse Products**: Use category filters to find products quickly
2. **Add to Cart**: Click the "Add" button on any product card
3. **Manage Cart**: Adjust quantities or remove items in the cart panel
4. **Process Payment**: Switch to the Payment tab and enter cash amount
5. **Complete Transaction**: Review totals and complete the sale
6. **Print Receipt**: Print or save the transaction receipt

### Admin Dashboard

1. **View Analytics**: Monitor sales performance and trends
2. **Filter Data**: Use timeframe filters (Today, Week, Month)
3. **Track Inventory**: Monitor stock levels and low stock alerts
4. **Review Transactions**: Browse complete transaction history

### Inventory Management

1. **Search Products**: Find products by name or SKU
2. **Filter by Category**: View products by category
3. **Edit Products**: Click edit icon to modify product details
4. **Update Stock**: Adjust inventory levels in real-time

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API with useReducer
- **Data Persistence**: localStorage

### Project Structure

```
src/
├── components/          # React components
│   ├── POSInterface.tsx # Main POS interface
│   ├── ProductCard.tsx  # Product display component
│   ├── Cart.tsx         # Shopping cart component
│   ├── Payment.tsx      # Payment processing component
│   ├── Receipt.tsx      # Receipt generation component
│   ├── AdminDashboard.tsx # Admin analytics dashboard
│   └── InventoryManagement.tsx # Inventory management
├── context/             # React context providers
│   └── POSContext.tsx   # Main application state
├── data/                # Static data and configurations
│   └── products.ts      # Product catalog data
├── types/               # TypeScript type definitions
│   └── index.ts         # Application interfaces
├── utils/               # Utility functions
│   └── calculations.ts  # Math and formatting utilities
└── App.tsx              # Main application component
```

### Key Components

#### POSContext

Central state management using React Context API with useReducer for:

- Product catalog management
- Shopping cart operations
- Transaction processing
- Sales data analytics
- View navigation

#### ProductCard

Responsive product display with:

- Product images and details
- Stock level indicators
- Add to cart functionality
- Price formatting

#### Cart

Shopping cart management with:

- Item quantity controls
- Real-time total calculations
- Tax computation
- Remove item functionality

#### Payment

Cash payment processing with:

- Cash amount input
- Quick amount buttons
- Change calculation
- Transaction completion
- Receipt generation

## 🎨 Customization

### Adding New Products

Edit `src/data/products.ts` to add new products:

```typescript
{
  id: 'unique-id',
  name: 'Product Name',
  price: 3.99,
  image: 'image-url',
  category: 'Category Name',
  description: 'Product description',
  stock: 50,
  sku: 'SKU001'
}
```

### Modifying Tax Rate

Update the tax rate in `src/utils/calculations.ts`:

```typescript
export const TAX_RATE = 0.085; // 8.5% tax rate
```

### Styling Customization

Modify `tailwind.config.js` to customize:

- Color schemes
- Typography
- Spacing
- Animations

## 📊 Data Persistence

The application uses localStorage for data persistence:

- **Transactions**: Complete transaction history
- **Products**: Current inventory and product data
- **Settings**: Application configuration

Data is automatically saved and restored between sessions.

## 🖨️ Receipt Printing

The application includes built-in receipt printing:

- Professional receipt layout
- Business branding
- Transaction details
- Print-friendly styling

To print receipts:

1. Complete a transaction
2. Click "Print Receipt" in the confirmation modal
3. Use browser print dialog (Ctrl+P / Cmd+P)

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

Potential future features:

- Barcode scanning integration
- Multiple payment methods (credit card, digital wallets)
- Customer loyalty program
- Advanced reporting and analytics
- Multi-location support
- API integration for backend services
- Offline mode support
- User authentication and roles

---

**Built with ❤️ for fruity soda businesses everywhere!**
