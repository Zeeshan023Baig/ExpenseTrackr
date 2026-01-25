import axios from 'axios';

// Test the backend route directly
const test = async () => {
    try {
        console.log('Testing POST http://localhost:5000/api/expenses ...');
        // Expecting 401 Unauthorized because we have no token, but NOT 404
        await axios.post('http://localhost:5000/api/expenses', {});
        console.log('✅ Route found! (Unexpected 200, but route exists)');
    } catch (error) {
        if (error.response) {
            console.log(`ℹ️ Response Status: ${error.response.status}`);
            if (error.response.status === 404) {
                console.error('❌ Route 404 NOT FOUND - The backend does not recognize this path.');
            } else if (error.response.status === 401) {
                console.log('✅ Route Exists (Got 401 Unauthorized as expected)');
            } else if (error.response.status === 400) {
                console.log('✅ Route Exists (Got 400 Bad Request as expected)');
            } else {
                console.log(`✅ Route Exists (Got ${error.response.status})`);
            }
        } else {
            console.error('❌ Network Error (Backend likely not running at localhost:5000)');
        }
    }
};

test();
