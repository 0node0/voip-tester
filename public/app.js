// Twilio VoIP Tester - Frontend Application
// Handles device connection, calling, and webhook inspection

class TwilioVoIPTester {
    constructor() {
        this.device = null;
        this.activeCall = null;
        this.initElements();
        this.bindEvents();
        this.loadCallHistory();
        this.loadWebhookLogs();
    }

    initElements() {
        // Status elements
        this.connectionStatus = document.getElementById('connection-status');
        this.statusText = this.connectionStatus.querySelector('.status-text');
        this.connectBtn = document.getElementById('connect-btn');

        // Calling elements
        this.phoneNumberInput = document.getElementById('phone-number');
        this.callBtn = document.getElementById('call-btn');
        this.hangupBtn = document.getElementById('hangup-btn');
        this.callStatus = document.getElementById('call-status');

        // Incoming call elements
        this.twilioNumberDisplay = document.getElementById('twilio-number');
        this.incomingCallPanel = document.getElementById('incoming-call');
        this.callerIdDisplay = document.getElementById('caller-id');
        this.answerBtn = document.getElementById('answer-btn');
        this.rejectBtn = document.getElementById('reject-btn');

        // Logs
        this.webhookLog = document.getElementById('webhook-log');
        this.callLogs = document.getElementById('call-logs');
        this.clearLogBtn = document.getElementById('clear-log-btn');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
    }

    bindEvents() {
        this.connectBtn.addEventListener('click', () => this.connectDevice());
        this.callBtn.addEventListener('click', () => this.makeCall());
        this.hangupBtn.addEventListener('click', () => this.hangup());
        this.answerBtn.addEventListener('click', () => this.answerIncomingCall());
        this.rejectBtn.addEventListener('click', () => this.rejectIncomingCall());
        this.clearLogBtn.addEventListener('click', () => this.clearWebhookLog());
        this.clearHistoryBtn.addEventListener('click', () => this.clearCallHistory());
    }

