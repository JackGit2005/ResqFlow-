import { GoogleGenAI } from '@google/genai';
import { StorageService } from './storage';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; actionType: 'navigate' | 'filter' | 'prompt'; target?: string }[];
}

export const SUGGESTED_QUERIES = [
  'How do civilians submit incident reports & resource requests?',
  'How do request statuses work in ResQFlow?',
  'How do I attach incident photos securely?',
  'How do coordinators review and allocate resources?',
  'How do responders update assigned missions?',
  'Where are public shelters and available beds located?',
  'What should I do in an immediate life-threatening emergency in Ballari?'
];

export const RESQFLOW_KNOWLEDGE_DOCUMENT = `
RESQFLOW EMERGENCY RESOURCE ALLOCATION PLATFORM
BALLARI DISTRICT DISASTER MANAGEMENT AUTHORITY (DDMA), KARNATAKA, INDIA

1. HOW RESQFLOW WORKS:
ResQFlow is an emergency coordination and resource optimization platform tailored for Ballari District, Karnataka. It connects four distinct operational roles:
- Civilian: Can file emergency incident reports, submit humanitarian assistance requests (food, water, medicine, rescue evacuation, shelter intake), track the real-time status of their requests with audit timeline, and view public relief shelter capacities and meteorological risk advisories. Civilians CANNOT deploy resources or access administrative records.
- Responder: Field personnel (SDRF, Fire & Rescue, EMRI 108, Civil Defense) who access authorized assigned missions, report situational field progress, and update status upon task completion.
- Coordinator: Operational staff at Ballari DDMA Control Room who verify incoming incident reports, triage civilian requests, evaluate heuristic allocation options, and authorize resource dispatches.
- Administrator: Senior authority (District Collector / DDMA Director) managing system parameters, reserve thresholds, Supabase backend sync, and simulation drills.

2. HOW CIVILIANS SUBMIT INCIDENT REPORTS & RESOURCE REQUESTS:
- Incident Reports: Click the "Report Incident" button in the top navigation or visit the "Public Transparency Feed & Reporting" portal. Fill in the title, incident category (Flood, Fire, Collapse, Accident, etc.), specific Ballari landmark/ward, severity assessment, detailed description, and optional photo attachment.
- Humanitarian Resource Requests: Civilians navigate to the "Civilian Assistance Hub", click "Request Assistance", select the request category (Medical Assistance, Emergency Food & Ration, Potable Water, Rescue Evacuation, Emergency Shelter, General Supplies), specify urgency level, number of affected people, special medical needs (e.g., insulin, infant formula), and attach verification photos if available.
- Privacy Protection: In compliance with Indian data privacy standards, civilian personal contact numbers are strictly scrubbed from public transparency feeds and accessible only to authenticated coordinators and assigned responders.

3. HOW REQUEST STATUSES WORK:
Every civilian assistance request moves through a transparent, audited 5-stage lifecycle:
- Pending Review: Request successfully submitted and queued on the Ballari DDMA coordinator desk.
- Approved: Coordinator has verified the incident and validated the requirement.
- In Progress: Specific responder squad or fleet (e.g., SDRF boat, 108 ambulance, water tanker) has been assigned and dispatched to the location.
- Completed: Rescue mission successfully conducted, supplies delivered, or evacuees safely sheltered.
- Rejected: If duplicate, invalid, or outside district jurisdictional bounds (with coordinator rationale documented).
Civilians can track their request's exact stage and audit timestamps directly on the Civilian Portal.

4. HOW USERS ATTACH INCIDENT PHOTOS:
- Users can attach incident photographs during initial reporting or assistance request submission.
- Supported formats: JPG, PNG, WebP up to 5MB.
- Photos are previewed client-side and safely stored with the incident record.
- Security Policy: Sensitive private metadata is stripped, and photos are displayed within the Incident Detail review modal for coordinator damage assessment and responder briefings.

5. HOW COORDINATORS REVIEW AND ALLOCATE RESOURCES:
- The Allocation Engine uses a multi-factor recommendation heuristic to assist coordinators:
  a. Haversine Geographic Distance: Calculates straight-line distance in kilometers from the resource depot base to the incident coordinates in Ballari.
  b. Incident-to-Resource Suitability Score: Matches incident type (e.g., Flood/Waterlogging -> SDRF Swift Water Rescue Platoons & High-Flow Dewatering Pumps; Fire -> Fire Tenders & Burn Trauma Kits; Road Collisions -> ALS Ambulances & Hydraulic Cutters).
  c. Reserve Threshold Enforcement: Automatically protects a minimum percentage of inventory (default 15%) at base depots to prevent total regional exhaustion.
  d. Strategy Weighting: Coordinators can toggle between "Balanced" (40% suitability, 35% distance, 25% availability), "Fastest Response" (55% distance), or "Maximum Capacity" (50% volume).
- Human-in-the-Loop Approval: The allocation engine recommends optimal pairings with transparent rationales; an authorized coordinator must explicitly review and confirm the dispatch before depot quantities are locked and incident status advances to "Assigned".

6. HOW RESPONDERS UPDATE ASSIGNED MISSIONS:
- Responders view missions specifically assigned to their unit via the platform.
- They update real-time progress (e.g., En Route, On Scene, Rescue Conducted, Stood Down).
- When a mission concludes, responders report outcomes, and coordinators release units back to "Ready" status at their home depot.

7. HOW USERS FIND PUBLIC SHELTER INFORMATION:
- The "Relief Shelters" page lists all designated disaster evacuation shelters in Ballari (e.g., Ballari Town Hall Relief Center, Siruguppa Road Indoor Sports Complex, Brucepet Government High School, Cowl Bazaar St. John Community Hall).
- Real-time Capacity Tracking: Displays total capacity, occupied beds, vacant slots, and occupancy percentage.
- Facility Filters: Identifies shelters with clean potable water, community kitchens, medical posts, child-friendly spaces, and backup power generators.
- Ward Directions & Contacts: Provides shelter warden contact numbers and one-click viewing on the Emergency Map.

8. GENERAL EMERGENCY PREPAREDNESS & HELPLINES (BALLARI):
- Immediate Life Danger: DIAL NATIONAL EMERGENCY 112 IMMEDIATELY.
- Medical Emergency (Ambulance): 108 (GVK EMRI).
- Fire & Rescue Services: 101.
- Ballari District Disaster Control Room (DDMA): 08392-277100 / 1077 (Toll Free).
- VIMS Hospital Casualty (Level-1 Trauma): 08392-235201.
- Flood / Waterlogging Preparedness: If living along the Tungabhadra High Level Canal or low-lying wards (Millerpet, Cowl Bazaar), monitor DDMA advisories, move to high ground or designated shelters if canal surge exceeds danger marks, and disconnect ground-level electrical mains.
`;

