import React from 'react';

/** Keep a single unfinished page from blanking the embedded mobile WebView. */
export default class StandaloneErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    console.error('[BATO iOS] Screen render failure:', error, info);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="max-w-md mx-auto my-8 px-6 text-center" role="alert">
        <h2 className="text-xl font-semibold text-[#3a2e1e]">This screen couldn't open</h2>
        <p className="text-sm text-[#7c8689] mt-3 mb-5">
          Some features are not yet connected to the clinic backend.
          Check the Xcode or Safari console for the actual error.
        </p>
        <button type="button" onClick={() => this.setState({error:null})}
          className="px-5 py-3 mr-2 bg-[#3a2e1e] text-white rounded-xl">Try again</button>
        <a href="/Dashboard" className="inline-block px-5 py-3 border border-[#3a2e1e] text-[#3a2e1e] rounded-xl">Dashboard</a>
      </section>
    );
  }
}
