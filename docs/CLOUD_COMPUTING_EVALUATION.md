# EventSphere – Cloud Computing Project Evaluation & Viva Guide

**Course:** Cloud Computing Laboratory (B.Tech / MCA / M.Tech Computer Science & Engineering)  
**Project Title:** EventSphere – Serverless Event Management Platform  
**Cloud Infrastructure:** Cloudflare Workers (FaaS), Cloudflare D1 (Serverless Relational SQLite), Cloudflare Pages (PaaS/CDN)  

---

## 1. Tool Introduction (1 Mark)

### 1.1 Overview of Cloudflare
Cloudflare operates one of the world's largest, lowest-latency global Anycast networks, spanning more than 330 cities in over 120 countries. While traditionally recognized as a Content Delivery Network (CDN) and DDoS mitigation provider, Cloudflare has evolved into an edge developer cloud platform capable of executing compute, database transactions, object storage, and AI inference at the network edge—within milliseconds of end users.

### 1.2 Cloudflare Workers (Edge Serverless Compute / FaaS)
- **Architecture:** Cloudflare Workers run on the V8 JavaScript engine using lightweight V8 isolates rather than heavy Node.js runtimes or Docker containers.
- **Instant Cold Starts:** Unlike traditional AWS Lambda or Google Cloud Functions that require hundreds of milliseconds to spin up virtual machines or containers, Cloudflare Worker isolates initialize in **under 5 milliseconds**.
- **Edge Proximity:** Requests are terminated at the nearest physical data center to the user (e.g., Mumbai, Delhi, Frankfurt, San Jose), minimizing network round-trip time (RTT).
- **Role in EventSphere:** Workers host the Hono TypeScript REST API, authenticate requests via Web Crypto PBKDF2 and HMAC-SHA256 JWT tokens, validate Zod request payloads, and coordinate atomic database operations.

### 1.3 Cloudflare Pages (Frontend Hosting & Global CDN)
- **Purpose:** Cloudflare Pages is a serverless Jamstack platform tailored for hosting frontend web applications.
- **Capabilities:** Automatically provides global distribution, SSL/TLS termination, HTTP/3 support, instant atomic deployments, and custom domain mapping.
- **Role in EventSphere:** Serves the compiled production React.js + Vite + Tailwind CSS Single Page Application (SPA), delivering sub-15ms Time to First Byte (TTFB) to participants worldwide.

### 1.4 Cloudflare D1 (Serverless Relational Database)
- **Architecture:** D1 is Cloudflare’s native serverless relational SQL database built on SQLite.
- **Relational Integrity:** Unlike distributed NoSQL document stores (DynamoDB/Firestore) that struggle with atomic capacity constraints without complex distributed locks, D1 provides strict SQL relational tables, unique constraints, foreign keys, and ACID transactions.
- **Read Replication:** Data is persisted in distributed cloud storage with automatic edge caching and read-replication close to where Worker isolates execute.
- **Role in EventSphere:** Persists all users, events, registrations, check-in records, and audit logs. Executes atomic seat reservation queries to completely eliminate overbooking race conditions.

---

## 2. Service Exploration (2 Marks)

Cloud computing resources are organized into standardized service models based on the level of abstraction provided to developers:

```
+-------------------------------------------------------------------------+
|                              SaaS Layer                                 |
| EventSphere Platform (Web UI, Organizer Hub, Participant Dashboards)   |
+-------------------------------------------------------------------------+
|                              FaaS Layer                                 |
| Cloudflare Workers (Event Handlers, Auth Middleware, Ticket Crypto)     |
+-------------------------------------------------------------------------+
|                              PaaS Layer                                 |
| Cloudflare Pages (CDN Hosting) & Cloudflare D1 (Managed DBaaS)          |
+-------------------------------------------------------------------------+
|                              IaaS Layer                                 |
| Physical Data Centers, Anycast Hardware, Fiber Backbones (Managed)      |
+-------------------------------------------------------------------------+
```

