# Title: CtrlF

## Team and Roles
Dara Alegre - Scrum Master, Developer
Bryan Sandoval - Product Owner, Developer 
Anthony Cortez - Developer
Jonathan De La Paz Posadas - Developer

## Problem Statement
There is a severe lack of an online space for game developers to discuss their work and problems they encounter with game development. Many developers have to go in between many sites to cover their ground for all they wish to do in game development. It’s important for game developers to have a centralized platform to find others in their space, gain valuable resources and find places to apply their skills.


## Project Description
Our product is a website intended to be a community platform catered towards game developers. Users will be able to create accounts, profiles, share and discover libraries and development resources, ask questions about programming problems, and provide solutions to other game developers. The website will provide features for discovering game jams, seeking for freelance developers, and potential collaborators across different areas of game development, including music, programming, art, and other specialized roles. The platform will also allow users to create blog-style posts that document their game development journey, update about their projects, and promote their games.

### Game jams
- A place to host your own Jam similar to Itch 
- You can also choose to instead link to an outside jam board 
- The purpose is to have Jam’s easier to filter through and therefore easier to find what you're looking for. 

### Looking for work
- Allow people who are looking to hire make a job listing 

### Place to look for different types of developers
- Music
- Programming
- Art
- etc

### Connecting with other developers/finding potential collaborators

### Blogging about your game development journey
- Here you can post about recent discoveries you’ve made as a developer
- Post any updates regarding development or a new tool you've released
- Pin important stuff to the top of your blog. 
- Promote your games!



## What does Ready Mean?
Ready means your snippet of code for a particular issue/part of the project is ready to be reviewed by the team.

## What does Done Mean?
Done means that the snippet of code that was submitted for reviewed has been checked, is bug free, and ready to be merged to main.

## Stakeholders
- New Game Developers 
- Experienced Game Developers
- Recruiters in the industry 
- Freelancers
- Game Jam Hosts

## Build and Run Instructions

These steps assume a computer that has never run CtrlF before.

### 1. Install the prerequisites

| Tool | Version | Check with |
|------|---------|------------|
| Git | any recent | `git --version` |
| Node.js (includes npm) | 20 or newer | `node -v` |
| Java JDK | 17 or newer | `java -version` |
| MySQL Server | 8.x | `mysql --version` |

Maven does **not** need to be installed. The project includes the Maven wrapper (`backend/mvnw`).

### 2. Clone the repository

```bash
git clone https://github.com/UNCC-Couch-Potatoes/Software-Development-Project-Capstone.git
cd Software-Development-Project-Capstone
```

### 3. Create the database

Start MySQL, then log in as root:

```bash
mysql -u root -p
```

In the MySQL prompt, run:

```sql
CREATE DATABASE ctrlf;
USE ctrlf;
SOURCE backend/database/schema.sql;
SOURCE backend/database/sample-data.sql;
EXIT;
```

(If `SOURCE` can't find the files, use the full path to them, or run the two files in MySQL Workbench with the `ctrlf` schema selected.)

### 4. Point the backend at your database

The backend connects to `jdbc:mysql://localhost:3306/ctrlf` as `root`. Set your MySQL password as an environment variable before starting it:

**macOS / Linux**
```bash
export DB_PASSWORD=your_mysql_password
```

**Windows (PowerShell)**
```powershell
$env:DB_PASSWORD="your_mysql_password"
```

Optional: `DB_URL` and `DB_USERNAME` can be set the same way if your MySQL setup is different.

### 5. Start the backend (Spring Boot API)

From the project root, in the same terminal where you set `DB_PASSWORD`:

**macOS / Linux**
```bash
npm run dev:backend
```

**Windows**
```powershell
backend\mvnw.cmd -f backend\pom.xml spring-boot:run
```

The first run downloads dependencies and can take a few minutes. The API is ready when you see `Started CtrlFApiApplication`. It runs at http://localhost:8080. You can check it at http://localhost:8080/api/status.

### 6. Start the frontend (React + Vite)

Open a **second** terminal in the project root:

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually **http://localhost:5173**.

### 7. Log in

- Create a new account on the **Register** page, or
- Log in with the sample account: username `timmyturner123`, password `<ADD PASSWORD HERE>`

### Running the tests

```bash
npm run test:backend
```

### Troubleshooting

- **`Access denied for user 'root'`**: `DB_PASSWORD` isn't set in the terminal running the backend, or it's wrong.
- **`Schema-validation: missing table`**: the backend expects the tables from `schema.sql`. Re-run step 3.
- **Login page says it can't connect to the server**: the backend isn't running. Start step 5 first.
- **`permission denied: ./backend/mvnw`** (macOS/Linux): run `chmod +x backend/mvnw`.


## Resource posts

Logged-in users can select **Create a post** on Resources to open `/resources/manage`,
view their posts, and create a resource at `/resources/new`. Each published post has
an ID-based URL (`/resources/{id}`) stored in `SiteLink`. Only its creator can edit it.
The Home sidebar loads the current user's actual resource posts.

`SiteName` stores the title, `Overview` the summary, `Tags` the pipe-delimited tags,
and `Body` the original Markdown. `OwnerUserId` records the authenticated session user;
clients cannot choose the owner. Markdown supports headings, subtitles, bold, italic,
lists, quotes, code and links, with a preview. Raw HTML is rendered as text.

For an existing MySQL database, run `backend/database/resource-posts-migration.sql`
before starting the API. It adds missing `Body` and `OwnerUserId` columns and is
safe to rerun. Select the application database first. New databases can use the
updated `backend/database/schema.sql`. Existing external resources remain available.

Run `npm run build`, `npm run lint`, and `npm run test:backend` to validate changes.
A deployed frontend must serve `index.html` for resource URLs (SPA fallback).

## Approved resource tags and expanded sample catalog

The filter sidebar and resource editor load `/api/resource-tags` from `ResourceTags`.
The catalog contains Development (100), Art & assets (100), Audio (71), Algorithms
(70), Marketing (45), and Misc (25), plus **User Made** in its own top section.
Each filter group starts with five tags. **Show more** reveals up to ten more at a time.

User posts automatically receive **User Made** on creation and every edit. It cannot
be removed in the editor. The API canonicalizes approved tag names and rejects
unknown tags. Tags continue to be stored in the existing pipe-delimited `Tags`
column. The tag catalog is the authority for selectable names.

For an existing database, apply `backend/database/resource-posts-migration.sql`
if needed, then `backend/database/resource-tags-migration.sql` before restarting
the backend. The tag migration creates and seeds `ResourceTags` and adds **User Made**
to existing owned resources. It does not mark external website resources as user made.
If an old post used custom tags, remove or replace those tags when editing it.

For a new database, run `backend/database/schema.sql` followed by
`backend/database/sample-data.sql`. The sample file includes the approved catalog
and 120 researched resources (20 per group), each tagged only with catalog values.
It skips resource URLs and the sample account that already exist when rerun.
`backend/database/resource-tags.sql` can also seed the tag catalog independently.

See `backend/database/resource-catalog.md` for the research date, original source
links, summaries, and tag assignments. The source list includes official project
sites, documentation, original author pages, and project repositories.
