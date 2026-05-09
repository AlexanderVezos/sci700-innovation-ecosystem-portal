# Security Assessment: startupsc.punkrecords.xyz

**Stack:** React 19 + Vite / Express 5 / MongoDB Atlas / Cloudflare reverse proxy  
**Assessment date:** May 2026  
**Scope:** External black-box assessment. Prototype phase, no user accounts or payment data.

---

## 1. Reconnaissance

### 1.1 DNS enumeration

`dig` was used to query the DNS (Domain Name System) records for the site. DNS is essentially the internet's phone book, translating a domain name like `startupsc.punkrecords.xyz` into the IP address of the actual server hosting it.

```
$ dig startupsc.punkrecords.xyz A

startupsc.punkrecords.xyz.  8  IN  A  172.67.183.54
startupsc.punkrecords.xyz.  8  IN  A  104.21.51.175
```

Both IPs belong to Cloudflare's anycast range, so the origin server's real IP address is hidden behind Cloudflare's network. No MX or TXT records exist on the subdomain. MX records handle email routing for a domain, so their absence confirms this subdomain is not used to send or receive email. TXT records are used for things like SPF and DKIM, which are email authentication standards that help prevent spam from being sent in a domain's name. None of this applies here, so there is nothing to probe on that front.

### 1.2 HTTP response headers

`curl` was used to inspect the HTTP response headers, which are metadata the server sends back alongside every response describing how the connection should be handled. This is a standard first step for understanding what security policies are in place.

```
$ curl -sI http://startupsc.punkrecords.xyz

HTTP/1.1 301 Moved Permanently
Location: https://startupsc.punkrecords.xyz/
Server: cloudflare
```

```
$ curl -sI https://startupsc.punkrecords.xyz

HTTP/2 200
server: cloudflare
cf-ray: 9f8c069e4f0332a1-BNE
strict-transport-security: max-age=15552000; includeSubDomains
vary: Origin
```

HTTP traffic is redirected to HTTPS with a permanent 301. The `strict-transport-security` header (HSTS) tells browsers to always use the encrypted HTTPS connection for the next 180 days, even if someone types `http://` manually. The `cf-ray` header confirms Cloudflare is terminating the TLS connection rather than the origin server. Some security headers are absent (`Content-Security-Policy`, `X-Frame-Options`, and `Referrer-Policy`), which is noted as a low-severity finding in section 3.9.

### 1.3 Path enumeration

Common paths were requested to map what is publicly reachable. This is something any automated scanner would do within seconds of finding the domain.

```
$ for path in /admin /kiosk /api/admin/settings /.env /robots.txt /sitemap.xml; do
    echo "$(curl -so /dev/null -w '%{http_code}' https://startupsc.punkrecords.xyz$path)  $path"
  done

200  /admin
200  /kiosk
401  /api/admin/settings
403  /.env
200  /robots.txt
200  /sitemap.xml
```

`/admin` and `/kiosk` are both live. `/api/admin/settings` returning `401 Unauthorized` rather than `404 Not Found` is useful; a 404 would mean the path doesn't exist, but a 401 confirms it does exist and is asking for credentials. `/.env` returns `403 Forbidden`, meaning the file is present on the server but something is blocking access to it.

### 1.4 Dev server exposure

Checking the HTML source of the page revealed something unexpected. The following scripts were being injected into every page load:

```html
<script type="module">
  import { injectIntoGlobalHook } from "/@react-refresh";
</script>
<script type="module" src="/@vite/client"></script>
<script type="module" src="/src/main.jsx"></script>
```

These are signatures of Vite's development server. Vite is the build tool used to develop the frontend. It has two modes: a development mode designed for writing code locally, and a production build that compiles everything into optimised files for deployment. The site is running in development mode, which is significant because the development server is designed to be as transparent as possible to aid debugging. That means it serves raw source files directly over the internet.

Anyone can read the application's source code just by knowing the file path:

```
$ curl https://startupsc.punkrecords.xyz/src/pages/Admin.jsx
> Full admin panel source including login logic, session key names, and all API paths

$ curl https://startupsc.punkrecords.xyz/@fs/home/weebus/sci700-innovation-portal-wireframe/server/routes/admin.js
> Full server-side admin route source including how credentials are checked and tokens generated

$ curl https://startupsc.punkrecords.xyz/@fs/home/weebus/sci700-innovation-portal-wireframe/server/adminState.js
> Full token store: tokens held in a Set with no TTL and no expiry
```

The `/@fs/` prefix is a Vite feature that allows the browser to request files from anywhere within the project directory on the server's filesystem. Server-side code that would normally never be visible to a website visitor is therefore publicly readable. The path to use is revealed by Vite itself in source annotations embedded in the JavaScript:

```
var _jsxFileName = "/home/(username)/sci700-innovation-portal-wireframe/src/main.jsx";
```

This also leaks the server's OS username and the exact project directory path.

The `.env` file, which stores the database connection string and admin credentials, is the one exception since Vite blocks dotfiles by default. Everything else is readable.

