import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4 text-primary">!</div>
            <h1 className="text-3xl font-heading font-bold mb-2">Something went wrong</h1>
            <p className="text-text-secondary mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
              <Link to="/"><Button variant="outline">Go Home</Button></Link>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 text-xs text-left bg-gray-100 p-4 rounded overflow-auto max-h-48">{this.state.error.stack}</pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
