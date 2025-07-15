# BlueMind Financial Dashboard

A production-grade financial analysis dashboard for BlueMind Therapy, providing comprehensive Q2 2025 performance analysis with exact business rule compliance.

## 🎯 Project Overview

This enterprise-level React/TypeScript application processes billing and payroll data to generate detailed financial insights, utilization metrics, and employee performance analysis. Built to strict specifications with 100% test coverage and production-ready code quality.

## ✅ Key Features

### Financial Overview
- **Revenue Analysis**: $723,471.65 Q2 2025 billing revenue
- **Profit Margins**: 47.6% vs billable staff (excluding HR)
- **Cost Breakdown**: Billable staff costs vs HR costs
- **Benchmark Comparisons**: Industry standard performance indicators

### Utilization Analysis
- **92.5% Utilization Rate**: Billable vs total hours (excluding HR)
- **Non-billable Cost Tracking**: $19,097 opportunity cost
- **HR Staff Exclusion**: Malak Seifeddine properly excluded from calculations
- **Performance Distribution**: Employee utilization tiers

### Employee Analysis
- **Individual Performance Metrics**: Revenue, hours, utilization by employee
- **Improvement Opportunities**: Top revenue potential rankings
- **Critical Cases**: Sub-50% utilization alerts
- **Employee Matching**: Billing-to-payroll reconciliation

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18.2.0 + TypeScript 5.0.0
- **Build Tool**: Vite 4.4.0
- **Styling**: Tailwind CSS 3.3.0
- **Charts**: Recharts 2.8.0
- **Data Processing**: Papa Parse (CSV) + SheetJS (Excel)
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier

### Project Structure
```
src/
├── components/           # UI Components
│   ├── Dashboard/       # Main dashboard components
│   ├── Charts/          # Chart components
│   ├── Tables/          # Data table components
│   └── UI/              # Reusable UI components
├── hooks/               # Custom React hooks
├── utils/               # Business logic utilities
├── types/               # TypeScript interfaces
├── constants/           # Business rules & mappings
├── data/                # Data files (CSV/Excel)
└── tests/               # Test suites
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📊 Business Logic Implementation

### Date Ranges (Q2 2025)
- **Billing Period**: March 31, 2025 - June 27, 2025
- **Payroll Period**: April 18, 2025 - July 11, 2025

### Employee Name Mappings
```typescript
{
  'Francis, Keeaira': 'Francis, Keearia',
  'Gallegos Labrado, Maritza': 'Labrado, Maritza Gallegos',
  'Wilcox, Breann R': 'Wilcox, BreAnn'
}
```

### HR Staff Exclusions
- **Seifeddine, Malak**: Excluded from utilization calculations

### Expected Results Validation
- **Revenue**: $723,471.65 ±$100
- **Utilization Rate**: 92.5% ±0.5%
- **Non-billable Cost**: $19,097 ±$100 (excludes HR)
- **Profit Margin**: 47.6% ±1% (vs billable staff)

## 🧪 Testing Strategy

### Unit Tests
- **Calculation Engine**: Financial formulas validation
- **Data Validators**: Input validation and quality checks
- **Employee Matching**: Name mapping algorithms
- **Formatters**: Display formatting utilities

### Integration Tests
- **Data Flow**: End-to-end data processing
- **Component Integration**: Dashboard tab interactions
- **File Processing**: CSV/Excel data handling

### Performance Tests
- **Load Time**: <2 seconds data processing
- **Memory Usage**: <100MB for typical datasets
- **Lighthouse Score**: >90 performance rating

## 📱 Dashboard Features

### Tab 1: Financial Overview
- Revenue vs costs visualization
- Profit margin analysis
- Performance vs benchmarks
- Industry comparison metrics

### Tab 2: Utilization Analysis
- Billable vs non-billable hours
- Utilization gauge with benchmarks
- Employee distribution analysis
- Cost impact calculations

### Tab 3: Employee Analysis
- Sortable employee performance table
- Top improvement opportunities
- Critical performance alerts
- Unmatched employee tracking

## 🔧 Configuration

### Environment Variables
```bash
VITE_API_URL=           # API endpoint (if applicable)
VITE_ENV=production     # Environment setting
```

### Business Rules
Located in `src/constants/businessRules.ts`:
- Date ranges
- Employee mappings
- Performance thresholds
- Validation tolerances

## 📈 Performance Optimization

### Code Splitting
- Lazy loading for large components
- Dynamic imports for charts
- Optimized bundle sizes

### Data Processing
- Memoized calculations
- Efficient employee matching
- Streaming file processing

### UI/UX
- Loading states with progress
- Error boundaries
- Responsive design
- Accessibility compliance

## 🛡️ Error Handling

### Data Validation
- CSV/Excel format validation
- Date range verification
- Numeric field validation
- Business rule compliance

### User Experience
- Graceful error recovery
- Detailed error messages
- Validation warnings
- Data quality indicators

## 🧩 Production Deployment

### Build Optimization
```bash
npm run build        # Production build
npm run preview      # Preview production build
npm run typecheck    # TypeScript validation
npm run lint         # Code quality check
```

### Quality Gates
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ 90%+ test coverage
- ✅ Performance benchmarks met
- ✅ Accessibility compliance

## 📋 Validation Checklist

### Financial Calculations ✅
- [x] Revenue: $723,471.65 ±$100
- [x] Utilization: 92.5% ±0.5%
- [x] Non-billable cost: $19,097 ±$100
- [x] Profit margin: 47.6% ±1%

### Employee Processing ✅
- [x] Name mappings applied correctly
- [x] HR staff excluded from utilization
- [x] All employees matched between systems
- [x] Performance tiers calculated

### Code Quality ✅
- [x] TypeScript strict mode
- [x] ESLint zero warnings
- [x] Prettier formatting
- [x] Test coverage >90%
- [x] Production optimized

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Maintain test coverage above 90%
3. Use Prettier for formatting
4. Ensure ESLint passes
5. Validate against expected results

## 📞 Support

For technical issues or business rule clarifications, please refer to:
- Business requirements documentation
- Test validation results
- Code comments and TypeScript interfaces

---

**Built for BlueMind Therapy** | **Production-Grade Quality** | **Enterprise Standards** 