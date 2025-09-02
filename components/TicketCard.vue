<template>
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-green-50 p-4 border-l-4 border-green-400">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <svg class="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    <h3 class="text-lg font-semibold text-green-800">Ticket Verified Successfully</h3>
                </div>
                <button @click="$emit('close')"
                    class="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Ticket Information -->
                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Ticket Number</label>
                        <p class="text-lg font-semibold text-gray-900">{{ ticket.ticket_number }}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Holder Name</label>
                        <p class="text-lg font-medium text-gray-900">{{ ticket.name }}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Ticket Type</label>
                        <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ ticket.ticket_type }}
                        </span>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Status</label>
                        <span :class="getStatusClass(ticket.status)"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {{ ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) }}
                        </span>
                    </div>
                </div>

                <!-- Event Information -->
                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Event</label>
                        <p class="text-lg font-medium text-gray-900">{{ ticket.event.title }}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Location</label>
                        <p class="text-gray-700">{{ ticket.event.location }}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500 block">Start Date</label>
                        <p class="text-gray-700">{{ formatEventDate(ticket.event.start_date) }}</p>
                    </div>

                    <div>
                        <label class="text-sm font-medium text-gray-500 block">End Date</label>
                        <p class="text-gray-700">{{ formatEventDate(ticket.event.end_date) }}</p>
                    </div>

                    <div v-if="ticket.last_scanned_at">
                        <label class="text-sm font-medium text-gray-500 block">Last Scanned</label>
                        <p class="text-gray-700">{{ formatEventDate(ticket.last_scanned_at) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    ticket: {
        type: Object,
        required: true
    }
})

defineEmits(['close'])

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800'
        case 'used':
            return 'bg-gray-100 text-gray-800'
        case 'expired':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const formatEventDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
}
</script>
