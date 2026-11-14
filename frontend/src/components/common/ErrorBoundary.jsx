import React from 'react';

/**
 * Universal ErrorBoundary component.
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire page.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[OfficeBite ErrorBoundary] Caught component error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      return (
        <div className="p-8 text-center rounded-3xl bg-[#1A1A1A] border border-white/10 my-8 max-w-lg mx-auto shadow-2xl">
          <p className="text-base font-bold text-[#F59E0B]">Royal Canteen Notice</p>
          <p className="text-xs text-white/60 mt-2">
            This section encountered a temporary display issue and recovered safely.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-[#F59E0B] text-[#121212] text-xs font-bold hover:bg-[#D97706] transition-all cursor-pointer"
            >
              Retry Section
            </button>
            <a
              href="/menu"
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15 transition-all"
            >
              View Full Menu
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