    async connectDevice() {
        try {
            this.updateCallStatus('Getting capability token...');
            
            // Get capability token from backend (uses hardcoded env vars)
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to get capability token');
            }

            const data = await response.json();
            const token = data.token;

            // Update Twilio number display
            if (data.twilioPhone) {
                this.twilioNumberDisplay.textContent = data.twilioPhone;
            }

            // Initialize Twilio Device
            this.device = new Twilio.Device(token, {
                codecPreferences: ['opus', 'pcmu'],
                fakeLocalDTMF: true,
                enableRingingState: true
            });

            this.device.on('ready', () => {
                console.log('Twilio.Device ready');
                this.setConnected(true);
                this.updateCallStatus('Device ready - You can make calls now');
            });

            this.device.on('error', (error) => {
                console.error('Twilio.Device error:', error);
                this.setConnected(false);
                this.updateCallStatus(`Error: ${error.message}`);
            });

            this.device.on('incoming', (call) => {
                console.log('Incoming call:', call);
                this.handleIncomingCall(call);
            });

            this.device.on('offline', () => {
                console.log('Device offline');
                this.setConnected(false);
            });

        } catch (error) {
            console.error('Connection error:', error);
            this.updateCallStatus(`Connection failed: ${error.message}`);
            alert(`Connection failed: ${error.message}`);
        }
    }

    setConnected(connected) {
        if (connected) {
            this.connectionStatus.classList.remove('disconnected');
            this.connectionStatus.classList.add('connected');
            this.statusText.textContent = 'Connected';
            this.connectBtn.textContent = 'Reconnect';
            this.callBtn.disabled = false;
        } else {
            this.connectionStatus.classList.remove('connected');
            this.connectionStatus.classList.add('disconnected');
            this.statusText.textContent = 'Disconnected';
            this.connectBtn.textContent = 'Connect Device';
            this.callBtn.disabled = true;
        }
    }

    async makeCall() {
        const phoneNumber = this.phoneNumberInput.value.trim();
        if (!phoneNumber) {
            alert('Please enter a phone number');
            return;
        }

        if (!this.device) {
            alert('Device not connected');
            return;
        }

        try {
            this.updateCallStatus(`Calling ${phoneNumber}...`);
            
            this.activeCall = await this.device.connect({ params: { To: phoneNumber } });
            this.bindCallEvents();
            
            this.callBtn.disabled = true;
            this.hangupBtn.disabled = false;

            this.logCall({
                type: 'outgoing',
                number: phoneNumber,
                status: 'initiated',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Call error:', error);
            this.updateCallStatus(`Call failed: ${error.message}`);
        }
    }

    bindCallEvents() {
        if (!this.activeCall) return;

        this.activeCall.on('ringing', () => {
            console.log('Ringing...');
            this.updateCallStatus('Ringing...');
        });

        this.activeCall.on('accept', () => {
            console.log('Call accepted');
            this.updateCallStatus('Call in progress...');
            this.updateCallStatus('Connected', 'success');
        });

        this.activeCall.on('disconnect', () => {
            console.log('Call disconnected');
            this.updateCallStatus('Call ended');
            this.endCall();
            
            this.logCall({
                type: this.activeCall.parameters.From ? 'incoming' : 'outgoing',
                number: this.activeCall.parameters.From || this.phoneNumberInput.value,
                status: 'completed',
                duration: this.activeCall._duration || 0,
                timestamp: new Date().toISOString()
            });
        });

        this.activeCall.on('error', (error) => {
            console.error('Call error:', error);
            this.updateCallStatus(`Call error: ${error.message}`);
            this.endCall();
        });
    }

    handleIncomingCall(call) {
        this.activeCall = call;
        const callerId = call.parameters.From || 'Unknown';
        
        this.callerIdDisplay.textContent = callerId;
        this.incomingCallPanel.classList.remove('hidden');
        this.updateCallStatus(`Incoming call from ${callerId}`);

        this.bindCallEvents();
        
        this.logCall({
            type: 'incoming',
            number: callerId,
            status: 'ringing',
            timestamp: new Date().toISOString()
        });
    }

    answerIncomingCall() {
        if (this.activeCall) {
            this.activeCall.accept();
            this.incomingCallPanel.classList.add('hidden');
            this.callBtn.disabled = true;
            this.hangupBtn.disabled = false;
            this.updateCallStatus('Call in progress...');
        }
    }

    rejectIncomingCall() {
        if (this.activeCall) {
            this.activeCall.reject();
            this.incomingCallPanel.classList.add('hidden');
            this.endCall();
        }
    }

    hangup() {
        if (this.activeCall) {
            this.activeCall.disconnect();
        }
    }

    endCall() {
        this.activeCall = null;
        this.callBtn.disabled = false;
        this.hangupBtn.disabled = true;
        this.incomingCallPanel.classList.add('hidden');
        setTimeout(() => {
            if (!this.activeCall) {
                this.updateCallStatus('Device ready');
            }
        }, 2000);
    }

    updateCallStatus(message, type = 'info') {
        this.callStatus.textContent = message;
        this.callStatus.style.color = type === 'success' ? '#10b981' : '#374151';
    }

    logCall(callData) {
        // Get existing history
        const history = this.getCallHistory();
        
        // Add new call
        history.unshift(callData);
        
        // Keep last 50 calls
        if (history.length > 50) {
            history.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('twilio_call_history', JSON.stringify(history));
        
        // Update UI
        this.loadCallHistory();
    }

    getCallHistory() {
        const saved = localStorage.getItem('twilio_call_history');
        return saved ? JSON.parse(saved) : [];
    }

    loadCallHistory() {
        const history = this.getCallHistory();
        
        if (history.length === 0) {
            this.callLogs.innerHTML = '<div class="log-entry placeholder">No calls yet...</div>';
            return;
        }

        this.callLogs.innerHTML = history.map(call => {
            const date = new Date(call.timestamp);
            const icon = call.type === 'incoming' ? '📥' : '📞';
            const statusColor = call.status === 'completed' ? '#10b981' : call.status === 'ringing' ? '#f59e0b' : '#6b7280';
            
            return `
                <div class="log-entry">
                    <div>${icon} ${call.type} to/from ${call.number}</div>
                    <div class="log-timestamp">
                        ${date.toLocaleString()} • 
                        <span style="color: ${statusColor}">${call.status}</span>
                        ${call.duration ? `• ${Math.round(call.duration)}s` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    clearCallHistory() {
        localStorage.removeItem('twilio_call_history');
        this.loadCallHistory();
    }

    // Webhook logging (simulated - actual webhooks go to backend)
    logWebhook(payload) {
        const logs = this.getWebhookLogs();
        logs.unshift({
            timestamp: new Date().toISOString(),
            payload: payload
        });
        
        if (logs.length > 50) {
            logs.pop();
        }
        
        localStorage.setItem('twilio_webhook_logs', JSON.stringify(logs));
        this.loadWebhookLogs();
    }

    getWebhookLogs() {
        const saved = localStorage.getItem('twilio_webhook_logs');
        return saved ? JSON.parse(saved) : [];
    }

    loadWebhookLogs() {
        const logs = this.getWebhookLogs();
        
        if (logs.length === 0) {
            this.webhookLog.innerHTML = '<div class="log-entry placeholder">No webhooks received yet...</div>';
            return;
        }

        this.webhookLog.innerHTML = logs.map(log => {
            const date = new Date(log.timestamp);
            return `
                <div class="log-entry">
                    <div class="log-timestamp">${date.toLocaleString()}</div>
                    <div class="log-payload">${JSON.stringify(log.payload, null, 2)}</div>
                </div>
            `;
        }).join('');
    }

    clearWebhookLog() {
        localStorage.removeItem('twilio_webhook_logs');
        this.loadWebhookLogs();
    }
}

// Initialize the application
const app = new TwilioVoIPTester();

// Listen for webhook events from backend (via Server-Sent Events or polling)
// For simplicity, we'll use a simple polling mechanism
setInterval(async () => {
    try {
        const response = await fetch('/api/webhooks/recent');
        if (response.ok) {
            const webhooks = await response.json();
            webhooks.forEach(webhook => {
                app.logWebhook(webhook);
            });
        }
    } catch (error) {
        // Silently fail - backend might not be running
    }
}, 5000); // Poll every 5 seconds
