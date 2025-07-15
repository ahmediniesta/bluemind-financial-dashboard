import Dashboard from './components/Dashboard/Dashboard';
import ErrorBoundary from './components/UI/ErrorBoundary';
import { AccessControl } from './components/UI/AccessControl';

function App() {
  return (
    <ErrorBoundary>
      <AccessControl>
        <div className="App">
          <Dashboard />
        </div>
      </AccessControl>
    </ErrorBoundary>
  );
}

export default App; 