/**
 * Fallback domain knowledge engine trained on ResQFlow operational standards
 */
export function getDomainResponse(prompt: string): string {
  const q = prompt.toLowerCase();
  const incidents = StorageService.getIncidents();
  const resources = StorageService.getResources();
  const shelters = StorageService.getShelters();
  const requests = StorageService.getCivilianRequests();

  // 1. Life danger & Helplines
  if (
    q.includes('112') ||
    q.includes('immediate') ||
    q.includes('danger') ||
    q.includes('helpline') ||
    q.includes('emergency contact') ||
    q.includes('police') ||
    q.includes('fire')
  ) {
    return `🚨 **Immediate Danger Notice**:
If life or property is in imminent danger, please call **India's National Emergency Helpline: 112** immediately!

**Essential Ballari Helplines:**
• **National All-in-One Emergency**: 112
• **Ambulance Services**: 108 (EMRI)
• **Fire & Rescue Services**: 101
• **Ballari DDMA Disaster Control Room**: 08392-277100 or 1077
• **VIMS Hospital Trauma & Casualty**: 08392-235201

*Note: ResQFlow provides coordination and tracking for district administration. For live physical rescue, always dial 112.*`;
  }

  // 2. How civilians submit reports and resource requests
  if (
    q.includes('how do civilian') ||
    q.includes('submit') ||
    q.includes('request assistance') ||
    q.includes('file report') ||
    q.includes('report incident') ||
    (q.includes('how') && q.includes('request'))
  ) {
    return `📋 **How Civilians Submit Reports & Requests in ResQFlow**:

1. **Reporting an Incident**:
   • Click **Report Incident** in the top navigation bar or go to the **Public Transparency Feed & Reporting** page.
   • Provide the emergency headline, incident category (Flood, Fire, Collapse, Accident, etc.), and location landmark in Ballari.
   • Select the severity (Critical, High, Medium, Low) and provide situational details.
   • Attach an optional photo for field assessment.
   • Submissions are instantly routed to the Ballari DDMA triage desk.

2. **Requesting Humanitarian Aid (Civilian Portal)**:
   • Open the **Civilian Assistance Hub** tab from the sidebar.
   • Click **Request Assistance**.
   • Select your need: Medical Aid, Food & Ration, Potable Water, Evacuation, or Emergency Shelter.
   • Specify the number of affected family/community members and any urgent medical requirements.
   • Once submitted, you receive a unique tracking ID (e.g., REQ-2026-xxx) to monitor progress in real time.`;
  }

  // 3. Request statuses
  if (
    q.includes('status') && (q.includes('request') || q.includes('work') || q.includes('stage') || q.includes('lifecycle'))
  ) {
    return `🔄 **How Request Statuses Work in ResQFlow**:

Every civilian assistance request transitions through an audited lifecycle:
1. **Pending Review**: Request logged in the control room and waiting for coordinator verification.
2. **Approved**: DDMA coordinator validated the request and confirmed that aid will be dispatched.
3. **In Progress**: A designated response unit (e.g., SDRF squad, water tanker, or ambulance) has been deployed to your location.
4. **Completed**: Aid delivered, evacuees sheltered, or medical transfer executed successfully.
5. **Rejected**: If determined to be duplicate, out of district jurisdiction, or canceled (reason recorded in audit log).

You can inspect the full chronological timeline of your request anytime on the **Civilian Assistance Hub**.`;
  }

  // 4. Photo uploads
  if (
    q.includes('photo') ||
    q.includes('image') ||
    q.includes('attach') ||
    q.includes('upload') ||
    q.includes('picture')
  ) {
    return `📷 **Incident Photo Attachments & Security Policies**:

• **Where to Attach**: You can attach photos during incident reporting or when submitting a civilian assistance request.
• **Supported Types**: JPG, PNG, and WebP images up to 5MB.
• **Security & Privacy Policy**:
  - Image files are sanitized client-side. Sensitive EXIF/GPS device metadata is safely handled.
  - Photos are accessible to authorized coordinators and assigned field squads for damage assessment and operational briefing.
  - Private citizen contact numbers and personal identifiers are scrubbed from public transparency feeds.
  - Coordinators can click any incident to view the full resolution photo evidence in the **Incident Details** modal.`;
  }

  // 5. Coordinator review and allocation
  if (
    q.includes('coordinator') ||
    q.includes('allocate') ||
    q.includes('allocation') ||
    q.includes('algorithm') ||
    q.includes('heuristic')
  ) {
    return `⚙️ **How Coordinators Review & Allocate Resources**:

ResQFlow uses a transparent multi-factor heuristic engine rather than a mysterious black box:
1. **Haversine Distance**: Calculates exact straight-line kilometers between the incident coordinates in Ballari and available depot bases.
2. **Domain Suitability Score**: Evaluates how well the resource matches the hazard (e.g., inflatable boats & de-watering pumps for floods; ALS ambulances for road trauma).
3. **Safety Reserve Threshold**: Automatically reserves a portion of stock (default 15%) at depot bases to prevent regional stockouts.
4. **Coordinated Human Approval**: The engine produces ranked recommendations with clear rationales. An authorized coordinator must review and approve the allocation before depot units are marked "Deployed".

Civilians cannot deploy or lock resources; only authorized Coordinators and Administrators have allocation permissions.`;
  }

  // 6. Responders updating assigned missions
  if (
    q.includes('responder') ||
    q.includes('mission') ||
    q.includes('field unit') ||
    q.includes('duty')
  ) {
    return `🚒 **How Responders Manage Assigned Missions**:

1. **Authorized Mission Queue**: Responders log in to view their unit's dispatched tasks (e.g., SDRF Platoon, 108 Ambulance Unit, Fire Tender).
2. **Status Updates**: Responders can mark tasks as *In Progress*, report on-scene developments, and log victim extractions.
3. **Mission Completion**: Once the objective is completed, responders update the status to *Completed*.
4. **Unit Stand-Down**: Coordinators can release units back to home depots, returning their status to *Ready* for subsequent dispatches.`;
  }

  // 7. Shelters and capacities
  if (
    q.includes('shelter') ||
    q.includes('relief camp') ||
    q.includes('stay') ||
    q.includes('bed') ||
    q.includes('evacuat')
  ) {
    const activeShelters = shelters.filter((s) => s.status !== 'Inactive');
    const totalCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
    const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
    const availableBeds = totalCapacity - totalOccupancy;

    const list = activeShelters
      .map(
        (s) =>
          `• **${s.name}** (${s.area}): ${s.currentOccupancy}/${s.totalCapacity} beds filled (${s.totalCapacity - s.currentOccupancy} available). Facilities: ${s.facilities.foodKitchen ? 'Kitchen, ' : ''}${s.facilities.cleanWater ? 'Water, ' : ''}${s.facilities.medicalPost ? 'Medical' : ''}`
      )
      .join('\n');

    return `🏛️ **Ballari Relief Shelters & Availability**:

Currently **${activeShelters.length}** designated relief shelters are active across Ballari district:
• **Total Bed Capacity**: ${totalCapacity}
• **Current Occupancy**: ${totalOccupancy}
• **Vacant Available Beds**: **${availableBeds}**

${list}

To view shelter locations on the tactical map or filter by facilities (medical posts, community kitchens, clean water), open the **Relief Shelters** tab.`;
  }

  // 8. General overview of ResQFlow
  if (
    q.includes('what is resqflow') ||
    q.includes('how resqflow works') ||
    q.includes('about') ||
    q.includes('overview')
  ) {
    return `🛡️ **Welcome to ResQFlow — Ballari Emergency Coordination**:

ResQFlow is an emergency resource allocation and disaster management platform for Ballari, Karnataka. It delivers:
• **Situational Command Dashboard**: Incident triage, live meteorological risk indices, and inventory utilization.
• **Civilian Assistance Hub**: Citizen reporting, humanitarian aid requests, and transparent status tracking.
• **Smart Allocation Engine**: Distance- and suitability-based recommendation heuristic with coordinator sign-off.
• **Tactical Emergency Map**: Interactive GIS mapping of incidents, fleets, hospitals, and relief shelters.
• **Four-Tier Role-Based Security**: Civilian, Responder, Coordinator, and Administrator access levels.

*Ask me about any specific feature or emergency procedure!*`;
  }

  // Default helpful response
  return `Hello! I am **ResQAI**, your emergency coordination assistant for Ballari, Karnataka.

I can guide you on:
• **Civilian Reporting & Requests**: How to file reports, request food/water/medical aid, and attach photos.
• **Tracking Status**: How request lifecycles (Pending -> Approved -> In Progress -> Completed) work.
• **Resource Allocation**: How the multi-factor heuristic pairs emergency fleets with incidents.
• **Shelters & Hospitals**: Available bed capacities, facilities, and contact details in Ballari.
• **Emergency Procedures**: Safety protocols and direct connection to India's **112** helpline.

*What would you like assistance with today?*`;
}

