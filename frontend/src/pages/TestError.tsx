import { useEffect } from 'react';

const TestError = () => {
  useEffect(() => {
    // This will throw an error to test the Error Boundary
    throw new Error('This is a test error to demonstrate the Error Boundary functionality!');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Test Error Page</h1>
        <p className="text-blue-200">This page should trigger an error...</p>
      </div>
    </div>
  );
};

export default TestError;
