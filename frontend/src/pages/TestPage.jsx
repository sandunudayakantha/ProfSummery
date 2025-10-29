const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Page - Routing Works!</h1>
        <div className="bg-white p-4 rounded shadow">
          <p>If you can see this page, the frontend routing is working correctly.</p>
          <p className="mt-2">Now try these links:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><a href="/api-test" className="text-blue-600 underline">API Test Page</a></li>
            <li><a href="/login" className="text-blue-600 underline">Login Page</a></li>
            <li><a href="/admin" className="text-blue-600 underline">Admin Dashboard</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