/**
 * Multi-turn Gemini AI Chatbot Handler with Conversation History
 */
export async function queryResQAI(
  prompt: string,
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are ResQAI, the official emergency coordination and public guidance assistant embedded in ResQFlow, designed for Ballari District, Karnataka, India.

CRITICAL OPERATIONAL & SECURITY DIRECTIVES:
1. IMMEDIATE DANGER: If a user mentions imminent physical danger, trapped people, or acute life threat, ALWAYS begin by advising them to dial India's National Emergency Number 112 immediately.
2. AUTHORITY BOUNDARIES: You are an informational and navigational assistant. You CANNOT directly dispatch ambulances, approve aid requests, change database records, or modify incident statuses. Inform the user that authorized Ballari DDMA coordinators review and approve requests via the dashboard.
3. DATA PRIVACY: NEVER disclose private phone numbers, civilian identities, or unverified sensitive logs.
4. ACCURACY & ZERO HALLUCINATION: Do NOT invent fake casualties, fake vehicle deployments, or fictional incidents. Ground all explanations in ResQFlow's actual features (Civilian Assistance Hub, Allocation Engine, Tactical Map, Relief Shelters, 112 Helpline).
5. TONE: Calm, reassuring, professional, crisp, and well-structured using markdown bullet points.

GROUNDING KNOWLEDGE BASE:
${RESQFLOW_KNOWLEDGE_DOCUMENT}`;

      // Build multi-turn contents from chat history
      const formattedContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

      // Include recent conversation turns (up to 6)
      const recentTurns = history.slice(-6);
      for (const turn of recentTurns) {
        if (turn.sender === 'user') {
          formattedContents.push({
            role: 'user',
            parts: [{ text: turn.text }]
          });
        } else if (turn.sender === 'assistant' && turn.id !== 'welcome') {
          formattedContents.push({
            role: 'model',
            parts: [{ text: turn.text }]
          });
        }
      }

      // Append current user prompt
      formattedContents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      // Use gemini-3.8-flash as per instructions
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          temperature: 0.3,
          maxOutputTokens: 800
        }
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, utilizing trained local knowledge engine:', err);
    }
  }

  // Graceful rule-based domain engine trained on Ballari emergency standards
  return getDomainResponse(prompt);
}
