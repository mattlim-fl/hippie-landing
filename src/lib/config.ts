// Square Web Payments SDK configuration
export const SQUARE_APPLICATION_ID = 'sq0idp-DJ7zCd3ZYkvvvy43ltS4ow'
export const SQUARE_LOCATION_ID = 'LGRBM02D8PCNM'

// Use the sandbox SDK when the app ID is a sandbox one
export const SQUARE_SCRIPT_SRC = SQUARE_APPLICATION_ID.startsWith('sandbox-')
  ? 'https://sandbox.web.squarecdn.com/v1/square.js'
  : 'https://web.squarecdn.com/v1/square.js'




