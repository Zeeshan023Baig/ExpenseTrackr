import axios from 'axios';

const test = async () => {
    const email = 'test@example.com'; // Change to a valid email if known

    try {
        console.log(`Testing POST http://localhost:5000/api/auth/forgot-password with email: ${email} ...`);
        const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        console.log('✅ Response:', res.data.message);
    } catch (error) {
        if (error.response) {
            console.log(`ℹ️ Response Status: ${error.response.status}`);
            console.log(`ℹ️ Response Message: ${error.response.data.message}`);
        } else {
            console.error('❌ Network Error (Backend likely not running)');
        }
    }

    try {
        console.log('Testing PUT http://localhost:5000/api/auth/reset-password/invalidtoken ...');
        const res = await axios.put('http://localhost:5000/api/auth/reset-password/invalidtoken', { password: 'newpassword123' });
        console.log('✅ Unexpected success with invalid token');
    } catch (error) {
        if (error.response) {
            console.log(`✅ Success: Invalid token correctly returned status ${error.response.status} (${error.response.data.message})`);
        } else {
            console.error('❌ Network Error');
        }
    }
};

test();
