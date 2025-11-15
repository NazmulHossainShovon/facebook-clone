# Google Sheets Chart Generator

A sophisticated data visualization platform that enables users to generate advanced chart types directly from Google Sheets data. This project transforms basic spreadsheet data into complex, interactive visualizations that go far beyond what's available in traditional spreadsheet applications.

## Key Features

- **Direct Google Sheets Integration**: Securely connect to public Google Sheets using just a URL
- **30+ Advanced Chart Types**: Including 3D visualizations, statistical charts, and specialized plots
- **Real-time Data Fetching**: Server-side API integration with Google Sheets API
- **Customizable Visualizations**: Interactive options for styling, labels, and data ranges
- **Authentication System**: Protected routes with user management
- **Pricing/Subscription Model**: Tiered usage limits with account dashboard
- **Export Capabilities**: Download charts in various formats

## Technical Implementation

### Architecture
- **Frontend**: Next.js 14 with App Router and Client Components
- **UI Framework**: Tailwind CSS with custom styling and responsive components
- **Visualization Library**: Plotly.js for advanced charting capabilities
- **Backend**: Server Actions for Google Sheets API integration
- **State Management**: Context API for user authentication and application state
- **Authentication**: Protected routes with user session management
- **API Integration**: Google Sheets API with server-side caching for performance

### Advanced Chart Types
- **3D Charts**: Scatter3D, Surface, Mesh3D, Line3D
- **Statistical Charts**: Violin Plots, Box Plots, Heatmaps, Contour Plots
- **Specialized Charts**: Funnel Charts, Histograms, 2D Contour plots
- **Basic Charts**: Bar, Pie, Bubble, Scatter, Line, Area

### Key Technical Accomplishments

1. **Google Sheets API Integration**
   - Developed server-side functions to extract sheet IDs and GIDs from URLs
   - Implemented caching mechanisms for spreadsheet metadata to reduce API calls
   - Created robust error handling for API failures and invalid URLs

2. **Dynamic Data Processing**
   - Built comprehensive data type detection (numeric vs non-numeric columns)
   - Implemented range-based data fetching for precise chart generation
   - Created specialized data transformation functions for each chart type

3. **Advanced Visualization Implementation**
   - Integrated Plotly.js for high-performance chart rendering
   - Developed custom chart configuration functions for 30+ chart types
   - Implemented responsive design with interactive features

4. **User Experience Optimizations**
   - Created intuitive workflow with real-time chart previews
   - Implemented loading states and error handling for better UX
   - Designed responsive UI with mobile-friendly components

5. **Security & Performance**
   - Implemented protected routes with authentication
   - Used server-side API key management for Google Sheets access
   - Optimized data fetching and caching strategies

## Project Impact

### For Resume Highlights:
- **Built full-stack data visualization platform** from ground up with Next.js and Google Sheets API
- **Implemented 30+ advanced chart types** including 3D and statistical visualizations not available in standard spreadsheets
- **Created secure Google Sheets integration** with server-side caching and error handling
- **Designed responsive UI/UX** with 5+ custom React components for chart configuration
- **Developed user authentication system** with protected routes and account management
- **Optimized performance** with server-side data processing and caching mechanisms

### Technical Skills Demonstrated:
- Advanced React/Next.js development with Client and Server Components
- Comprehensive API integration and data fetching strategies
- Complex state management and user authentication
- Charting and data visualization expertise
- Performance optimization and caching strategies
- Responsive UI design with Tailwind CSS
- TypeScript for type safety and maintainable code

## Project Structure

```
nextapp/app/charts/
├── chart-app/           # Main chart generation interface
├── account/             # User account and usage dashboard
├── pricing/             # Subscription/usage tier information
├── components/charts/   # Reusable chart UI components
├── utils/charts/        # Data processing and chart generation helpers
├── lib/actions/         # Server actions for Google Sheets API
├── constants/charts/    # Chart type definitions and configurations
└── types/               # TypeScript interfaces and types
```

## Business Value

This project demonstrates the ability to create professional-grade, scalable applications that solve real-world problems. By enabling users to generate advanced visualizations from existing Google Sheets data, it bridges the gap between basic spreadsheet tools and complex data visualization software.

## Technical Challenges Overcome

1. **Complex Data Processing**: Handling various data types and structures from spreadsheets
2. **API Integration**: Securely connecting to Google Sheets with proper error handling
3. **Chart Customization**: Implementing configuration options for multiple chart types
4. **Performance**: Optimizing large dataset handling and chart rendering
5. **User Experience**: Creating intuitive interface for complex visualization tasks

This project showcases expertise in full-stack development, data visualization, and creating user-centric applications that transform raw data into meaningful insights.