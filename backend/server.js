const jsonServer = require('json-server');
const server = jsonServer.create();

// ⭐ FIXED: Correct path for Render deployment
const router = jsonServer.router('db.json');

const middlewares = jsonServer.defaults();
const { sendOTP, sendSOSAlert, sendDonorRequest } = require('./emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ======================== MULTER CONFIG =========================
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

// ⭐ Serve uploaded files (needed for Render)
server.use('/uploads', jsonServer.defaults({ static: path.join(__dirname, 'uploads') }));

// ======================== DISTANCE CALC =========================
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ======================== SEND OTP =========================
server.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    console.log(`OTP for ${email}: ${otp}`);

    const success = await sendOTP(email, otp);

    if (success) res.json({ message: 'OTP sent successfully' });
    else res.status(500).json({ error: 'Failed to send OTP' });
});

// ======================== SOS ALERT =========================
server.post('/send-sos-alert', async (req, res) => {
    try {
        const { requestData } = req.body;
        if (!requestData) return res.status(400).json({ error: 'Request data required' });

        const db = router.db;
        const donors = db.get('donors').value();
        const users = db.get('users').value();

        // Filter donors
        const matches = donors.filter(donor => {
            if (donor.eligibilityStatus !== 'Eligible') return false;
            if (donor.bloodGroup !== requestData.bloodGroup) return false;

            const dist = calculateDistance(
                donor.latitude, donor.longitude,
                requestData.latitude, requestData.longitude
            );

            donor.distance = dist.toFixed(1);
            return dist <= 100;
        });

        let emailCount = 0;

        for (const donor of matches) {
            const user = users.find(u => u.id == donor.userId);
            if (user?.email) {
                const sent = await sendSOSAlert(user.email, donor.name, {
                    ...requestData,
                    distance: donor.distance
                });
                if (sent) emailCount++;
            }
        }

        res.json({
            message: "SOS alerts sent",
            matchedDonors: matches.length,
            emailsSent: emailCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed SOS processing' });
    }
});

// ======================== MISSED SOS =========================
server.post('/check-missed-notifications', async (req, res) => {
    try {
        const { donorId } = req.body;
        if (!donorId) return res.status(400).json({ error: 'Donor ID required' });

        const db = router.db;
        const donor = db.get('donors').find({ id: donorId }).value();
        const user = db.get('users').find({ id: donor.userId }).value();

        if (!donor || !user?.email)
            return res.status(404).json({ error: 'Donor/User not found' });

        const requests = db.get('requests').filter({ status: 'Open', isSOS: true }).value();

        let count = 0;
        for (const r of requests) {
            if (r.bloodGroup !== donor.bloodGroup) continue;
            const dist = calculateDistance(donor.latitude, donor.longitude, r.latitude, r.longitude);
            if (dist <= 100) {
                const sent = await sendSOSAlert(user.email, donor.name, {
                    ...r,
                    distance: dist.toFixed(1)
                });
                if (sent) count++;
            }
        }

        res.json({ message: "Checked missed notifications", alertsSent: count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed checking notifications' });
    }
});

// ======================== CONFIRM DONATION =========================
server.post('/confirm-donation', (req, res) => {
    try {
        const { requestId, donorId } = req.body;
        const db = router.db;

        const request = db.get('requests').find({ id: requestId }).value();
        if (!request) return res.status(404).json({ error: 'Request not found' });

        const updated = request.responses.map(r =>
            r.donorId === donorId ? { ...r, status: 'Donated' } : r
        );

        db.get('requests').find({ id: requestId }).assign({ responses: updated }).write();

        const donor = db.get('donors').find({ id: donorId }).value();
        if (donor) {
            const today = new Date();
            const points = (donor.points || 0) + 50;
            const next = new Date(today);

            if (donor.gender === 'Female') next.setMonth(today.getMonth() + 4);
            else next.setMonth(today.getMonth() + 3);

            db.get('donors')
                .find({ id: donorId })
                .assign({
                    points,
                    lastDonationDate: today.toISOString().split('T')[0],
                    nextEligibleDate: next.toISOString().split('T')[0],
                    availabilityStatus: "Unavailable",
                    eligibilityStatus: "Not Eligible"
                })
                .write();
        }

        res.json({ message: "Donation confirmed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Donation confirmation failed' });
    }
});

// ======================== AWARD POINTS =========================
server.post('/award-points', (req, res) => {
    try {
        const { donorId, requestId, points } = req.body;
        const db = router.db;

        const donor = db.get('donors').find({ id: donorId }).value();
        if (!donor) return res.status(404).json({ error: 'Donor not found' });

        db.get('donors')
            .find({ id: donorId })
            .assign({
                points: (donor.points || 0) + points,
                donationCount: (donor.donationCount || 0) + 1,
                lastDonationDate: new Date().toISOString().split('T')[0]
            })
            .write();

        res.json({ message: "Points awarded" });
    } catch (err) {
        res.status(500).json({ error: "Failed to award points" });
    }
});

// ======================== DONOR REQUEST =========================
server.post('/send-donor-request', async (req, res) => {
    try {
        const { donorId, receiverName, receiverContact, hospital, bloodGroup, message } = req.body;

        if (!donorId || !receiverName || !receiverContact || !hospital || !bloodGroup)
            return res.status(400).json({ error: "Missing fields" });

        const db = router.db;

        const donor = db.get('donors').find({ id: donorId }).value();
        if (!donor) return res.status(404).json({ error: 'Donor not found' });

        const user = db.get('users').find({ id: donor.userId }).value();
        if (!user?.email) return res.status(404).json({ error: 'Email not found' });

        const sent = await sendDonorRequest(user.email, donor.name, {
            bloodGroup, receiverName, hospital, contactNumber: receiverContact, message
        });

        res.json({ message: "Request sent", emailSent: sent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send donor request" });
    }
});

// ======================== CREATE REQUEST =========================
server.post('/requests', (req, res) => {
    const requestData = req.body;
    const db = router.db;

    if (requestData.targetDonorId) {
        const existing = db.get('requests').find({
            userId: requestData.userId,
            targetDonorId: requestData.targetDonorId,
            status: "Open"
        }).value();

        if (existing)
            return res.status(409).json({ error: "Duplicate request" });
    }

    const id = Date.now();
    const newRequest = { ...requestData, id };

    db.get('requests').push(newRequest).write();
    res.status(201).json(newRequest);
});

// ======================== UPLOAD REPORT =========================
server.post('/upload-report', upload.single('report'), (req, res) => {
    try {
        const { donorId } = req.body;
        const file = req.file;

        if (!donorId || !file)
            return res.status(400).json({ error: "Donor ID and report file required" });

        const db = router.db;
        const donor = db.get('donors').find({ id: parseInt(donorId) }).value();
        if (!donor)
            return res.status(404).json({ error: "Donor not found" });

        const reportUrl =
            `https://digital-blood-emergency-platform.onrender.com/uploads/${file.filename}`;

        db.get('donors')
            .find({ id: parseInt(donorId) })
            .assign({
                reportUrl,
                isVerified: true,
                eligibilityStatus: 'Eligible'
            })
            .write();

        res.json({ message: "Report uploaded", reportUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});

// ========================
server.use(router);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