### 2.1 Service Model Definitions & Project Mapping

| Model | Formal Definition | EventSphere Implementation Context |
|---|---|---|
| **IaaS** *(Infrastructure as a Service)* | Lowest-level cloud service delivering raw compute instances (VMs), raw block storage, and software-defined networks (e.g., AWS EC2, GCP GCE). Users configure OS kernels, security patches, and firewalls. | **Explicitly NOT used.** EventSphere intentionally avoids provisioning IaaS virtual machines to eliminate idle compute billing, Linux kernel patching, and server maintenance overhead. |
| **PaaS** *(Platform as a Service)* | Higher-level abstraction where the cloud provider manages OS, runtimes, scaling, and database engines. Developers supply only application code or SQL schemas. | **Cloudflare Pages & D1:** Pages provides an automated static build and hosting platform without web server administration; D1 provides a fully managed relational database engine without DB server provisioning. |
| **FaaS** *(Function as a Service / Serverless)* | Granular compute model where code executes purely in response to event triggers (HTTP requests, cron timers). Billing is tied strictly to active wall-clock execution time; scales automatically to zero when idle. | **Cloudflare Workers:** EventSphere’s Hono backend executes as stateless event handlers invoked per HTTP request, spinning up in milliseconds without persistent daemon processes. |
| **SaaS** *(Software as a Service)* | End-user software applications delivered over web browsers or APIs, where all underlying infrastructure, code, and databases are completely abstracted. | **The EventSphere Application:** The finished system is an example of SaaS for university organizers and participants, offering event management, digital ticketing, and check-in workflows. |

### 2.2 Serverless Computing vs. Traditional Hosting

| Dimension | Traditional Always-On Server (EC2 / VPS / Node.js) | Serverless Architecture (Workers + D1 + Pages) |
|---|---|---|
| **Idle Cost** | Incurs continuous billing 24/7/365 even with 0 traffic. | **$0.00 idle cost.** Billed only per millisecond of request execution. |
| **Cold Starts** | High VM boot time (10-60s) or container startup (1-3s). | **< 5 milliseconds** via V8 isolate technology. |
| **Scaling Dynamics** | Requires auto-scaling groups, load balancers, and warmup buffers. | **Instantaneous elasticity** across Cloudflare edge data centers. |
| **Maintenance** | Operating system security patches, reverse proxy (Nginx) maintenance. | **Zero infrastructure maintenance.** Fully managed by Cloudflare. |
| **Attack Surface** | Exposed SSH ports, Linux daemons, unpatched server binaries. | **Hardened edge runtime** with isolated execution boundaries. |

---

## 3. Practical Demonstration (2 Marks)

The presenter should demonstrate the system using the following structured sequence:

### Step 1: Health Check & Cloud Topology Probe
1. Navigate to the **Cloud Architecture & Service Explorer** (`/cloud-architecture`).
2. Click **Execute Step 1 (Edge Health Check & D1 Probe)**.
3. Observe the response:
   - Status: `ok`
   - Database: `connected`
   - Edge Colo Region: Shows the Cloudflare point of presence (e.g., `BOM` for Mumbai, `DEL` for Delhi, or local dev worker).
   - Round-trip latency measured live in the browser (typically 10-35ms).

### Step 2: Role-Based Authentication & Session Handling
1. Navigate to `/login`.
2. Use the **Project Evaluator 1-Click Quick Fill**:
   - Click **Organizer** (`organizer@eventsphere.cloud` / `password123`).
3. Click **Sign In**.
4. Demonstrate that the Worker validates the PBKDF2 hash, issues an HMAC-SHA256 JWT, sets an HttpOnly session cookie, and directs the user to `/organizer/dashboard`.