### 1.5 Public API enumeration

The site's API (the interface the frontend uses to fetch and send data) was queried directly. All approved directory listings are returned as structured data including their internal database IDs:

```
$ curl https://startupsc.punkrecords.xyz/api/startups
[
  { "_id": "69fab7ffdd6f9089ae357c78", "name": "AgriCredit Score", ... },
  { "_id": "69fab7ffdd6f9089ae357c2d", "name": "Allied Health Hub", ... },
  ...
]
```

These database IDs are relevant because they can be used to target specific records in the unauthenticated write endpoints described in section 3.3.

The endpoints for viewing pending (not yet approved) submissions were also tested:

```
$ curl https://startupsc.punkrecords.xyz/api/startups/pending   > []
$ curl https://startupsc.punkrecords.xyz/api/events/pending     > []
```

Both returned empty arrays at the time of testing, but these endpoints require no login. When submissions are waiting for review they would return the submitter's full contact details to anyone who requests them.

### 1.6 Admin credential test

The admin login endpoint was tested with default credentials using `admin` as both the username and password. Having both fields set to admin is common in newly deployed systems like home routers and network equipment, and is typically the first thing an attacker tries. In this case it was correct, as those are the values currently set in the configuration file.

```
$ curl -X POST https://startupsc.punkrecords.xyz/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
> HTTP 401  {"error":"Invalid credentials"}   (0.53s)

$ curl -X POST https://startupsc.punkrecords.xyz/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}'
> HTTP 200  {"token":"43fc90a8a76a5319ab98627dfdd728ab331e8222e00ea9924177c25ec0d2baf7"}   (0.28s)
```

**The default credentials work on the live site.** The session token returned was immediately revoked after confirming it granted access to the admin panel. No data was read or modified.

### 1.7 Unauthenticated write endpoint test

The API includes endpoints for approving or rejecting submissions. These were tested without providing any login credentials:

```
$ curl -X PATCH https://startupsc.punkrecords.xyz/api/startups/000000000000000000000001 \
    -H "Content-Type: application/json" \
    -d '{"status":"approved"}'
> HTTP 404  {"error":"Not found"}
```

The server responded with no authentication challenge at all. The `404` means the dummy ID used for testing did not match a real record. If a valid ID from section 1.5 had been used the response would have been `200 OK` and the record's status would have changed.

---

## 2. Key findings

| #   | Finding                                                                                   | Severity |
| --- | ----------------------------------------------------------------------------------------- | -------- |
| 1   | Production site running development server, full source code publicly readable            | Critical |
| 2   | Default admin credentials (admin/admin) confirmed working on live site                    | Critical |
| 3   | Unauthenticated write endpoints, any submission can be approved or rejected without login | High     |
| 4   | No rate limiting on login endpoint                                                        | High     |
| 5   | Admin session tokens never expire                                                         | High     |
| 6   | Pending queues publicly accessible, exposes submitter contact data                        | Medium   |
| 7   | Malicious URLs accepted on website field, stored XSS vector in admin panel                | Medium   |
| 8   | Permissive CORS policy, any external site can make requests                               | Medium   |
| 9   | No HTTP security headers at origin                                                        | Low      |
| 10  | Malformed request IDs cause a server error instead of a clean rejection                   | Low      |

---

## 3. Vulnerability descriptions

### 3.1 Production site running development server (Critical)

**Evidence:** Development scripts visible in page source, server-side source files confirmed readable

The site is being served through Vite's development mode rather than a compiled production build. The difference matters: a production build compiles and bundles the source code into optimised files and deliberately excludes anything that should not be public. The development server skips this entirely and serves raw source files so developers can see changes in real time.

Every file in the project, including frontend components, server route handlers, and authentication logic, is readable by anyone with a browser. An attacker visiting the site can download the full admin panel implementation, understand how login tokens are generated and stored, and map every API endpoint the application exposes, all without needing credentials.

The only file protected is `.env`, which Vite blocks by default. The actual credential values it contains are therefore not directly readable, but the source code makes clear exactly what format they take and where they are checked.

### 3.2 Default admin credentials (Critical)

**Evidence:** Live test confirmed in section 1.6

The admin username and password are both set to `admin`. This is the most common default credential pair and the first thing any attacker or automated scanner would try. Logging in with these credentials on the live site returns a valid session token that grants full access to the admin panel, including the ability to approve or reject any submission and toggle auto-approval on or off.

There is also no limit on how many times the login can be attempted (section 3.4), so even if the password were changed to something less obvious it could still be guessed through automated trial and error.

### 3.3 Unauthenticated write endpoints (High)

**Evidence:** Live test in section 1.7, server responded with no authentication challenge

Three API endpoints accept requests to approve or reject submissions without checking whether the person making the request is logged in. Because the database IDs for existing records are returned in the public directory listings, anyone can take an ID from those results, send a request to the corresponding endpoint, and change the status of that record directly. Someone submitting their own startup listing could approve it themselves without waiting for admin review.

