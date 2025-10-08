
import { defineStore } from 'pinia'

export const useScannerStore = defineStore('scanner', {
    state: () => ({
        isScanning: false,
        lastScanResult: null,
        scanHistory: [],
        currentTicket: null,
        loading: false,
        error: null
    }),

    actions: {
        setScanning(status) {
            this.isScanning = status
        },

        setScanResult(result) {
            this.lastScanResult = result
            this.addToHistory(result)
        },

        addToHistory(result) {
            const historyItem = {
                id: Date.now(),
                result,
                timestamp: new Date(),
                verified: false
            }
            this.scanHistory.unshift(historyItem)

            // Keep only last 50 scans
            if (this.scanHistory.length > 50) {
                this.scanHistory = this.scanHistory.slice(0, 50)
            }
        },

        async verifyTicket(ticketId) {
            this.loading = true
            this.error = null

            try {
                const config = useRuntimeConfig()
                const response = await $fetch(`${config.public.apiBase}/tickets/verify/${ticketId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // For CORS with credentials
                })

                if (response.success) {
                    this.currentTicket = response.ticket

                    // Update history item as verified
                    const historyItem = this.scanHistory.find(item =>
                        item.result === ticketId || item.result.includes(ticketId)
                    )
                    if (historyItem) {
                        historyItem.verified = true
                        historyItem.ticket = response.ticket
                        historyItem.status = response.ticket.status
                    }
                } else {
                    // Handle specific error cases
                    this.error = this.getErrorMessage(response.error_code, response.message)
                    if (response.ticket) {
                        this.currentTicket = response.ticket
                    }
                }

                return response
            } catch (error) {
                console.error('Verification error:', error)
                this.error = this.getNetworkErrorMessage(error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async markTicketAsUsed(ticketId) {
            this.loading = true
            this.error = null

            try {
                const config = useRuntimeConfig()
                const response = await $fetch(`${config.public.apiBase}/tickets/mark-used/${ticketId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })

                if (response.success && response.ticket) {
                    this.currentTicket = response.ticket

                    // Update history
                    const historyItem = this.scanHistory.find(item =>
                        item.result === ticketId || item.result.includes(ticketId)
                    )
                    if (historyItem) {
                        historyItem.ticket = response.ticket
                        historyItem.status = 'used'
                    }
                }

                return response
            } catch (error) {
                this.error = this.getNetworkErrorMessage(error)
                throw error
            } finally {
                this.loading = false
            }
        },

        getErrorMessage(errorCode, defaultMessage) {
            const errorMessages = {
                'TICKET_NOT_FOUND': 'Ticket not found. Please check the QR code and try again.',
                'TICKET_ALREADY_USED': 'This ticket has already been used for entry.',
                'TICKET_EXPIRED': 'This ticket has expired and is no longer valid.',
                'VERIFICATION_ERROR': 'Unable to verify ticket. Please try again.'
            }

            return errorMessages[errorCode] || defaultMessage || 'Verification failed'
        },

        getNetworkErrorMessage(error) {
            if (error.status === 404) {
                return 'Ticket not found. Please check the QR code.'
            } else if (error.status === 400) {
                return error.data?.message || 'Invalid ticket or ticket already used.'
            } else if (error.status >= 500) {
                return 'Server error. Please try again later.'
            } else if (error.name === 'FetchError') {
                return 'Network error. Please check your connection.'
            }

            return error.data?.message || 'Unable to verify ticket. Please try again.'
        },

        clearError() {
            this.error = null
        },

        clearCurrentTicket() {
            this.currentTicket = null
        }
    }
})