### Step 3: Serverless Event Creation & D1 Storage
1. From the Organizer Hub, click **Create New Event** (`/organizer/create-event`).
2. Fill in:
   - **Title:** "Cloud Native AI & Edge Symposium 2026"
   - **Category:** "Cloud Computing"
   - **Capacity:** Set to a small limit (e.g., `2` seats) to demonstrate capacity enforcement.
   - **Venue:** "Campus Auditorium A"
3. Notice the **Live Participant Card Preview** updating dynamically.
4. Click **Create Event**.
5. Observe the database insertion in Cloudflare D1 with an automatic audit log entry recorded.

### Step 4: Atomic Participant Registration & Capacity Lock
1. Log out or open an incognito window.
2. Sign in as Participant (`participant@eventsphere.cloud` / `password123`).
3. Navigate to the newly created event with capacity = 2.
4. Click **Register for Event (Free)**.
5. The Worker verifies capacity atomically and issues ticket code `ES-XXXX-XXXX`.
6. An interactive **Digital Admission Ticket** with an encrypted QR code is displayed immediately.
7. Click **Register** again: Demonstrate that the unique index `idx_registrations_active_unique` strictly blocks duplicate active registrations (HTTP 409 Conflict).
8. Register a second participant (`student2@eventsphere.cloud`): The event now reaches 2/2 seats (100% capacity).
9. Register a third participant (`student3@eventsphere.cloud`): The atomic capacity query rejects the registration with:
   `"Registration failed: This event has reached its maximum capacity."`

### Step 5: QR Ticket Verification & Gate Check-In
1. Sign back in as Organizer (`organizer@eventsphere.cloud`).
2. Navigate to **Verify Tickets / QR Scanner** (`/organizer/verify-tickets`).
3. Paste or scan the participant's ticket code.
4. Click **Verify Ticket**: The system confirms the participant name, event title, and verified status.
5. Click **Confirm Gate Check-In**: Check-in is permanently recorded in Cloudflare D1.
6. Click **Confirm Gate Check-In** a second time: The system returns a **Duplicate Check-In Detected** alert with exact timestamp, demonstrating prevention of pass sharing.

### Step 6: CSV Export & Live Analytics
1. Navigate to `/organizer/events`.
2. Click **Attendees** next to the event.
3. Demonstrate the real-time attendee list and click **Export CSV** to download the official roster.
4. Click **Analytics** to view live Recharts visualizations of capacity utilization and registration trends calculated directly from D1 SQL queries.

---

## 4. Feature Identification (2 Marks)

| Feature | Architectural Mechanism | Realistic Limitations & Trade-Offs |
|---|---|---|
| **Elastic Scalability** | Workers scale on-demand across hundreds of Anycast edge nodes without warm-up time. | Cloudflare Free Tier limits Workers to 100,000 requests/day and max 10ms CPU execution time per invocation. |
| **High Availability** | Anycast routing automatically steers traffic away from degraded data centers to healthy nearby nodes. | If Cloudflare edge or underlying D1 replication experiences regional control-plane degradation, localized failover occurs. |
| **Managed Infrastructure** | No OS to maintain, zero container images to rebuild, zero Nginx configuration files. | Dependent on Cloudflare’s proprietary runtime APIs (`workerd`), though Hono provides portability across Node/Deno/Bun. |
| **Enterprise Security** | Web Crypto PBKDF2 (100,000 rounds), HMAC-SHA256 JWTs, Parameterized D1 SQL queries preventing SQL injection, Zod schema validation. | Tokens stored in client memory/cookies require strict SameSite and HTTPS flags in production to prevent CSRF/XSS. |
| **Cost Efficiency** | True zero-idle cost. When nobody is browsing or registering, infrastructure costs remain exactly $0.00. | Intensive analytics workloads on large datasets (>1M rows) require indexed queries to stay within free-tier CPU limits. |
| **Low Edge Latency** | Static assets served from nearest Cloudflare Pages edge; API requests terminated at local edge colo. | D1 primary writes route to the primary database location; read replicas accelerate read queries worldwide. |

---

## 5. Real-Time Application Scenarios (1 Mark)

