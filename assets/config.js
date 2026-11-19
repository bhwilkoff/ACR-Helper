// Not secrets: a Cloud project number, an OAuth client ID, a sheet ID, and a
// Supabase publishable key are all safe in a public repository.
window.ACR_CONFIG = {
  cloudProjectNumber: '',
  oauthClientId: '',
  // The fake TEST copy. Switch to productionSpreadsheetId only after a real-call
  // test on this one passes (REQUIREMENTS P9).
  spreadsheetId: '1ZCsMmoUErQurrT7SQX5yz5F_fHDAm2DiJxM-eMTcnso',
  productionSpreadsheetId: '1uiUPxkNHcAAfTWS-9y6XSbbxnpQWyJv3ZCO3Ew7vc6I',
  supabaseUrl: '',
  supabaseKey: '',
  scopes: 'https://www.googleapis.com/auth/spreadsheets openid email profile',
  version: '0.1.0',
};
