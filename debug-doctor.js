// Test doctor registration specifically
async function testDoctorRegistration() {
  const doctorData = {
    name: 'Dr. Test Doctor',
    email: `doctor_debug_${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'doctor',
    profileData: {
      specialization: 'Cardiology',
      license_number: 'MD123456',
      experience_years: 5,
      department: 'Cardiology Department'
    }
  };

  try {
    console.log('Testing Doctor Registration with data:', JSON.stringify(doctorData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });

    const result = await response.json();
    console.log('\nResponse Status:', response.status);
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

testDoctorRegistration();
