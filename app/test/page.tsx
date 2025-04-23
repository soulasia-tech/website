'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test-supabase');
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setDetails(data.details);
        } else {
          setStatus('error');
          setMessage(`Error: ${data.error}`);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(`Error: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        {status === 'loading' && (
          <div className="text-blue-600">Testing connection...</div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-green-600 mb-4">{message}</div>
            
            {details && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h2 className="font-semibold mb-2">Test Results:</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Insert Test: {details.inserted ? 'Success' : 'Failed'}</li>
                    <li>Retrieve Test: {details.retrieved ? 'Success' : 'Failed'}</li>
                    <li>Cleanup: {details.cleanup}</li>
                  </ul>
                </div>
                
                {details.inserted && (
                  <div className="border-t pt-4">
                    <h2 className="font-semibold mb-2">Sample Booking Data:</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(details.inserted, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600">{message}</div>
        )}
      </div>
    </div>
  );
} 