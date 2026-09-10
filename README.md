# HostelBites

Open `index.html` in a browser to run the HostelBites snack-store website. It needs no installation or server. The storefront visuals are built directly into the page, so it continues to work when external image sites are unavailable.

## Admin access

- Authorised numbers: `8939009198` and `8122881704`
- Demo passcode: `hostelbites`

The Admin login is deliberately hidden from student customers. Staff open the page with `?admin` at the end of the address, for example: `index.html?admin`.

Change the passcode and authorised numbers in `app.js` before production use. Product inventory, cart, orders, weekly sales and shop availability are stored in the browser's LocalStorage. The Admin dashboard exports all recorded sales as CSV.

For a real multi-device production database, deploy this front end with a secure server-side database and authentication; browser LocalStorage is intentionally device-local and should not be used as the only security layer for real payments or shared staff access.