EventSphere directly addresses practical event management needs in university and enterprise environments:

1. **College Technical Festivals & Symposia:**
   - Hundreds of students simultaneously register the moment competitive coding or robotics events open.
   - Traditional servers crash during registration opening; EventSphere’s atomic D1 transactions handle the spike with zero overbooking.

2. **48-Hour Hackathons:**
   - Organizers require live participant capacity counts, team credential verification, and fast check-in at the venue entrance.
   - Organizers use smartphones to scan participant QR codes at registration desks without renting specialized barcode hardware.

3. **Faculty Development Workshops & Seminars:**
   - Limited seat capacity (e.g., 40 seats in a computer lab) requires strict admission enforcement.
   - Seat cancellation immediately releases the spot in real time for waitlisted participants.

4. **Campus Club Recruitment Drives:**
   - Multiple student societies (IEEE, ACM, Robotics, Literary Club) host simultaneous orientations.
   - Role-based authorization ensures each student club organizer can only edit and view registrations for their own events.

---

## 6. Comprehensive Viva Voce Questions & Answers (2 Marks)

### Q1: What is Cloud Computing?
**Answer:** Cloud computing is the on-demand delivery of computing services—including servers, storage, databases, networking, software, and analytics—over the internet ("the cloud") with pay-as-you-go pricing, resource pooling, rapid elasticity, and measured service (NIST SP 800-145).

### Q2: What is Serverless Computing?
**Answer:** Serverless computing is a cloud execution model where the cloud provider dynamically manages the allocation, provisioning, and scaling of servers. Developers focus entirely on writing business logic without managing operating systems, virtual machines, or server processes. Code is billed only during execution, scaling to zero when idle.

### Q3: What is FaaS (Function as a Service)?
**Answer:** FaaS is a serverless category where developers deploy small, single-purpose functions that are triggered by events (e.g., HTTP requests, database events, scheduled crons). In our project, Cloudflare Workers acts as the FaaS provider.

### Q4: How do Cloudflare Workers differ from AWS Lambda?
**Answer:** AWS Lambda runs functions inside micro-virtual machines (Firecracker) or Docker containers, which often produce "cold starts" of 200ms to 2 seconds. Cloudflare Workers run inside Google V8 engine isolates within Cloudflare’s edge nodes. V8 isolates share a single process with isolated memory boundaries, enabling startup times under 5 milliseconds.

### Q5: What is Cloudflare D1 and why did we choose it over DynamoDB or MongoDB?
**Answer:** Cloudflare D1 is a serverless relational database built on SQLite. We chose D1 because event management requires relational ACID properties: relational joins between users, events, and registrations; unique constraints on active tickets; and atomic capacity checks. NoSQL document databases struggle with transactional capacity limits without costly distributed lock mechanisms.

### Q6: What is the difference between IaaS, PaaS, and SaaS?
**Answer:** 
- **IaaS:** Provider manages hardware and networking; user manages OS, runtime, and app (e.g., AWS EC2).
- **PaaS:** Provider manages hardware, OS, and runtime; user manages app and data (e.g., Cloudflare Pages, D1).
- **SaaS:** Provider manages everything; user consumes finished software via browser (e.g., EventSphere, Gmail).

### Q7: Why is this project classified as a Serverless SaaS application?
**Answer:** It delivers complete software for event organizers and attendees (SaaS) built on top of managed platforms (PaaS - Cloudflare Pages) and event-driven functions (FaaS - Cloudflare Workers) with zero dedicated server processes.

### Q8: What occurs at the cloud level when a participant clicks "Register"?
**Answer:**
1. Browser sends a POST request with JWT authentication headers to `/api/events/:id/register`.
2. Cloudflare Anycast routes the request to the nearest edge Worker.
3. Worker validates user identity and checks permissions.
4. Worker executes an atomic conditional INSERT query on Cloudflare D1.
5. If `confirmed_count < capacity`, the row is inserted and a unique ticket code is generated.
6. The Worker logs an audit entry and returns ticket details to the client.

