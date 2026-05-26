# Sunshine Coast Innovation Portal

A web platform connecting startups, investors, researchers, corporates, and government across the Sunshine Coast region.

---

## Contents

1. [Service accounts and .env](#1-service-accounts-and-env)
2. [Importing the existing data](#2-importing-the-existing-data)
3. [Running in the browser (no install)](#3-running-in-the-browser-no-install)
4. [Running locally or self-hosting](#4-running-locally-or-self-hosting)
5. [Admin panel](#5-admin-panel)

---

## 1. Service accounts and .env

The portal needs two free cloud services. Create an account with each, then fill in `.env`.

### MongoDB Atlas

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0, Sydney -- AWS ap-southeast-2)
3. Create a database user and note the password
4. Click **Connect > Drivers > Node.js** and copy the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
   ```

### Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. On the Dashboard, copy your **Cloud name**, **API key**, and **API secret**

### Filling in .env

Copy `.env.example` to `.env` and fill in each value:

```
MONGO_URI=           # MongoDB connection string from above
ADMIN_USER=          # choose a username for the admin panel
ADMIN_PASS=          # choose a strong password
CORS_ORIGIN=         # your domain, e.g. https://portal.example.com (or http://localhost:5173 for local)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 2. Importing the existing data

The database export is provided as a set of JSON files in the `data/` folder -- one per collection. Import each file into your Atlas cluster using whichever method suits you.

### Via Atlas (no software required)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and open your cluster
2. Click **Browse Collections**
3. Click **Add Data > Import JSON or CSV file**
4. Select the database `innovation-portal`, enter the collection name (e.g. `listings`), and upload the corresponding file from the `data/` folder
5. Repeat for each collection: `listings`, `events`, `opportunities`, `stories`

### Via MongoDB Compass (desktop GUI)

1. Download and install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your `MONGO_URI`
3. Open the `innovation-portal` database (create it if it doesn't exist)
4. For each collection, click **Add Data > Import JSON file** and select the file from the `data/` folder

### Via terminal

```bash
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=listings      --file=data/listings.json      --jsonArray
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=events         --file=data/events.json         --jsonArray
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=opportunities  --file=data/opportunities.json  --jsonArray
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=stories        --file=data/stories.json        --jsonArray
```

`mongoimport` is included with the [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools).

---

## 3. Running in the browser (no install)

GitHub Codespaces runs the portal entirely in your browser. No software required.

**You will need:** a free [GitHub account](https://github.com) and access to this repository (request an invitation from the project owner).

1. Open the repository on GitHub
2. Click the green **Code** button > **Codespaces** tab > **Create codespace on main**
3. Wait about a minute for the environment to load
4. In the Terminal at the bottom, run:
   ```
   npm install --legacy-peer-deps
   ```
5. Drag and drop your `.env` file into the file panel on the left (top-level folder)
6. Run:
   ```
   npm run dev
   ```
7. When a notification appears, click **Open in Browser**

To stop: close the Codespace from the repository page under **Code > Codespaces**.

---

## 4. Running locally or self-hosting

Requires [Node.js 20+](https://nodejs.org) (LTS).

```bash
git clone <repo-url>
cd <project-folder>
npm install --legacy-peer-deps
cp .env.example .env
# fill in .env (see section 1)
```

**Development:**
```bash
npm run dev
# visit http://localhost:5173
```

**Production:**
```bash
npm run build
npm start
# serves on port 3002
```

For persistent deployment, use [PM2](https://pm2.keymetrics.io):
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 startup && pm2 save
```

---

## 5. Admin panel

The admin panel is at `/admin`. Log in with the `ADMIN_USER` and `ADMIN_PASS` from your `.env`.

### Pending tab

Public submissions (listings, events, opportunities) arrive here. They are not visible on the portal until approved. Use **Approve** or **Reject** on each card. For events, you can set the event type and organiser before approving.

### Stories tab

Create and manage editorial posts that appear on the Stories page. Click **New story**, fill in the title and body, optionally upload a cover image, and set the status to **Published**. Tick **Featured** to pin a story to the top of the page.

### Auto-approve

When on, all new public submissions go live immediately without review. Off by default.

### Scrape Events

Pulls upcoming events from Maroochydore Event Facilities and Sunshine Coast Council and adds new ones to the pending queue.
