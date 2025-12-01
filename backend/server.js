const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('backend/db.json');
const middlewares = jsonServer.defaults();
const { sendOTP, sendSOSAlert, sendDonorRequest } = require('./emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from uploads directory
server.use('/uploads', jsonServer.defaults({ static: path.join(__dirname, 'uploads') }));

// Geo-distance calculation (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom route for sending OTP
server.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    console.log(`\n🔐 OTP GENERATED for ${email}: ${otp}`);
    console.log('📧 Attempting to send email...\n');

    const success = await sendOTP(email, otp);

    if (success) {
        res.json({ message: 'OTP sent successfully' });
    } else {
        console.log(`\n⚠️  EMAIL FAILED - But you can use this OTP for testing: ${otp}\n`);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Custom route for SOS Alerts
server.post('/send-sos-alert', async (req, res) => {
    const { requestData } = req.body;

    if (!requestData) {
        return res.status(400).json({ error: 'Request data required' });
    }

    try {
        // 1. Get all donors
        const db = router.db; // Access lowdb instance
        const donors = db.get('donors').value();
        const users = db.get('users').value();

        // 2. Filter Donors
        const matchingDonors = donors.filter(donor => {
            // Must be Eligible
            if (donor.eligibilityStatus !== 'Eligible') return false;

            // Must match Blood Group
            if (donor.bloodGroup !== requestData.bloodGroup) return false;

            // Must be within 100km
            const distance = calculateDistance(
                donor.latitude, donor.longitude,
                requestData.latitude, requestData.longitude
            );

            // Attach distance for email context
            donor.distance = distance.toFixed(1);

            return distance <= 100;
        });

        console.log(`Found ${matchingDonors.length} matching donors for SOS.`);

        // 3. Send Notifications
        let emailCount = 0;
        for (const donor of matchingDonors) {
            // Find user email
            const user = users.find(u => u.id == donor.userId); // loose equality for string/number id
            if (user && user.email) {
                // Simulate WhatsApp
                console.log(`[WHATSAPP SIMULATION] Sending SOS to ${donor.phone}: "URGENT: ${requestData.bloodGroup} needed at ${requestData.hospital}!"`);

                // Send Real Email
                const emailSent = await sendSOSAlert(user.email, donor.name, {
                    ...requestData,
                    distance: donor.distance
                });
                if (emailSent) emailCount++;
            }
        }

        res.json({
            message: 'SOS Alerts processed',
            matchedDonors: matchingDonors.length,
            emailsSent: emailCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process SOS alerts' });
    }
});

// Custom route for checking missed SOS notifications for new donors
server.post('/check-missed-notifications', async (req, res) => {
    const { donorId } = req.body;

    if (!donorId) {
        return res.status(400).json({ error: 'Donor ID is required' });
    }

    try {
        const db = router.db;
        const donor = db.get('donors').find({ id: donorId }).value();

        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }

        // Get user email
        const user = db.get('users').find({ id: donor.userId }).value();
        if (!user || !user.email) {
            return res.status(404).json({ error: 'User email not found' });
        }

        // Get all OPEN SOS requests
        const openSOSRequests = db.get('requests')
            .filter({ status: 'Open', isSOS: true })
            .value();

        console.log(`\n🔍 Checking missed SOS notifications for new donor: ${donor.name} (${donor.bloodGroup})`);
        console.log(`Found ${openSOSRequests.length} active SOS requests in total.`);

        let emailCount = 0;

        for (const request of openSOSRequests) {
            // Check Blood Group Match
            if (request.bloodGroup !== donor.bloodGroup) continue;

            // Check Distance
            const distance = calculateDistance(
                donor.latitude, donor.longitude,
                request.latitude, request.longitude
            );

            if (distance <= 100) {
                console.log(`   -> Match found! Request ID: ${request.id}, Distance: ${distance.toFixed(1)}km`);

                // Send Email
                const emailSent = await sendSOSAlert(user.email, donor.name, {
                    ...request,
                    distance: distance.toFixed(1)
                });

                if (emailSent) emailCount++;
            }
        }

        console.log(`✅ Sent ${emailCount} missed SOS alerts to new donor.\n`);

        res.json({
            message: 'Checked for missed notifications',
            alertsSent: emailCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check missed notifications' });
    }
});

// Custom route for Confirming Donation
server.post('/confirm-donation', (req, res) => {
    const { requestId, donorId } = req.body;

    if (!requestId || !donorId) {
        return res.status(400).json({ error: 'Request ID and Donor ID are required' });
    }

    try {
        const db = router.db;

        // 1. Update Request Response Status
        const request = db.get('requests').find({ id: requestId }).value();
        if (!request) return res.status(404).json({ error: 'Request not found' });

        const updatedResponses = request.responses.map(r => {
            if (r.donorId === donorId) {
                return { ...r, status: 'Donated' };
            }
            return r;
        });

        db.get('requests')
            .find({ id: requestId })
            .assign({ responses: updatedResponses })
            .write();

        // 2. Increment Donor Points & Update Eligibility
        const donor = db.get('donors').find({ id: donorId }).value();
        if (donor) {
            const newPoints = (donor.points || 0) + 50;
            const today = new Date();
            let nextEligibleDate = new Date(today);

            // Gender-based cooldown
            if (donor.gender === 'Female') {
                nextEligibleDate.setMonth(today.getMonth() + 4);
            } else {
                nextEligibleDate.setMonth(today.getMonth() + 3); // Male or others default to 3
            }

            db.get('donors')
                .find({ id: donorId })
                .assign({
                    points: newPoints,
                    lastDonationDate: today.toISOString().split('T')[0],
                    nextEligibleDate: nextEligibleDate.toISOString().split('T')[0],
                    availabilityStatus: "Unavailable",
                    eligibilityStatus: "Not Eligible"
                })
                .write();
        }

        res.json({ message: 'Donation confirmed and points updated!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to confirm donation' });
    }
});

// Award points when receiver marks request as completed
server.post('/award-points', (req, res) => {
    try {
        const { donorId, requestId, points } = req.body;
        const db = router.db;

        if (!donorId || !requestId || !points) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Update donor points
        const donor = db.get('donors').find({ id: donorId }).value();

        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }

        const newPoints = (donor.points || 0) + points;
        const newDonationCount = (donor.donationCount || 0) + 1;

        db.get('donors')
            .find({ id: donorId })
            .assign({
                points: newPoints,
                donationCount: newDonationCount,
                lastDonationDate: new Date().toISOString().split('T')[0]
            })
            .write();

        console.log(`✅ Awarded ${points} points to donor ${donorId}. Total: ${newPoints}`);
        res.json({
            message: 'Points awarded successfully',
            newPoints,
            newDonationCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to award points' });
    }
});

// Custom route for Sending Donor Request
server.post('/send-donor-request', async (req, res) => {
    const { donorId, receiverName, receiverContact, hospital, bloodGroup, message } = req.body;

    if (!donorId || !receiverName || !receiverContact || !hospital || !bloodGroup) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const db = router.db;

        // Get donor details
        const donor = db.get('donors').find({ id: donorId }).value();
        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }

        // Get donor's email from users table
        const user = db.get('users').find({ id: donor.userId }).value();
        if (!user || !user.email) {
            return res.status(404).json({ error: 'Donor email not found' });
        }

        // Send email notification
        const requestDetails = {
            bloodGroup,
            receiverName,
            hospital,
            contactNumber: receiverContact,
            message: message || ''
        };

        const emailSent = await sendDonorRequest(user.email, donor.name, requestDetails);

        if (emailSent) {
            res.json({
                message: 'Request sent successfully',
                emailSent: true
            });
        } else {
            // Fallback for demo/dev: Return success even if email fails, but log it.
            console.log("Email failed to send, but treating request as successful for demo.");
            res.json({
                message: 'Request sent (Email delivery failed)',
                emailSent: false,
                warning: 'Email configuration issue'
            });
        }

    } catch (err) {
        console.error(err);
        // Even on system error, for this specific demo flow, we might want to be lenient, 
        // but let's keep 500 for actual crashes.
        res.status(500).json({ error: 'Failed to send donor request' });
    }
});

// Custom route for Creating Request with Duplicate Check
server.post('/requests', (req, res) => {
    const requestData = req.body;
    const db = router.db;

    // Check for duplicate: same user sending to same donor
    // Allow same patient/hospital details but going to DIFFERENT donors
    if (requestData.targetDonorId) {
        const existingRequest = db.get('requests').find({
            userId: requestData.userId,
            targetDonorId: requestData.targetDonorId,
            status: "Open"
        }).value();

        if (existingRequest) {
            return res.status(409).json({ error: 'Duplicate request: already sent to this donor' });
        }
    }

    // Create new request
    const id = Date.now(); // Simple ID generation
    const newRequest = { ...requestData, id };

    db.get('requests').push(newRequest).write();
    res.status(201).json(newRequest);
});

// Custom route for uploading blood report
server.post('/upload-report', upload.single('report'), (req, res) => {
    const { donorId } = req.body;
    const file = req.file;

    if (!donorId || !file) {
        return res.status(400).json({ error: 'Donor ID and Report File are required' });
    }

    try {
        const db = router.db;
        const donor = db.get('donors').find({ id: parseInt(donorId) }).value();

        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }

        // Construct file URL (assuming server runs on same host)
        // Note: In production, use environment variable for base URL
        const reportUrl = `http://localhost:${PORT}/uploads/${file.filename}`;

        // Check if donor is still in cooldown period
        let eligibilityStatus = 'Eligible';
        let message = 'Report uploaded successfully! You are now eligible.';

        if (donor.nextEligibleDate) {
            const today = new Date();
            const nextEligibleDate = new Date(donor.nextEligibleDate);

            if (today < nextEligibleDate) {
                // Still in cooldown period
                eligibilityStatus = 'Not Eligible';
                const daysRemaining = Math.ceil((nextEligibleDate - today) / (1000 * 60 * 60 * 24));
                message = `Report uploaded successfully! However, you must wait ${daysRemaining} more days before you can donate again (eligible from ${nextEligibleDate.toLocaleDateString()}).`;
            }
        }

        // Update donor profile
        db.get('donors')
            .find({ id: parseInt(donorId) })
            .assign({
                reportUrl: reportUrl,
                eligibilityStatus: eligibilityStatus,
                isVerified: true
            })
            .write();

        res.json({
            message: message,
            reportUrl: reportUrl,
            eligibilityStatus: eligibilityStatus,
            nextEligibleDate: donor.nextEligibleDate || null
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload report' });
    }
});


server.use(router);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});
