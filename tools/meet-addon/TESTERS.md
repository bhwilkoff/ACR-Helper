# Adding a tester before Google approves the listing

Measured November 19, 2026, with benwilkoff@gmail.com (an account outside
minerva.edu; Minerva's organization did not block it). Up to 100 testers
(the consent screen's limit while the app is in Testing).

For each tester, as the project owner (ben.wilkoff@minerva.edu):

1. **Cloud project roles** (IAM, project `acr-helper`, Grant access):
   - Google Workspace Add-ons Tester (has `gsuiteaddons.deployments.install`)
   - Google Workspace Add-ons Reader (lets the console list the deployment)
   - Viewer (lets the console page load at all)

   The project holds no applicant data; the sheets live in Drive.
2. **Consent screen test user:** Google Auth Platform > Audience > Test
   users > Add users.
3. **Share the spreadsheet** with the tester (view is enough to vote;
   the chair needs edit to record). Use the TEST sheet for testing.

Then the tester, signed in to Chrome as that account:

4. Opens https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com/googleapps_sdk_gsao?project=acr-helper,
   scrolls to Deployments, and presses **Install** on `acr-helper`
   ("Deployment installed successfully").
5. In a Meet call: Activities > Add-ons > ACR Helper. The first sign-in
   shows Google's permission screen once ("Google hasn't verified this
   app": Advanced, then Go to ACR Helper; tick the Google Sheets box).

Testers so far (Nov 19, 2026): benwilkoff@gmail.com; samantha@minerva.edu and cintia.kussuda@minerva.edu (roles, test users, and TEST sheet read access all read back). Send testers https://bhwilkoff.github.io/ACR-Helper/testers/ for steps 4 and 5.

Steps 1 to 3 are what the agent can do in the console; step 4 needs the
tester's own signed-in browser; step 5's first Allow is the tester's.
Remove a tester by deleting their roles and test-user entry and unsharing
the sheet.
