// Not secrets: a Cloud project number, an OAuth client ID, a sheet ID, and a
// Supabase publishable key are all safe in a public repository.
window.ACR_CONFIG = {
  cloudProjectNumber: '29360684398',
  oauthClientId: '29360684398-1g2skem2bt2m6kq7ufc6o3iubc2b74fl.apps.googleusercontent.com',
  // The fake TEST copy. Switch to productionSpreadsheetId only after a real-call
  // test on this one passes (REQUIREMENTS P9).
  spreadsheetId: '1ZCsMmoUErQurrT7SQX5yz5F_fHDAm2DiJxM-eMTcnso',
  productionSpreadsheetId: '1uiUPxkNHcAAfTWS-9y6XSbbxnpQWyJv3ZCO3Ew7vc6I',
  supabaseUrl: 'https://gjnbqfcqaxfgnjodvxlr.supabase.co',
  supabaseKey: 'sb_publishable_dxhZMl5AcKpY7R4RpPeHmg_Aozw6TNO',
  scopes: 'https://www.googleapis.com/auth/spreadsheets openid email profile',
  version: '0.3.1',
};
