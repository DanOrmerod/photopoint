# PhotoPoint

AI-powered photography business platform that seamlessly integrates portfolio websites, collaborative mood boards, Adobe Creative Suite integration, and comprehensive business management tools.

## Project Structure

```
photopoint/
├── app-photopoint-v1/          # Angular frontend application
├── svc-photopoint-v1/          # Node.js TypeScript API service
├── requirements/               # Project documentation and requirements
└── README.md                   # This file
```

## Technology Stack

### Frontend (app-photopoint-v1/)
- **Angular 20** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Styled components
- **Azure Static Web Apps** - Hosting platform

### Backend (svc-photopoint-v1/)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Azure Kubernetes Service (AKS)** - Container orchestration

### Database & Storage
- **Azure SQL Database** - Primary data storage
- **Azure Blob Storage** - Photo and file storage
- **Azure Redis Cache** - Performance optimization

### Authentication & Security
- **Azure Active Directory B2C** - User management
- **JWT Tokens** - Secure authentication
- **Azure Key Vault** - Secrets management

## Getting Started

### Prerequisites
- Node.js 22.x or later
- npm 10.x or later
- Angular CLI 20.x or later
- Azure CLI (for deployment)
- Docker (for containerization)

### Local Development

#### Backend API
```bash
cd svc-photopoint-v1
npm install
npm run dev
# API runs on http://localhost:3001
```

#### Frontend Application
```bash
cd app-photopoint-v1/photopoint-app
npm install
npm start
# App runs on http://localhost:4200
```

## Phase 1 MVP Features

- ✅ User Authentication (Azure AD B2C)
- ✅ Photo Upload & Management
- ✅ Basic Photo Gallery
- ✅ Client Management System
- ✅ Simple Invoicing
- ✅ Project Organization
- ✅ Responsive Design

## Architecture

PhotoPoint is built as a cloud-native application using Azure services:

- **Frontend**: Angular SPA hosted on Azure Static Web Apps
- **Backend**: Node.js API running on Azure Kubernetes Service
- **Database**: Azure SQL Database for structured data
- **Storage**: Azure Blob Storage for photos and files
- **Authentication**: Azure AD B2C for user management
- **Monitoring**: Azure Application Insights for telemetry

## Deployment

### Azure Infrastructure
- Azure Resource Group
- Azure Static Web Apps (Frontend)
- Azure Kubernetes Service (Backend)
- Azure SQL Database
- Azure Blob Storage
- Azure Key Vault
- Azure Application Insights

### CI/CD Pipeline
- GitHub Actions for automated deployment
- Docker containers for backend services
- Infrastructure as Code with ARM templates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Contact

For questions or support, please contact the PhotoPoint team.
