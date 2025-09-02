<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-blue-600 text-white p-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold">Genesis Ticket Scanner</h1>
                    <p class="text-blue-100 text-sm">QR Code Verification</p>
                </div>
                <button @click="showHistory = !showHistory"
                    class="p-2 rounded-full bg-blue-500 hover:bg-blue-700 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </header>

        <main class="p-4 space-y-6">
            <!-- Scanner Section -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-4">
                    <h2 class="text-lg font-semibold mb-4">Scan QR Code</h2>

                    <!-- Camera Preview -->
                    <div class="relative bg-black rounded-lg overflow-hidden mb-4" style="aspect-ratio: 4/3;">
                        <video ref="videoElement" id="video" class="w-full h-full object-cover" autoplay muted
                            playsinline></video>

                        <!-- Scanning Overlay -->
                        <div v-if="store.isScanning" class="absolute inset-0 flex items-center justify-center">
                            <div class="border-2 border-white rounded-lg animate-pulse"
                                style="width: 200px; height: 200px;">
                                <div class="w-full h-full border border-white opacity-50"></div>
                            </div>
                            <!-- Scanning Instructions -->
                            <div class="absolute bottom-4 left-4 right-4 text-center">
                                <p class="text-white text-sm bg-black bg-opacity-50 rounded px-3 py-2">
                                    {{ scanningMessage }}
                                </p>
                            </div>
                        </div>

                        <!-- No Camera Message -->
                        <div v-if="!cameraAvailable && !store.isScanning"
                            class="absolute inset-0 flex items-center justify-center">
                            <div class="text-white text-center p-4">
                                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                        clip-rule="evenodd" />
                                </svg>
                                <p class="text-sm">Camera not available</p>
                                <p class="text-xs opacity-75">Use manual entry below</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 mb-4">
                        <button @click="startScan" :disabled="store.isScanning"
                            class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ store.isScanning ? 'Scanning...' : 'Start Scan' }}
                        </button>

                        <button @click="stopScan" :disabled="!store.isScanning"
                            class="px-6 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Stop
                        </button>
                    </div>

                    <!-- Quick Actions -->
                    <div class="flex gap-2 mb-4">
                        <button @click="scanAndAllow = !scanAndAllow"
                            :class="scanAndAllow ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 hover:bg-gray-500'"
                            class="flex-1 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path v-if="scanAndAllow" fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                                <path v-else fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd" />
                            </svg>
                            {{ scanAndAllow ? 'Auto-Entry: ON' : 'Auto-Entry: OFF' }}
                        </button>
                    </div>

                    <!-- Manual Input -->
                    <div class="border-t pt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Or enter ticket ID manually:
                        </label>
                        <div class="flex gap-2">
                            <input v-model="manualTicketId" type="text" placeholder="Enter ticket ID"
                                class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <button @click="verifyManualTicket" :disabled="!manualTicketId || store.loading"
                                class="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error Display -->
            <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-red-700">{{ store.error }}</p>
                    </div>
                    <button @click="store.clearError()" class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-green-700">{{ successMessage }}</p>
                    </div>
                    <button @click="successMessage = null" class="text-green-500 hover:text-green-700">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Ticket Details -->
            <TicketCard v-if="store.currentTicket" :ticket="store.currentTicket" :loading="store.loading"
                @close="store.clearCurrentTicket()" @mark-as-used="markAsUsed" @verify-again="verifyAgain" />

            <!-- History Sidebar -->
            <div v-if="showHistory" class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="showHistory = false">
                <div class="fixed right-0 top-0 h-full w-80 bg-white shadow-xl" @click.stop>
                    <div class="p-4 border-b">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Scan History</h3>
                            <button @click="showHistory = false" class="p-1 hover:bg-gray-100 rounded">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="overflow-y-auto h-full pb-16">
                        <div v-if="store.scanHistory.length === 0" class="p-4 text-gray-500 text-center">
                            No scans yet
                        </div>
                        <div v-else class="divide-y">
                            <div v-for="item in store.scanHistory" :key="item.id"
                                class="p-4 hover:bg-gray-50 cursor-pointer" @click="verifyFromHistory(item)">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-medium text-sm">{{ item.result }}</span>
                                    <span :class="item.verified ? 'text-green-600' : 'text-gray-400'" class="text-xs">
                                        {{ item.verified ? '✓' : '○' }}
                                    </span>
                                </div>
                                <div class="text-xs text-gray-500">
                                    {{ formatDate(item.timestamp) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
const store = useScannerStore()
const { startScanning, stopScanning, initScanner } = useQRScanner()

const videoElement = ref(null)
const manualTicketId = ref('')
const showHistory = ref(false)
const successMessage = ref(null)
const isOnline = ref(true)
const scanAndAllow = ref(false) // Auto mark as used after successful verification
const cameraAvailable = ref(true)
const scanningMessage = ref('Position QR code within the frame')

onMounted(async () => {
    try {
        // Check camera availability first
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            cameraAvailable.value = false
            console.warn('Camera API not available')
        } else {
            await initScanner()
        }

        // Check online status
        isOnline.value = navigator.onLine
        window.addEventListener('online', () => { isOnline.value = true })
        window.addEventListener('offline', () => { isOnline.value = false })

        // Load scan and allow preference from localStorage (only in browser)
        if (process.client) {
            const savedPreference = localStorage.getItem('scanAndAllow')
            if (savedPreference !== null) {
                scanAndAllow.value = JSON.parse(savedPreference)
            }
        }
    } catch (error) {
        console.error('Failed to initialize scanner:', error)
        cameraAvailable.value = false
    }
})

// Watch scanAndAllow and save to localStorage (only in browser)
watch(scanAndAllow, (newValue) => {
    if (process.client) {
        localStorage.setItem('scanAndAllow', JSON.stringify(newValue))
    }
})

const startScan = async () => {
    if (!isOnline.value) {
        store.error = 'Internet connection required for ticket verification'
        return
    }

    if (!cameraAvailable.value) {
        store.error = 'Camera not available. Please use manual entry.'
        return
    }

    try {
        scanningMessage.value = 'Starting camera...'
        await startScanning('video', async (result) => {
            scanningMessage.value = 'QR code detected! Verifying...'

            // Extract ticket ID from QR code result
            const ticketId = extractTicketId(result)
            if (ticketId) {
                await verifyTicket(ticketId)
            } else {
                scanningMessage.value = 'Invalid QR code format'
                setTimeout(() => {
                    if (store.isScanning) {
                        scanningMessage.value = 'Position QR code within the frame'
                    }
                }, 2000)
            }
        })
        scanningMessage.value = 'Position QR code within the frame'
    } catch (error) {
        console.error('Camera error:', error)
        cameraAvailable.value = false
        store.error = 'Camera access denied or not available. Please use manual entry or check permissions.'
    }
}

const stopScan = () => {
    stopScanning()
}

const extractTicketId = (qrResult) => {
    // Handle different QR code formats
    // If it's a URL like http://localhost:8000/tickets/verify/8
    const urlMatch = qrResult.match(/\/tickets\/verify\/(\d+)/)
    if (urlMatch) {
        return urlMatch[1]
    }

    // If it's just a number
    if (/^\d+$/.test(qrResult)) {
        return qrResult
    }

    // If it's JSON with ticket info
    try {
        const parsed = JSON.parse(qrResult)
        return parsed.ticket_id || parsed.id
    } catch (e) {
        // Not JSON, return as is
        return qrResult
    }
}

const verifyTicket = async (ticketId) => {
    try {
        store.clearError()
        successMessage.value = null

        const response = await store.verifyTicket(ticketId)

        if (response.success) {
            successMessage.value = response.message || 'Ticket verified successfully!'

            // Auto mark as used if enabled and ticket is active
            if (scanAndAllow.value && response.ticket?.status === 'active') {
                setTimeout(async () => {
                    try {
                        await markAsUsed(response.ticket.id)
                        successMessage.value = `✅ ENTRY GRANTED for ${response.ticket.name}!`
                    } catch (error) {
                        console.error('Auto mark as used failed:', error)
                    }
                }, 500) // Small delay to show verification first
            } else {
                // Auto-clear success message after 3 seconds for regular verification
                setTimeout(() => {
                    successMessage.value = null
                }, 3000)
            }
        }
    } catch (error) {
        // Error is handled in store
        console.error('Verification failed:', error)
    }
}

const markAsUsed = async (ticketId) => {
    try {
        const response = await store.markTicketAsUsed(ticketId)
        if (response.success) {
            successMessage.value = 'Ticket marked as used successfully! Entry granted.'

            // Update the current ticket display
            store.currentTicket = response.ticket

            setTimeout(() => {
                successMessage.value = null
            }, 5000) // Show success longer for entry confirmation
        }
    } catch (error) {
        console.error('Failed to mark ticket as used:', error)
    }
}

const verifyAgain = async (ticketId) => {
    await verifyTicket(ticketId)
}

const verifyManualTicket = async () => {
    if (manualTicketId.value) {
        await verifyTicket(manualTicketId.value)
        manualTicketId.value = ''
    }
}

const verifyFromHistory = async (historyItem) => {
    const ticketId = extractTicketId(historyItem.result)
    if (ticketId) {
        await verifyTicket(ticketId)
        showHistory.value = false
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleString()
}

const truncateText = (text, length) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

const getHistoryStatusClass = (item) => {
    if (!item.verified) return 'text-gray-400'
    if (!item.ticket) return 'text-green-600'

    switch (item.ticket.status) {
        case 'active': return 'text-green-600'
        case 'used': return 'text-gray-600'
        case 'expired': return 'text-red-600'
        default: return 'text-gray-400'
    }
}

const getHistoryStatusIcon = (item) => {
    if (!item.verified) return '○'
    if (!item.ticket) return '✓'

    switch (item.ticket.status) {
        case 'active': return '✓'
        case 'used': return '✓ USED'
        case 'expired': return '✗ EXP'
        default: return '?'
    }
}

const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-700'
        case 'used':
            return 'bg-gray-100 text-gray-700'
        case 'expired':
            return 'bg-red-100 text-red-700'
        default:
            return 'bg-gray-100 text-gray-700'
    }
}

// PWA Install prompt
onMounted(() => {
    // This will be handled by the PWA module
})
</script>
