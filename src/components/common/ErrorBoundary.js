import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Something went wrong!
                </h4>
                <p>
                  We're sorry, but something unexpected happened. This might be due to:
                </p>
                <ul>
                  <li>Backend server is not running or not accessible</li>
                  <li>Network connection issues</li>
                  <li>A temporary server error</li>
                </ul>
                <hr />
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reload Page
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  >
                    <i className="bi bi-house me-2"></i>
                    Go to Home
                  </button>
                </div>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-3">
                    <summary>Error Details (Development Only)</summary>
                    <pre className="mt-2 p-2 bg-light border rounded">
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
