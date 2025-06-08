// Simple registration test to debug validation
async function testRegistration() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'patient'
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Response Status:', response.status);
    console.log('Full Response:', JSON.stringify(result, null, 2));
    
    if (result.errors) {
      console.log('\nValidation Errors:');
      result.errors.forEach(error => {
        console.log(`- ${error.path}: ${error.msg}`);
      });
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testRegistration();
