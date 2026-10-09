import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ThreeDErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThreeDErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[580px] rounded-2xl border border-red-500/30 bg-[#050811] p-8 flex flex-col items-center justify-center text-center text-white shadow-2xl space-y-4">
          <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              {this.props.fallbackTitle || '3D WebGL Studio Notice'}
            </h3>
            <p className="text-xs text-white/70">
              The 3D WebGL rendering engine encountered a transient display exception. The surrounding application remains fully operational.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-red-300/80 bg-red-950/40 p-2 rounded-lg border border-red-800/40 mt-2 truncate">
                {this.state.error.message}
              </p>
            )}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#3186FF] hover:bg-[#2563EB] text-white text-xs font-bold transition-all cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4 text-[#ACF2E5]" />
            <span>Reload 3D Visualizer</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
