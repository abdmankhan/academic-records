#!/bin/bash

echo "🎉 Academic Certificates Platform - Quick Start"
echo "=============================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd "$PROJECT_ROOT/backend"
    
    if check_port 5000; then
        echo "⚠️  Port 5000 already in use. Backend might already be running."
    else
        npm start &
        BACKEND_PID=$!
        echo "✅ Backend starting on http://localhost:5000 (PID: $BACKEND_PID)"
        sleep 3
    fi
}

# Start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd "$PROJECT_ROOT/frontend"
    
    if check_port 3000; then
        echo "⚠️  Port 3000 already in use. Frontend might already be running."
    else
        npm start &
        FRONTEND_PID=$!
        echo "✅ Frontend starting on http://localhost:3000 (PID: $FRONTEND_PID)"
    fi
}

# Test backend health
test_backend() {
    echo "🏥 Testing Backend Health..."
    sleep 5  # Give backend time to start
    
    for i in {1..10}; do
        if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
            echo "✅ Backend is healthy!"
            curl -s http://localhost:5000/api/health | jq . 2>/dev/null || curl -s http://localhost:5000/api/health
            
            # Test user list endpoint
            echo ""
            echo "👥 Testing User Authentication..."
            curl -s http://localhost:5000/api/users/list | jq . 2>/dev/null || curl -s http://localhost:5000/api/users/list
            
            # Test login
            echo ""
            echo "🔐 Testing Login..."
            LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/users/login \
                -H "Content-Type: application/json" \
                -d '{"username":"admin","password":"adminpw"}')
            
            if echo "$LOGIN_RESPONSE" | grep -q "token"; then
                echo "✅ Login test successful!"
                echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
            else
                echo "❌ Login test failed:"
                echo "$LOGIN_RESPONSE"
            fi
            
            return 0
        fi
        echo "⏳ Waiting for backend... ($i/10)"
        sleep 2
    done
    
    echo "❌ Backend health check failed"
    return 1
}

# Main execution
main() {
    echo "📋 Current Status:"
    echo "   Backend (5000): $(check_port 5000 && echo "🟢 Running" || echo "🔴 Not running")"
    echo "   Frontend (3000): $(check_port 3000 && echo "🟢 Running" || echo "🔴 Not running")"
    echo ""
    
    # Start services
    start_backend
    start_frontend
    
    # Test backend
    test_backend
    
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5000"
    echo "   API Health: http://localhost:5000/api/health"
    echo ""
    echo "📖 Demo Credentials:"
    echo "   Username: admin"
    echo "   Password: adminpw"
    echo ""
    echo "🛑 To stop services:"
    echo "   Press Ctrl+C or run: pkill -f 'node server.js' && pkill -f 'react-scripts'"
    echo ""
    echo "✨ Your Academic Certificates Platform is ready!"
    
    # Wait for user to stop
    read -p "Press Enter to stop all services..." 
    
    # Cleanup
    echo "🛑 Stopping services..."
    pkill -f 'node server.js' 2>/dev/null
    pkill -f 'react-scripts' 2>/dev/null
    echo "✅ Services stopped"
}

# Handle Ctrl+C
trap 'echo -e "\n🛑 Stopping services..."; pkill -f "node server.js" 2>/dev/null; pkill -f "react-scripts" 2>/dev/null; exit 0' INT

main