The admin panel has its own versions of these same endpoints that do check for a valid login token. The unauthenticated copies appear to be leftovers from an earlier stage of development.

### 3.4 No rate limiting on login endpoint (High)

The login page allows an unlimited number of password attempts with no lockout and no delay between failures. Automated tools can try thousands of passwords per second against this endpoint. Combined with the source exposure in section 3.1 which documents exactly how the authentication works, an attacker has good preparation before they even start guessing.

### 3.5 Admin session tokens never expire (High)

**Evidence:** Token storage implementation confirmed readable via dev server (section 1.4)

When an admin logs in, a session token is created and stored in a list with no expiry time attached. The token stays valid indefinitely unless the admin explicitly clicks logout. If a token were ever obtained by a third party, whether from a browser left open on a shared machine, a screenshot, or a network capture on an unsecured connection, it would remain usable until the server itself is restarted.

This is particularly relevant given the site is likely to be used on shared hardware at the demo event.

### 3.6 Pending queues publicly accessible (Medium)

Three endpoints return the full details of submissions that have not yet been reviewed, including submitter email addresses, phone numbers, and business information. These endpoints require no login. Any person who knows the URL can retrieve contact details for everyone who has submitted a listing, without any interaction with the admin panel.

### 3.7 Malicious URLs accepted on website field (Medium)

When submitting a startup listing, the website URL field accepts any value without checking that it is a real web address. These values are stored in the database and displayed as clickable links in the admin panel. A `javascript:` URI submitted as a website address looks like a normal link but executes code in the browser when clicked. If an admin clicks such a link, arbitrary JavaScript runs in the context of their admin session, potentially allowing a submitter to take actions as if they were the logged-in admin.

### 3.8 Permissive CORS policy (Medium)

CORS (Cross-Origin Resource Sharing) controls which external websites are allowed to make requests to the API from a visitor's browser. The current configuration allows requests from any origin, so a malicious third-party website could make API calls to the portal on behalf of a visitor without their awareness. The admin endpoints still require a valid token so the main exposure is the unauthenticated submission and approval endpoints being accessible this way.

### 3.9 No HTTP security headers at origin (Low)

Several standard security headers that browsers use to enforce safe behaviour are not set by the application server. Cloudflare adds a couple of these automatically at the edge, partially covering the gap, but some remain absent:

| Header                    | What it does                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `Content-Security-Policy` | Tells the browser which scripts are allowed to run, reducing the impact of any XSS vulnerability |
| `X-Frame-Options`         | Prevents the site from being embedded inside another page, blocking clickjacking attacks         |
| `Referrer-Policy`         | Controls what URL information is sent to third-party services when a user navigates away         |

### 3.10 Malformed request IDs cause server errors (Low)

The API endpoints that look up records by ID will crash with an unhandled error if the ID provided is not in the correct format, returning a generic `500 Internal Server Error` instead of a `400 Bad Request`. This is more of a code quality issue than a security risk, but it means bad input gets a misleading response and the error is not being handled cleanly.

---

## 4. What is not a vulnerability here

**Database injection:** The application queries the database using hardcoded, fixed query structures. User-submitted data is never used to construct or modify those queries. Injection attacks, where an attacker manipulates input to change the query itself, are not possible here.

**Subdomain takeover:** The domain resolves to live Cloudflare infrastructure and the site is actively serving content. There is no abandoned or unclaimed resource that could be hijacked.

**TLS and encryption:** Cloudflare handles the encrypted connection with TLS 1.3 and manages certificate renewal automatically. Visitors connect securely regardless of what the origin server does internally.

**Admin page discoverability:** Finding the `/admin` path does not give an attacker anything on its own. The login form is the actual boundary. Making the path harder to guess would not meaningfully improve security.

---

## 5. Recommendations

### Must fix before going to production

| Priority | Recommendation                                                                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | **Switch to a production build.** Run `npm run build` and serve the compiled `dist/` folder instead of the development server. This alone closes the source code exposure and removes the foundation for several other findings. |
| 2        | **Change the admin credentials** from `admin / admin` to a strong, unique passphrase before the demo.                                                                                                                            |
| 3        | **Remove the unauthenticated write endpoints** in the startup, event, and opportunity route files. The admin panel already has protected versions of these.                                                                      |
| 4        | **Add a login rate limit** of around 5 attempts per 15 minutes per IP address.                                                                                                                                                   |
| 5        | **Set session tokens to expire** after 8 hours of issue.                                                                                                                                                                         |
| 6        | **Require login to view pending submissions.**                                                                                                                                                                                   |
| 7        | **Validate the website field** to only accept addresses starting with `http://` or `https://` before storing.                                                                                                                    |
| 8        | **Add `helmet()`** to the Express server for a baseline set of security headers in one line.                                                                                                                                     |
| 9        | **Restrict the CORS policy** to only accept requests from the portal's own domain.                                                                                                                                               |
| 10       | **Handle invalid record IDs gracefully** with a proper 400 response rather than an unhandled crash.                                                                                                                              |
