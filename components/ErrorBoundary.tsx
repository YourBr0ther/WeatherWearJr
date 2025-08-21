'use client';

import React from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Weather Wear Jr Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>🌈</div>
            <h2 className={styles.errorTitle}>Oops! Something went wrong!</h2>
            <p className={styles.errorMessage}>
              Don't worry! Let's try again in a moment. 
              The weather app is taking a little break.
            </p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              <span className={styles.buttonIcon}>🔄</span>
              <span className={styles.buttonText}>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;