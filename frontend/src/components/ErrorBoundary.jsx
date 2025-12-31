import React from 'react';

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <h1 className="text-2xl font-bold text-red-600 mb-4">משהו השתבש</h1>
              <p className="text-gray-600 mb-6">אנא רעננו את הדף</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                רענון דף
              </button>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }

  export default ErrorBoundary;