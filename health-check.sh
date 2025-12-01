#!/bin/bash
# Comprehensive Project Health Check

echo "=== Emergency Blood Platform - Health Check ==="
echo ""

# Check if servers are running
echo "1. Checking if servers are running..."
if pgrep -f "node backend/server.js" > /dev/null; then
    echo "   ✓ Backend server is running"
else
    echo "   ✗ Backend server is NOT running"
    exit 1
fi

if pgrep -f "vite" > /dev/null; then
    echo "   ✓ Frontend server is running"
else
    echo "   ✗ Frontend server is NOT running"
    exit 1
fi

echo ""

# Check API endpoints
echo "2. Checking API endpoints..."
if curl -s https://digital-blood-emergency-platform.onrender.com/users > /dev/null; then
    echo "   ✓ /users endpoint is accessible"
else
    echo "   ✗ /users endpoint failed"
    exit 1
fi

if curl -s https://digital-blood-emergency-platform.onrender.com/donors > /dev/null; then
    echo "   ✓ /donors endpoint is accessible"
else
    echo "   ✗ /donors endpoint failed"
    exit 1
fi

if curl -s https://digital-blood-emergency-platform.onrender.com/requests > /dev/null; then
    echo "   ✓ /requests endpoint is accessible"
else
    echo "   ✗ /requests endpoint failed"
    exit 1
fi

echo ""

# Check database integrity
echo "3. Checking database integrity..."
USER_COUNT=$(curl -s https://digital-blood-emergency-platform.onrender.com/users | jq 'length')
DONOR_COUNT=$(curl -s https://digital-blood-emergency-platform.onrender.com/donors | jq 'length')
REQUEST_COUNT=$(curl -s https://digital-blood-emergency-platform.onrender.com/requests | jq 'length')

echo "   - Users: $USER_COUNT"
echo "   - Donors: $DONOR_COUNT"
echo "   - Requests: $REQUEST_COUNT"

# Check if venu's donor profile has all required fields
echo ""
echo "4. Checking donor profile completeness..."
VENU_PROFILE=$(curl -s https://digital-blood-emergency-platform.onrender.com/donors | jq '.[] | select(.name == "venu")')

if echo "$VENU_PROFILE" | jq -e '.userId' > /dev/null; then
    echo "   ✓ userId field present"
else
    echo "   ✗ userId field missing"
fi

if echo "$VENU_PROFILE" | jq -e '.bloodGroup' > /dev/null; then
    echo "   ✓ bloodGroup field present"
else
    echo "   ✗ bloodGroup field missing"
fi

if echo "$VENU_PROFILE" | jq -e '.eligibilityStatus' > /dev/null; then
    echo "   ✓ eligibilityStatus field present"
else
    echo "   ✗ eligibilityStatus field missing"
fi

if echo "$VENU_PROFILE" | jq -e '.availabilityStatus' > /dev/null; then
    echo "   ✓ availabilityStatus field present"
else
    echo "   ✗ availabilityStatus field missing"
fi

echo ""

# Check critical files
echo "5. Checking critical files..."
FILES=(
    "src/App.jsx"
    "src/pages/receiver/ReceiverDashboard.jsx"
    "src/pages/receiver/History.jsx"
    "src/pages/donor/DonorDashboard.jsx"
    "src/components/Navbar.jsx"
    "src/components/EditProfileModal.jsx"
    "backend/server.js"
    "backend/db.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file exists"
    else
        echo "   ✗ $file missing"
    fi
done

echo ""
echo "=== Health Check Complete ==="
echo ""
echo "Frontend: https://digital-blood-emergency-platform.onrender.com"
echo "Backend API: https://digital-blood-emergency-platform.onrender.com"
echo ""
echo "Test Accounts:"
echo "  Donor: venu@gmail.com / 123456"
echo "  Receiver: umesh@gmail.com / 123456"
