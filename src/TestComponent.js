import React, { useState, useEffect } from 'react';

const TestComponent = () => {
  const [testResults, setTestResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResults('Iniciando pruebas...\n');
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    try {
      // Test 1: Health check
      setTestResults(prev => prev + `\nProbando conexión a: ${API_URL}\n`);
      
      const healthResponse = await fetch(`${API_URL}/health`);
      setTestResults(prev => prev + `Health check status: ${healthResponse.status}\n`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setTestResults(prev => prev + `Health data: ${JSON.stringify(healthData)}\n`);
      }
      
      // Test 2: Cars endpoint
      setTestResults(prev => prev + '\nProbando endpoint /api/cars...\n');
      const carsResponse = await fetch(`${API_URL}/api/cars`);
      setTestResults(prev => prev + `Cars status: ${carsResponse.status}\n`);
      
      if (carsResponse.ok) {
        const carsData = await carsResponse.json();
        setTestResults(prev => prev + `Cars count: ${carsData.length}\n`);
        setTestResults(prev => prev + `First car: ${JSON.stringify(carsData[0])}\n`);
      } else {
        setTestResults(prev => prev + `Cars error: ${carsResponse.statusText}\n`);
      }
      
      // Test 3: Tracks endpoint
      setTestResults(prev => prev + '\nProbando endpoint /api/tracks...\n');
      const tracksResponse = await fetch(`${API_URL}/api/tracks`);
      setTestResults(prev => prev + `Tracks status: ${tracksResponse.status}\n`);
      
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setTestResults(prev => prev + `Tracks count: ${tracksData.length}\n`);
        setTestResults(prev => prev + `First track: ${JSON.stringify(tracksData[0])}\n`);
      } else {
        setTestResults(prev => prev + `Tracks error: ${tracksResponse.statusText}\n`);
      }
      
    } catch (error) {
      setTestResults(prev => prev + `\nError general: ${error.message}\n`);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>🔧 Test de Conectividad API</h3>
      <button onClick={testAPI} disabled={isLoading} style={{ marginBottom: '10px' }}>
        {isLoading ? 'Probando...' : 'Ejecutar Pruebas'}
      </button>
      <pre style={{ 
        backgroundColor: '#000', 
        color: '#0f0', 
        padding: '10px', 
        borderRadius: '4px',
        fontSize: '12px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {testResults}
      </pre>
    </div>
  );
};

export default TestComponent;