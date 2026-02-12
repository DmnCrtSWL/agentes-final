// Test script to verify n8n proxy endpoints
const testProxy = async () => {
  try {
    console.log('Testing n8n proxy endpoints...\n');
    
    // Test 1: Check if server is running
    console.log('1. Testing server root...');
    const rootResponse = await fetch('http://localhost:3000/');
    const rootData = await rootResponse.json();
    console.log('✅ Server is running:', rootData);
    
    // Test 2: Check API endpoint
    console.log('\n2. Testing /api endpoint...');
    const apiResponse = await fetch('http://localhost:3000/api');
    const apiText = await apiResponse.text();
    console.log('✅ API endpoint:', apiText);
    
    // Test 3: Test n8n service proxy
    console.log('\n3. Testing /api/n8n/service endpoint...');
    const serviceResponse = await fetch('http://localhost:3000/api/n8n/service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hola, soy un mensaje de prueba',
        agentId: 1,
        sessionId: 'test-session-123',
        files: []
      })
    });
    
    console.log('Status:', serviceResponse.status, serviceResponse.statusText);
    
    if (serviceResponse.ok) {
      const serviceData = await serviceResponse.json();
      console.log('✅ Service proxy response:', serviceData);
    } else {
      const errorText = await serviceResponse.text();
      console.log('❌ Service proxy error:', errorText);
    }
    
    // Test 4: Test n8n quotes proxy
    console.log('\n4. Testing /api/n8n/quotes endpoint...');
    const quotesResponse = await fetch('http://localhost:3000/api/n8n/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hola, necesito una cotización',
        agentId: 4,
        sessionId: 'test-session-456',
        files: []
      })
    });
    
    console.log('Status:', quotesResponse.status, quotesResponse.statusText);
    
    if (quotesResponse.ok) {
      const quotesData = await quotesResponse.json();
      console.log('✅ Quotes proxy response:', quotesData);
    } else {
      const errorText = await quotesResponse.text();
      console.log('❌ Quotes proxy error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProxy();