### Q9: How does EventSphere prevent duplicate active registrations?
**Answer:** Through a database-level filtered unique index:
```sql
CREATE UNIQUE INDEX idx_registrations_active_unique 
ON registrations(event_id, user_id) 
WHERE registration_status = 'confirmed';
```
If a user attempts a second simultaneous registration for the same event, SQLite raises a unique constraint violation error, which the Worker catches and returns as HTTP 409 Conflict.

### Q10: How does EventSphere handle concurrent registrations when only 1 seat remains?
**Answer:** Instead of a vulnerable `SELECT count` followed by a detached `INSERT`, EventSphere uses a single atomic SQL statement:
```sql
INSERT INTO registrations (id, event_id, user_id, ticket_code, registration_status, created_at)
SELECT ?, ?, ?, ?, 'confirmed', ?
WHERE (
  SELECT COUNT(*) FROM registrations 
  WHERE event_id = ? AND registration_status = 'confirmed'
) < (
  SELECT capacity FROM events WHERE id = ? AND status = 'published'
);
```
In SQLite/D1, this query runs inside an atomic write transaction. If multiple requests arrive concurrently, only one will find the condition true and insert a row (`changes = 1`); all subsequent requests insert 0 rows (`changes = 0`) and receive a 400 Capacity Full response.

### Q11: How is user authentication implemented in a serverless environment?
**Answer:** Since serverless workers are stateless and do not share in-memory session stores, authentication uses stateless JSON Web Tokens (JWT) signed with HMAC-SHA256. Passwords are never stored in plaintext; they are hashed using the Web Crypto API’s PBKDF2 with SHA-256 and 100,000 iterations using unique cryptographic salts.

### Q12: Why can’t we use traditional `bcrypt` inside Cloudflare Workers?
**Answer:** Standard Node.js `bcrypt` relies on native C++ node bindings (`node-gyp`), which are incompatible with V8 isolate edge sandboxes. EventSphere uses the native Web Crypto API (`crypto.subtle`), which runs natively inside V8 isolates without external binaries.

### Q13: What happens when a participant cancels their registration?
**Answer:** The registration record’s `registration_status` is updated to `'cancelled'`. The unique index ignores cancelled rows, and the computed remaining capacity immediately increases by 1, making the seat instantly available to others.

### Q14: How does QR ticket verification prevent fraud?
**Answer:** The QR code contains an opaque, cryptographically random ticket code (`ES-XXXX-XXXX`), not sensitive participant details. When scanned, the organizer's terminal queries `/api/tickets/verify`. The system checks if the ticket is confirmed and whether a record exists in the `check_ins` table. A database unique constraint on `check_ins(registration_id)` prevents reuse.

### Q15: What is the purpose of Hono in our backend?
**Answer:** Hono is an ultra-fast, lightweight web framework designed specifically for Cloudflare Workers and edge runtimes. It provides expressive routing, middleware support, and TypeScript typings with virtually zero bundle size overhead (<14KB).

### Q16: How does the application prevent regular users from escalating themselves to admin?
**Answer:** In the registration schema (`RegisterSchema`), the public role enum allows only `'organizer'` or `'participant'`. Even if a malicious user tampers with the HTTP body to send `{ role: 'admin' }`, the backend explicitly overrides or rejects it. Admin role changes are guarded by `requireRole('admin')` middleware.

### Q17: What are the free-tier limitations of Cloudflare Workers and D1?
**Answer:**
- **Workers:** 100,000 requests per day, 10ms CPU time per invocation.
- **D1:** 5 million rows read per day, 100,000 rows written per day, 500MB total database storage.
- **Pages:** Unlimited bandwidth, 500 builds per month.

