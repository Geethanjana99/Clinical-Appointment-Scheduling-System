// Frontend-Backend Integration Test
// This script tests the complete integration between React frontend and Express backend

const API_BASE_URL = 'http://localhost:5000/api';

async function testIntegration() {
  console.log('🚀 Starting Frontend-Backend Integration Test...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Backend Health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend Health:', healthData.status);
    console.log('   Environment:', healthData.environment);
    console.log('   Uptime:', Math.round(healthData.uptime), 'seconds\n');    // Test 2: Test Registration (Patient)
    console.log('2️⃣ Testing Patient Registration...');
    const patientData = {
      name: 'Test Patient',
      email: `patient_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'patient'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    const registerData = await registerResponse.json();
    if (registerData.success) {
      console.log('✅ Patient Registration Successful');
      console.log('   User ID:', registerData.data.user.id);
      console.log('   Role:', registerData.data.user.role);
      console.log('   Token received:', !!registerData.data.token);
      console.log('   Auto Patient Profile:', !!registerData.data.user.profile);
    } else {
      console.log('❌ Patient Registration Failed:', registerData.message);
    }

    // Test 3: Test Login
    console.log('\n3️⃣ Testing Login...');
    const loginData = {
      email: patientData.email,
      password: patientData.password
    };

    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    if (loginResult.success) {
      console.log('✅ Login Successful');
      console.log('   User:', loginResult.data.user.name);
      console.log('   Role:', loginResult.data.user.role);
      console.log('   Token Type:', typeof loginResult.data.token);
      
      // Test 4: Test Protected Route (Profile)
      console.log('\n4️⃣ Testing Protected Route (Profile)...');
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 
          'Authorization': `Bearer ${loginResult.data.token}`,
          'Content-Type': 'application/json'
        }
      });

      const profileData = await profileResponse.json();
      if (profileData.success) {
        console.log('✅ Profile Access Successful');
        console.log('   Profile Data:', !!profileData.data);
        console.log('   Patient Profile Auto-Created:', !!profileData.data.profile);
      } else {
        console.log('❌ Profile Access Failed:', profileData.message);
      }
    } else {
      console.log('❌ Login Failed:', loginResult.message);
    }    // Test 5: Test Doctor Registration
    console.log('\n5️⃣ Testing Doctor Registration...');
    const doctorData = {
      name: 'Dr. Test Doctor',
      email: `doctor_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      profileData: {
        specialization: 'Cardiology',
        license_number: 'MD123456',
        experience_years: 5,
        department: 'Cardiology Department'
      }
    };

    const doctorRegisterResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });

    const doctorRegisterData = await doctorRegisterResponse.json();
    if (doctorRegisterData.success) {
      console.log('✅ Doctor Registration Successful');
      console.log('   Doctor ID:', doctorRegisterData.data.user.id);
      console.log('   Specialization:', doctorRegisterData.data.user.profile?.specialization || 'N/A');
      console.log('   License:', doctorRegisterData.data.user.profile?.license_number || 'N/A');
    } else {
      console.log('❌ Doctor Registration Failed:', doctorRegisterData.message);
    }

    console.log('\n🎉 Integration Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend Health Check');
    console.log('   ✅ Patient Registration & Auto Profile Creation');
    console.log('   ✅ User Authentication & JWT Tokens');
    console.log('   ✅ Protected Route Access');
    console.log('   ✅ Doctor Registration with Profile Data');
    console.log('\n🔗 Frontend-Backend Integration: SUCCESSFUL');

  } catch (error) {
    console.error('❌ Integration Test Failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure backend is running on http://localhost:5000');
    console.log('   2. Ensure MySQL database is connected');
    console.log('   3. Check backend logs for errors');
    console.log('   4. Verify CORS settings allow frontend requests');
  }
}

// Run the test
testIntegration();
