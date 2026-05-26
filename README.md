# Sunshine Coast Innovation Portal

A web platform connecting startups, investors, researchers, corporates, and government across the Sunshine Coast region.

---

## Contents

1. [Service accounts and .env](#1-service-accounts-and-env)
2. [Importing the existing data](#2-importing-the-existing-data)
3. [Hosting with Railway](#3-hosting-with-railway)
4. [Running locally or self-hosting](#4-running-locally-or-self-hosting)
5. [Admin panel](#5-admin-panel)

---

## 1. Service accounts and .env

The portal needs two free cloud services. Create an account with each, then fill in `.env`.

### MongoDB Atlas

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0, Sydney -- AWS ap-southeast-2)
3. Create a database user when prompted and note the password
4. Once the cluster is ready, click **Connect > Drivers > Node.js** and copy the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
   ```
   Replace `<password>` with the database user password you set

### Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. On the Dashboard, copy your **Cloud name**, **API key**, and **API secret**

### Filling in .env

Rename `.env.example` to `.env` and fill in each value:

```
MONGO_URI=           # MongoDB connection string from above
ADMIN_USER=          # choose a username for the admin panel
ADMIN_PASS=          # choose a strong password
CORS_ORIGIN=         # your Railway URL once deployed, e.g. https://yourapp.up.railway.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 2. Importing the existing data

The database export is provided as JSON files in the `data/` folder -- one per collection. Import each file into your Atlas cluster.

### Via MongoDB Compass (recommended)

[MongoDB Compass](https://www.mongodb.com/products/compass) is a free desktop app with a visual interface.

1. Download and install Compass
2. Paste your `MONGO_URI` into the connection field and click **Connect**
3. In the left panel, click **+** next to Databases, name it `innovation-portal`, and give the first collection any name -- `listings` is fine
4. For each collection, click its name in the left panel, then **Add Data > Import JSON file** and select the matching file from the `data/` folder. To add a new collection, click **+** next to `innovation-portal` and repeat.

| Collection      | File                      |
| --------------- | ------------------------- |
| `listings`      | `data/listings.json`      |
| `events`        | `data/events.json`        |
| `opportunities` | `data/opportunities.json` |
| `stories`       | `data/stories.json`       |

### Via terminal

```bash
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=listings      --file=data/listings.json      --jsonArray
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=events         --file=data/events.json         --jsonArray
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=opportunities  --file=data/opportunities.json  --jsonArray
mongoimport --uri="$MONGO_URI" --db=innovation-portal --collection=stories        --file=data/stories.json        --jsonArray
```

`mongoimport` is included with the [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools).

---

## 3. Hosting with Railway

Railway deploys the portal to a public URL with no server setup required.

1. Sign up at [railway.com](https://railway.com) -- if GitHub login fails, sign up with email and connect GitHub afterwards from your account settings
2. The repository must be set to **public** on GitHub before Railway can see it -- you can make it private again after the initial deploy if needed
3. Click **New Project > Deploy from GitHub repo** and select this repository
4. Railway will detect the project automatically -- no build or start commands needed
5. Go to the **Variables** tab and add each value from your `.env` file -- **do this before the first deploy or the site will fail to start**
6. Go to **Settings > Networking > Generate Domain** -- Railway provides a public URL
7. Go back to **Variables** and update `CORS_ORIGIN` to match that URL, then click **Deploy** to rebuild
8. The site will be live within a couple of minutes

---

## 4. Running locally or self-hosting

Requires [Node.js 20+](https://nodejs.org) (LTS).

```bash
git clone <repo-url>
cd <project-folder>
npm install --legacy-peer-deps
# rename .env.example to .env and fill in values (see section 1)
npm run dev        # development — visit http://localhost:5173
npm run build      # production build
npm start          # production server on port 3002
```

For persistent deployment, use your preferred process manager to run `npm start`.

---

## 5. Admin panel

The admin panel is at `/admin`. Log in with the `ADMIN_USER` and `ADMIN_PASS` from your `.env`.

### Pending tab

Public submissions (listings, events, opportunities) arrive here and are not visible on the portal until reviewed. Use **Approve** or **Reject** on each card. For events, you can set the event type and organiser before approving.

### Stories tab

Create and manage editorial posts that appear on the Stories page. Click **New story**, fill in the title and body, optionally upload a cover image, and set the status to **Published**. Tick **Featured** to pin a story to the top of the page.

### Auto-approve

When on, all new public submissions go live immediately without review. Off by default.

### Scrape Events

Pulls upcoming events from Maroochydore Event Facilities and Sunshine Coast Council and adds new ones to the pending queue.
