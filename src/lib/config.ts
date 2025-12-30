// Square Web Payments SDK configuration
// Using shared sandbox credentials (same as Manor)
export const SQUARE_APPLICATION_ID = 'sandbox-sq0idb-hg9YwZ2R5PcziKMyEUhtgQ'
export const SQUARE_LOCATION_ID = 'LNNPG8BZ4VVMP'

// Use the sandbox SDK when the app ID is a sandbox one
export const SQUARE_SCRIPT_SRC = SQUARE_APPLICATION_ID.startsWith('sandbox-')
  ? 'https://sandbox.web.squarecdn.com/v1/square.js'
  : 'https://web.squarecdn.com/v1/square.js'

