const axios = require('axios');

async function checkDonors() {
    try {
        const res = await axios.get('http://localhost:5001/donors');
        console.log('Total Donors:', res.data.length);
        console.log('First Donor:', res.data[0]);
    } catch (err) {
        console.error('Error fetching donors:', err.message);
    }
}

checkDonors();
