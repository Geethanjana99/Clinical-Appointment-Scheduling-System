# CareSync - Clinical Appointment Scheduling System (Frontend)

A modern, feature-rich clinical appointment scheduling and management system built with React, TypeScript, and Vite. This application provides comprehensive healthcare management capabilities for patients, doctors, administrators, and billing staff.

## 🌟 Features

### Patient Portal
- **Dashboard**: Overview of upcoming appointments and health metrics
- **Book Appointments**: Schedule appointments with available doctors
- **Queue Management**: Real-time queue status and estimated wait times
- **Medical Reports**: View and download medical reports
- **Health Predictions**: AI-powered diabetes risk predictions
- **Appointment History**: Track past and upcoming appointments

### Doctor Portal
- **Dashboard**: Overview of today's schedule and patient statistics
- **Patient Management**: View detailed patient information and medical history
- **Queue Management**: Manage patient queues efficiently
- **Appointments**: Schedule and manage appointments
- **AI Predictions**: Access AI-powered health predictions for patients
- **My Patients**: View and manage patient lists

### Admin Portal
- **Dashboard**: System-wide analytics and statistics
- **Patient Management**: Complete patient record management
- **Doctor Management**: Manage doctor profiles and certifications
- **Appointment Oversight**: Monitor and manage all appointments
- **Report Upload**: Upload and manage medical reports
- **Health Analytics**: View system-wide health prediction data

### Billing Portal
- **Dashboard**: Financial overview and billing statistics
- **Invoices**: Generate and manage invoices
- **Insurance Claims**: Process insurance claims
- **Reports**: Financial reports and analytics
- **Analytics Dashboard**: Comprehensive billing analytics

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.5.4
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM 6.26.2
- **State Management**: Zustand
- **Styling**: Tailwind CSS 3.4.17
- **Charts**: Chart.js 4.5.0, Recharts 2.12.7
- **Animations**: Framer Motion 11.5.4
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Backend API**: The backend server must be running on `http://localhost:5000`
- **Streamlit Service**: (Optional) For diabetes predictions on `http://localhost:8502`

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Clinical-Appointment-Scheduling-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Streamlit URL for diabetes prediction analysis
VITE_STREAMLIT_URL=http://localhost:8502

# Application Settings
VITE_APP_NAME=Clinical Appointment System
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production-ready application |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🏗️ Project Structure

```
Clinical-Appointment-Scheduling-System/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Dark Mode, etc.)
│   ├── pages/             # Page components
│   │   ├── Landing/       # Landing page
│   │   ├── auth/          # Authentication pages
│   │   ├── patient/       # Patient portal pages
│   │   ├── doctor/        # Doctor portal pages
│   │   ├── admin/         # Admin portal pages
│   │   └── billing/       # Billing portal pages
│   ├── services/          # API services
│   ├── store/             # Zustand state management
│   ├── utils/             # Utility functions
│   ├── images/            # Static images
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Application entry point
│   └── index.css          # Global styles
├── public/                # Static public assets
├── .env                   # Environment variables
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies

```

## 🔐 Authentication & Authorization

The application implements role-based access control (RBAC) with four user roles:

- **Patient**: Access to personal health records and appointment booking
- **Doctor**: Access to patient management and appointment scheduling
- **Admin**: Full system access and user management
- **Billing**: Access to financial data and billing operations

Protected routes automatically redirect unauthorized users to appropriate dashboards.

## 🎨 Features & Functionality

### Dark Mode Support
The application includes a dark mode toggle for better user experience in different lighting conditions.

### Real-time Updates
- Queue status updates
- Appointment notifications
- System-wide alerts

### Responsive Design
Fully responsive design that works seamlessly across desktop, tablet, and mobile devices.

### Charts & Analytics
Comprehensive data visualization using Chart.js and Recharts for:
- Patient statistics
- Appointment trends
- Financial reports
- Health metrics

## 🔧 Configuration

### Proxy Configuration
The Vite development server is configured to proxy API requests to the backend:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### Tailwind CSS
Custom Tailwind configuration can be modified in `tailwind.config.js`.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port. Check the console output for the actual port.

### Backend Connection Issues
Ensure the backend server is running on `http://localhost:5000`. Check the `.env` file for correct API URL configuration.

### Build Errors
Clear the node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Support

For support and questions, please contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Patient portal
  - Doctor portal
  - Admin portal
  - Billing portal
  - AI-powered health predictions

---

**Built with ❤️ using React, TypeScript, and Vite**