### Q18: What is the purpose of an Anycast network in Cloudflare?
**Answer:** In Anycast routing, all of Cloudflare’s 330+ data centers announce the exact same IP addresses via BGP (Border Gateway Protocol). The internet routing infrastructure automatically steers each user’s request to the closest physical router, distributing load globally without a single central load balancer.

### Q19: What is the difference between latency and throughput in cloud computing?
**Answer:**
- **Latency:** The time required for a single request to travel from client to server and back (measured in milliseconds).
- **Throughput:** The volume of requests or data the system can process simultaneously per unit time (measured in requests/sec or MB/s).

### Q20: How does EventSphere achieve low latency?
**Answer:**
1. Cloudflare Pages caches static HTML, JS, and CSS files in edge points worldwide.
2. Cloudflare Workers execute API logic at the edge closest to the requester.
3. Database queries run on D1 SQLite read replicas with sub-millisecond in-memory cache reads.

### Q21: What is an Audit Log and why is it critical in cloud systems?
**Answer:** An audit log is an immutable, append-only record tracking who did what, when, and on which resource (e.g., `USER_LOGIN`, `EVENT_CREATED`, `TICKET_CHECKIN`). It provides compliance, security tracing, and forensic verification of administrative operations.

### Q22: What happens if Cloudflare D1 becomes temporarily unavailable?
**Answer:** The `/api/health` endpoint detects database connectivity loss and transitions application status to `degraded`. The frontend detects this and displays graceful error banners rather than unhandled white-screen crashes.

### Q23: Why do we use Zod for validation?
**Answer:** Zod guarantees runtime type safety in TypeScript. Even though TypeScript compiles types at build time, incoming HTTP requests from the internet are untrusted. Zod validates request payloads at runtime before any database query executes, blocking malformed inputs.

### Q24: What is the significance of the 5-minute demonstration script?
**Answer:** It allows examiners and evaluators to systematically witness cloud health probing, role-based security, live database writes, atomic concurrency protection, and QR verification within the allocated examination time.

### Q25: How does this project reflect the principles of green cloud computing?
**Answer:** Because serverless functions scale to zero when not in use, no computing cycles or electricity are consumed while waiting for requests. Compared to traditional always-on dedicated servers running at 5-10% CPU utilization, serverless drastically reduces cloud carbon footprints.

---

## 7. 5-Minute Examination Demonstration Script

| Minute | Stage | Action by Presenter | Key Talking Points |
|---|---|---|---|
| **0:00 - 1:00** | **Introduction & Problem Statement** | Open Home Page (`/`). Point out the architecture highlights. | *"Good morning. EventSphere solves the challenge of dedicated server cost and overbooking during high-traffic registrations by employing Cloudflare's serverless edge infrastructure."* |
| **1:00 - 2:00** | **Cloud Architecture Explorer** | Navigate to `/cloud-architecture`. Click **Execute Step 1 (Health Probe)**. | *"Here we probe our edge worker isolate. Notice the round-trip latency measured live in the browser, and the cloud data center region code proving request dispatch at the edge."* |
| **2:00 - 3:00** | **Event Creation & D1 Storage** | Quick-login as Organizer (`organizer@eventsphere.cloud`). Create an event with capacity = 2. | *"As an organizer, I publish an event. Hono validates the payload via Zod and commits it directly to Cloudflare D1 managed SQLite with an immutable audit log."* |
| **3:00 - 4:00** | **Atomic Registration & Capacity Lock** | Sign in as Participant. Register for the event. Show QR ticket. Attempt duplicate registration. | *"When registering, the worker runs an atomic SQL check. If we attempt a duplicate registration, our unique constraint blocks it. If capacity is exhausted, the conditional insert prevents overbooking."* |
| **4:00 - 5:00** | **Ticket Verification & Summary** | Navigate to `/organizer/verify-tickets`. Verify ticket code and check in. Attempt duplicate check-in. | *"On-site, organizers scan the QR code. The system checks in the participant and strictly prevents duplicate check-ins. All statistics feed live into our Recharts analytics dashboard."* |
