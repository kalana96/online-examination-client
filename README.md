# Online Examination System - Frontend

A modern, responsive web application for conducting online examinations built with React, Tailwind CSS, and Axios. This system provides a comprehensive platform for students to take exams and administrators to manage the examination process.

## 🚀 Features

### Student Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Personal dashboard with upcomming exams and results
- **Exam Interface**: Clean, distraction-free exam taking environment
- **Data Synchronization**: Seamless offline/online data synchronization
- **Real-time Timer**: Visual countdown timer for each exam
- **Question Navigation**: Easy navigation between questions with status indicators
- **Auto-save**: Automatic saving of answers to prevent data loss
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Results View**: Detailed exam results with score breakdown

### Admin Features

- **Admin Dashboard**: Comprehensive overview of system statistics
- **User Management**: Add, edit, and manage student, teacher, and admin accounts
- **System Configuration**: Configure global settings and examination parameters
- **Institution Management**: Manage multiple classes, courses
- **Role & Permission Management**: Define and assign user roles and permissions
- **System Monitoring**: Monitor system performance and user activities
- **Backup & Recovery**: Data backup and system recovery tools
- **Results Analytics**: Detailed analytics and reporting features

### Teacher Features

- **Teacher Dashboard**: Overview of assigned classes, exams, and student performance
- **Exam Creation & Management**: Create, edit, and schedule exams for assigned subjects
- **Question Bank Management**: Build and organize subject-specific question libraries
- **Student Progress Tracking**: Monitor individual and class-wide performance
- **Grade Management**: Review, grade, and provide feedback on exam submissions
- **Class Management**: Manage enrolled students and class schedules
- **Report Generation**: Generate detailed performance reports and analytics
- **Exam Scheduling**: Schedule exams with flexible timing and duration settings
- **Question Import/Export**: Import questions from various formats (CSV, Excel, Word)
- **Proctoring**: Video proctoring integration

### Technical Features

- **JWT Authentication**: Secure token-based authentication
- **Offline Data Storage**: IndexedDB for offline data persistence
- **Data Synchronization**: Smart conflict resolution and merge strategies
- **API Integration**: Seamless integration with Spring Boot backend
- **State Management**: Efficient state management using React Context
- **Form Validation**: Client-side validation for all forms
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Smooth loading indicators and skeleton screens

## 🛠️ Technologies Used

- **Frontend Framework**: React 18+
- **Styling**: Tailwind CSS 3+
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Icons**: Lucide React / React Icons
- **Form Handling**: React Hook Form
- **Date/Time**: Date-fns
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**
- **Git** for version control
- **Backend API** running (Spring Boot backend repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kalana96/online-examination-client.git
cd online-examination-client
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add the following variables:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_JWT_SECRET=your-jwt-secret-key
REACT_APP_TOKEN_EXPIRY=3600

# Application Configuration
REACT_APP_APP_NAME=Online Examination System
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

```

### 4. Start Development Server

Using npm:

```bash
npm start
```

Using yarn:

```bash
yarn start
```

The application will open in your browser at `http://localhost:3000`

## 📁 Project Structure

```
online-examination-client/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components (Header, Footer, etc.)
│   │   ├── forms/           # Form components
│   │   ├── exam/            # Exam-specific components
│   │   └── admin/           # Admin panel components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── student/         # Student dashboard and features
│   │   ├── admin/           # Admin panel pages
│   │   ├── teacher/         # Teacher dashboard and features
│   │   └── exam/            # Exam taking pages
│   ├── screens/             # Screen-Specific Components
│   │   ├── student/         # Student dashboard and features
│   │   ├── admin/           # Admin dashboard and features
│   │   └── teacher/         # Teacher dashboard and features
│   ├── css/                 # Global CSS and styling
│   ├── images/              # Static images and assets
│   ├── partials/            # Reusable partial components
│   ├── services/            # API service functions
│   ├── utils/               # Utility functions
│   ├── assets/              # Images, icons, and other assets
│   └── App.js               # Main application component
├── package.json             # Project dependencies and scripts
├── .env.example             # Environment variables template
├── index.html
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # Project documentation
```

## 🔧 Available Scripts

### Development

```bash
npm start          # Start development server
npm run dev        # Alternative start command (if using Vite)
```

### Building

```bash
npm run build      # Create production build
npm run preview    # Preview production build locally
```

### Testing

```bash
npm test           # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Code Quality

```bash
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors automatically
npm run format     # Format code with Prettier
```

## 🌐 API Integration

This frontend application communicates with a Spring Boot backend API. The main API endpoints include:

### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

### Student Endpoints

- `GET /api/v1/student/dashboard` - Get dashboard data
- `GET /api/v1/student/exams` - Get available exams
- `GET /api/v1/student/exam/{id}` - Get specific exam details
- `POST /api/v1/student/exam/{id}/start` - Start an exam
- `POST /api/v1/student/exam/{id}/submit` - Submit exam answers
- `GET /api/v1/student/results` - Get exam results

### Admin Endpoints

- `GET /api/v1/admin/dashboard` - Admin dashboard statistics
- `GET /api/v1/admin/users` - Manage users
- `POST /api/v1/admin/exam` - Create new exam
- `PUT /api/v1/admin/exam/{id}` - Update exam
- `DELETE /api/v1/admin/exam/{id}` - Delete exam

### Teacher Endpoints

- `GET /api/v1/teacher/dashboard` - Get teacher dashboard data
- `GET /api/v1/teacher/classes` - Get assigned classes
- `POST /api/v1/teacher/exam` - Create new exam
- `PUT /api/v1/teacher/exam/{id}` - Update exam
- `GET /api/v1/teacher/exam/{id}/submissions` - Get exam submissions
- `GET /api/v1/teacher/students/{classId}` - Get students in class
- `POST /api/v1/teacher/questions` - Add questions to question bank

## 🎨 UI/UX Features

### Design System

- **Color Scheme**: Modern white and gray palette with dark mode support
- **Typography**: Clean, readable fonts optimized for long reading sessions
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable component library with consistent styling

### Responsive Design

- **Mobile First**: Designed primarily for mobile devices
- **Breakpoints**: Supports all screen sizes from 320px to 1920px+
- **Touch Friendly**: Large touch targets for mobile interaction
- **Accessible**: WCAG 2.1 compliant design elements

### User Experience

- **Loading States**: Skeleton screens and spinners for better perceived performance
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Feedback**: Toast notifications and success/error states
- **Navigation**: Intuitive navigation with breadcrumbs and clear CTAs

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Protected routes for authenticated users
- **Input Validation**: Client-side validation for all user inputs
- **HTTPS Ready**: Production-ready HTTPS configuration

## 📱 Offline Data Synchronization

### Offline Capabilities

The application supports comprehensive offline functionality to ensure uninterrupted examination experiences:

#### **Offline Exam Taking**

- **Automatic Data Caching**: Exam questions, user data, and media files are cached locally
- **Local Storage**: All exam answers and progress are stored in IndexedDB
- **Offline Timer**: Exam timers continue to work without internet connection
- **Media Support**: Images, audio, and video content available offline
- **Auto-save**: Continuous saving of answers to local storage every 30 seconds

#### **Data Synchronization Strategy**

- **Background Sync**: Automatic synchronization when connection is restored
- **Smart Conflict Resolution**: Intelligent merging of offline and online data
- **Incremental Sync**: Only changed data is synchronized to minimize bandwidth
- **Retry Mechanism**: Failed sync operations are automatically retried
- **Sync Status Indicators**: Real-time sync status displayed to users

## 📱 Browser Support

- **Chrome** 90+ ✅
- **Firefox** 88+ ✅
- **Safari** 14+ ✅
- **Edge** 90+ ✅
- **Mobile Safari** iOS 14+ ✅
- **Chrome Mobile** Android 10+ ✅

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the React app
3. Add environment variables in Vercel dashboard

### Deploy to AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Upload build folder to S3 bucket
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🧪 Testing

### Unit Tests

```bash
npm test                    # Run all tests
npm test -- --coverage     # Run tests with coverage
npm test ComponentName      # Run specific test file
```

### E2E Tests (if configured with Cypress)

```bash
npm run cypress:open       # Open Cypress test runner
npm run cypress:run        # Run tests in headless mode
```

## 🤝 Contributing

We welcome contributions to improve the Online Examination System! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes and commit**: `git commit -m 'Add new feature'`
4. **Push to the branch**: `git push origin feature/new-feature`
5. **Submit a pull request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

If you encounter any issues or have questions:

1. **Check existing issues**: [GitHub Issues](https://github.com/kalana96/online-examination-client/issues)
2. **Create a new issue**: Provide detailed information about the problem
3. **Contact support**: [Your email or support channel]

## 🔗 Related Repositories

- **Backend API**: [online-examination-server](https://github.com/kalana96/online-examination-server)
- **Documentation**: [online-examination-docs](https://github.com/kalana96/online-examination-docs)

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Active Development
- **Last Updated**: July 2025
- **Maintained By**: [Kalana Abeywickrama]

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Axios** for HTTP client functionality
- **Contributors** who helped build this system

## 📈 Roadmap

### Upcoming Features

- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video proctoring integration
- [ ] Mobile app version
- [ ] AI-powered question generation

### Known Issues

- Timer synchronization in poor network conditions
- Large file upload performance optimization needed
- Safari-specific styling inconsistencies

---

**Made with ❤️ for educational institutions worldwide**

For more information, visit our [documentation](https://your-docs-url.com) or contact the development team.
