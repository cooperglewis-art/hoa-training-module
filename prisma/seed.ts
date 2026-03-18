import { PrismaClient, OrgType, MemberRole, AuditAction } from "@prisma/client";
import { hashSync } from "bcryptjs";

const db = new PrismaClient();

const PASSWORD_HASH = hashSync("password123", 10);
const NOW = new Date();

async function main() {
  console.log("Clearing existing data...");
  await db.auditLog.deleteMany();
  await db.certificate.deleteMany();
  await db.assessmentAttempt.deleteMany();
  await db.courseCompletion.deleteMany();
  await db.moduleProgress.deleteMany();
  await db.answerOption.deleteMany();
  await db.question.deleteMany();
  await db.legalAuthorityReference.deleteMany();
  await db.lessonContentVersion.deleteMany();
  await db.lesson.deleteMany();
  await db.module.deleteMany();
  await db.course.deleteMany();
  await db.membership.deleteMany();
  await db.inviteToken.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.emailLog.deleteMany();
  await db.organization.deleteMany();
  await db.user.deleteMany();

  // ─── 1. Users ────────────────────────────────────────────────────────
  console.log("Creating users...");

  const superAdmin = await db.user.create({
    data: {
      email: "admin@example.com",
      name: "System Admin",
      passwordHash: PASSWORD_HASH,
      emailVerified: NOW,
      disclaimerAcknowledgedAt: NOW,
    },
  });

  const orgAdmin1 = await db.user.create({
    data: {
      email: "orgadmin@sunsetridge.com",
      name: "Sarah Mitchell",
      passwordHash: PASSWORD_HASH,
      emailVerified: NOW,
      disclaimerAcknowledgedAt: NOW,
    },
  });

  const orgAdmin2 = await db.user.create({
    data: {
      email: "orgadmin@lakewood.com",
      name: "David Chen",
      passwordHash: PASSWORD_HASH,
      emailVerified: NOW,
      disclaimerAcknowledgedAt: NOW,
    },
  });

  const learner1 = await db.user.create({
    data: {
      email: "learner1@example.com",
      name: "Emily Rodriguez",
      passwordHash: PASSWORD_HASH,
      emailVerified: NOW,
      disclaimerAcknowledgedAt: NOW,
    },
  });

  const learner2 = await db.user.create({
    data: {
      email: "learner2@example.com",
      name: "James Wilson",
      passwordHash: PASSWORD_HASH,
      emailVerified: NOW,
      disclaimerAcknowledgedAt: NOW,
    },
  });

  const learner3 = await db.user.create({
    data: {
      email: "learner3@example.com",
      name: "Maria Garcia",
      passwordHash: PASSWORD_HASH,
      emailVerified: NOW,
      disclaimerAcknowledgedAt: null,
    },
  });

  // ─── 2. Organizations ────────────────────────────────────────────────
  console.log("Creating organizations...");

  const sunsetRidge = await db.organization.create({
    data: {
      name: "Sunset Ridge HOA",
      slug: "sunset-ridge",
      type: OrgType.HOA,
      contactName: "Sarah Mitchell",
      contactEmail: "orgadmin@sunsetridge.com",
      contactPhone: "(512) 555-0101",
      primaryColor: "#1E40AF",
      secondaryColor: "#DBEAFE",
    },
  });

  const lakewood = await db.organization.create({
    data: {
      name: "Lakewood Condominiums",
      slug: "lakewood-condos",
      type: OrgType.COA,
      contactName: "David Chen",
      contactEmail: "orgadmin@lakewood.com",
      contactPhone: "(214) 555-0202",
      primaryColor: "#065F46",
      secondaryColor: "#D1FAE5",
    },
  });

  // ─── 3. Memberships ─────────────────────────────────────────────────
  console.log("Creating memberships...");

  await db.membership.createMany({
    data: [
      { userId: superAdmin.id, orgId: sunsetRidge.id, role: MemberRole.SUPER_ADMIN },
      { userId: superAdmin.id, orgId: lakewood.id, role: MemberRole.SUPER_ADMIN },
      { userId: orgAdmin1.id, orgId: sunsetRidge.id, role: MemberRole.ORG_ADMIN },
      { userId: orgAdmin2.id, orgId: lakewood.id, role: MemberRole.ORG_ADMIN },
      { userId: learner1.id, orgId: sunsetRidge.id, role: MemberRole.LEARNER },
      { userId: learner2.id, orgId: sunsetRidge.id, role: MemberRole.LEARNER },
      { userId: learner3.id, orgId: lakewood.id, role: MemberRole.LEARNER },
    ],
  });

  // ─── 4. Course ───────────────────────────────────────────────────────
  console.log("Creating course...");

  const course = await db.course.create({
    data: {
      title: "CCR Enforcement Training",
      description:
        "A comprehensive training program for HOA and COA board members and managers covering CC&R enforcement under Texas law. This course covers governing document hierarchy, the enforcement process, pre-litigation strategies, and alternative dispute resolution — with specific references to Texas Property Code Chapters 82, 202, and 209.",
    },
  });

  // ─── 5. Modules ──────────────────────────────────────────────────────
  console.log("Creating modules...");

  const module1 = await db.module.create({
    data: {
      title: "Understanding Governing Documents",
      description:
        "Learn the hierarchy of governing documents and how CC&Rs, bylaws, and rules interact with Texas state law.",
      sortOrder: 1,
      courseId: course.id,
    },
  });

  const module2 = await db.module.create({
    data: {
      title: "The Enforcement Process",
      description:
        "Master the step-by-step enforcement process from identifying violations through hearings and fines.",
      sortOrder: 2,
      courseId: course.id,
    },
  });

  const module3 = await db.module.create({
    data: {
      title: "Pre-Lawsuit, Counsel & Alternatives",
      description:
        "Understand evidence collection, escalation decisions, ADR options, and working with legal counsel.",
      sortOrder: 3,
      courseId: course.id,
    },
  });

  // ─── 6. Lessons ──────────────────────────────────────────────────────
  console.log("Creating lessons...");

  // Module 1 Lessons
  const m1Lessons = await Promise.all([
    db.lesson.create({
      data: {
        title: "The Document Hierarchy",
        slug: "document-hierarchy",
        sortOrder: 1,
        moduleId: module1.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "CC&Rs, Bylaws, and Rules",
        slug: "ccrs-bylaws-rules",
        sortOrder: 2,
        moduleId: module1.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Texas Property Code Basics",
        slug: "texas-property-code",
        sortOrder: 3,
        moduleId: module1.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "When Violations Occur",
        slug: "when-violations-occur",
        sortOrder: 4,
        moduleId: module1.id,
      },
    }),
  ]);

  // Module 2 Lessons
  const m2Lessons = await Promise.all([
    db.lesson.create({
      data: {
        title: "Identifying and Documenting Violations",
        slug: "identifying-violations",
        sortOrder: 1,
        moduleId: module2.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "The Notice Process",
        slug: "notice-process",
        sortOrder: 2,
        moduleId: module2.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Hearings and Due Process",
        slug: "hearings-due-process",
        sortOrder: 3,
        moduleId: module2.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Fines and Enforcement Actions",
        slug: "fines-enforcement",
        sortOrder: 4,
        moduleId: module2.id,
      },
    }),
  ]);

  // Module 3 Lessons
  const m3Lessons = await Promise.all([
    db.lesson.create({
      data: {
        title: "Evidence Collection and Preservation",
        slug: "evidence-collection",
        sortOrder: 1,
        moduleId: module3.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Deciding When to Escalate",
        slug: "deciding-escalation",
        sortOrder: 2,
        moduleId: module3.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Alternative Dispute Resolution",
        slug: "alternative-dispute-resolution",
        sortOrder: 3,
        moduleId: module3.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Working with Legal Counsel",
        slug: "working-with-counsel",
        sortOrder: 4,
        moduleId: module3.id,
      },
    }),
  ]);

  // ─── 7. Lesson Content Versions ─────────────────────────────────────
  console.log("Creating lesson content for Module 1...");

  // ── Module 1, Lesson 1: The Document Hierarchy ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[0].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "The Document Hierarchy",
        },
        {
          type: "prose",
          text: "Every homeowners association and condominium owners association in Texas operates under a layered set of governing documents. Understanding the hierarchy of these documents is the single most important foundational concept for anyone responsible for enforcing community standards. When two provisions conflict, the document that occupies a higher position in the hierarchy will generally control.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Why the Hierarchy Matters",
          text: "Board members who misapply a rule that conflicts with the CC&Rs — or who enforce a CC&R provision that conflicts with state law — expose the association to legal liability and risk having enforcement actions overturned in court.",
        },
        {
          type: "prose",
          text: "The hierarchy of authority for a Texas property owners association, from highest to lowest, is as follows: (1) Federal and state constitutions; (2) Federal statutes and regulations; (3) Texas statutes, including the Texas Property Code; (4) The subdivision plat and any recorded restrictive covenants (the Declaration of Covenants, Conditions, and Restrictions — commonly called CC&Rs); (5) The articles of incorporation; (6) The bylaws; (7) Rules and regulations adopted by the board of directors. Each layer must be consistent with the layers above it. A board-adopted rule that contradicts a provision in the recorded CC&Rs is unenforceable.",
        },
        {
          type: "comparison-table",
          title: "Document Hierarchy at a Glance",
          headers: ["Level", "Document", "Who Creates It", "How It's Changed"],
          rows: [
            ["1 (Highest)", "Federal & State Law", "Legislatures / Courts", "Legislative process"],
            ["2", "Texas Property Code (Ch. 202, 209, 82)", "Texas Legislature", "Legislative amendment"],
            ["3", "Declaration (CC&Rs)", "Developer (initially)", "Membership vote per amendment clause"],
            ["4", "Articles of Incorporation", "Developer / Board", "Board and/or membership vote"],
            ["5", "Bylaws", "Developer / Board", "Usually membership vote"],
            ["6 (Lowest)", "Rules & Regulations", "Board of Directors", "Board vote"],
          ],
        },
        {
          type: "prose",
          text: "The Declaration of Covenants, Conditions, and Restrictions is the foundational private-law document for the community. It is recorded in the county real property records and runs with the land, meaning it binds all current and future owners. The CC&Rs typically establish use restrictions, architectural standards, assessment obligations, and the association's enforcement powers. Because the CC&Rs are recorded and bind all lots, they occupy a higher position than the bylaws or board-adopted rules.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 202.001",
          title: "Applicability — Restrictive Covenants",
          text: "Chapter 202 of the Texas Property Code defines a 'restrictive covenant' as any covenant, condition, or restriction contained in a dedicatory instrument that limits or restricts the use of property. This chapter applies broadly to all residential restrictive covenants in Texas, whether the property is within a subdivision governed by a property owners association or not.",
          appliesTo: ["HOA", "POA", "COA"],
        },
        {
          type: "scenario",
          title: "Hierarchy Conflict: Board Rule vs. CC&Rs",
          text: "Oakwood Estates HOA's CC&Rs state that homeowners may keep 'common household pets.' The board passes a rule prohibiting all dogs over 30 pounds. A homeowner challenges the rule, arguing that a 50-pound Labrador is a 'common household pet.' Because the CC&Rs use a broad, permissive term and the board rule imposes a restriction not supported by the CC&Rs, a court would likely find the board rule unenforceable to the extent it conflicts with the CC&Rs. The board could, however, adopt reasonable rules regarding pet behavior (leash requirements, waste cleanup) that supplement — rather than contradict — the CC&Rs.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Common Mistake",
          text: "Boards sometimes adopt rules that effectively amend the CC&Rs without going through the formal amendment process. Courts in Texas have struck down board-adopted rules that materially alter rights established in the CC&Rs. If a change requires amending the Declaration, the board must follow the amendment procedure specified in the Declaration itself.",
        },
        {
          type: "knowledge-check",
          question: "A board adopts a rule banning all short-term rentals, but the CC&Rs are silent on rental restrictions. Which statement is most accurate?",
          options: [
            "The board rule is automatically valid because the board has general rulemaking authority.",
            "The board rule may be challengeable because a total rental ban could be seen as an amendment to the CC&Rs that requires a membership vote.",
            "The CC&Rs must specifically authorize the board to adopt such a rule for it to be enforceable.",
            "Texas law prohibits all short-term rental restrictions.",
          ],
          correctIndex: 1,
          explanation: "Texas courts have generally held that a total prohibition on a previously permitted use may constitute an improper amendment of the CC&Rs. While boards have broad rulemaking power, rules that fundamentally alter an owner's property rights typically require a formal CC&R amendment approved by the membership.",
        },
        {
          type: "accordion",
          title: "Frequently Asked Questions",
          items: [
            {
              heading: "What if the CC&Rs are ambiguous?",
              body: "Texas courts generally construe ambiguous restrictive covenants in favor of the free use of property. This means if a CC&R provision can reasonably be read two ways, the interpretation that imposes fewer restrictions on the homeowner typically prevails. See Pilarcik v. Emmons, 966 S.W.2d 474 (Tex. 1998).",
            },
            {
              heading: "Can the board enforce expired CC&Rs?",
              body: "Under Texas Property Code § 202.003, property owners can petition to extend restrictive covenants before they expire. Once CC&Rs have expired, the association generally cannot enforce them. Some CC&Rs contain automatic renewal provisions that extend the covenants for successive periods unless a supermajority votes to terminate them.",
            },
            {
              heading: "Do CC&Rs bind tenants?",
              body: "Yes. Because CC&Rs run with the land, they bind any person who occupies the property, including tenants. However, the association's enforcement mechanism is typically directed at the property owner, who is responsible for ensuring tenant compliance.",
            },
          ],
        },
        {
          type: "prose",
          text: "As you proceed through this course, keep the document hierarchy firmly in mind. Every enforcement decision you make should begin with the question: 'What does the governing document at the appropriate level of the hierarchy actually say?' If you cannot point to a specific provision in the CC&Rs or a validly adopted rule, you do not have a basis for enforcement.",
        },
      ],
    },
  });

  // ── Module 1, Lesson 2: CC&Rs, Bylaws, and Rules ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[1].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "CC&Rs, Bylaws, and Rules",
        },
        {
          type: "prose",
          text: "In this lesson, we take a closer look at the three core governing documents that every board member and community manager must understand: the Declaration of Covenants, Conditions, and Restrictions (CC&Rs), the Bylaws, and the Rules and Regulations. Each serves a distinct purpose, and confusing their roles is one of the most common mistakes in community association governance.",
        },
        {
          type: "heading",
          level: 2,
          text: "The Declaration of CC&Rs",
        },
        {
          type: "prose",
          text: "The Declaration is the master document. It is recorded in the county deed records and creates the community association, defines the common areas, establishes use restrictions, grants the association its enforcement powers, sets out the assessment structure, and prescribes the amendment process. Because it is a recorded covenant that runs with the land, every subsequent purchaser takes title subject to its terms. The Declaration typically includes provisions covering: use restrictions (residential use only, no commercial activity, architectural standards), assessment obligations (regular and special assessments), maintenance responsibilities (owner vs. association), enforcement mechanisms (fines, liens, legal action), and the amendment procedure.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Recording Requirement",
          text: "For CC&Rs to be enforceable against subsequent purchasers, they must be recorded in the real property records of the county where the property is located. Unrecorded restrictions generally bind only the original parties to the agreement.",
        },
        {
          type: "heading",
          level: 2,
          text: "Bylaws",
        },
        {
          type: "prose",
          text: "The Bylaws govern the internal operations of the association as a corporate entity. They typically address: the structure and powers of the board of directors, election procedures and terms of office, meeting requirements (notice, quorum, voting), officer positions and duties, committee structure, fiscal year and budgeting procedures, and procedures for filling board vacancies. Importantly, the Bylaws do not usually contain use restrictions or architectural standards — those belong in the CC&Rs. The Bylaws tell the association how to govern itself; the CC&Rs tell owners how to use their property.",
        },
        {
          type: "heading",
          level: 2,
          text: "Rules and Regulations",
        },
        {
          type: "prose",
          text: "Rules and Regulations are adopted by the board to implement and supplement the CC&Rs. They must be consistent with, and authorized by, the CC&Rs and Bylaws. Rules typically address day-to-day operational matters such as pool hours, parking regulations, common area usage policies, and procedures for architectural review submissions. A key principle: rules may clarify and implement CC&R provisions but may not create new substantive restrictions beyond what the CC&Rs authorize.",
        },
        {
          type: "comparison-table",
          title: "CC&Rs vs. Bylaws vs. Rules",
          headers: ["Feature", "CC&Rs (Declaration)", "Bylaws", "Rules & Regulations"],
          rows: [
            ["Purpose", "Property use restrictions & association powers", "Internal corporate governance", "Day-to-day operational details"],
            ["Recorded?", "Yes — county deed records", "Sometimes", "No"],
            ["Binds owners?", "Yes — runs with the land", "Yes — as members of the association", "Yes — if validly adopted"],
            ["Amendment", "Membership vote (often 67%)", "Membership vote (varies)", "Board vote"],
            ["Typical contents", "Use restrictions, assessments, enforcement powers", "Board structure, elections, meetings", "Pool hours, parking rules, procedures"],
          ],
        },
        {
          type: "scenario",
          title: "Rules Gone Wrong",
          text: "Pine Creek HOA's CC&Rs grant owners the right to install 'satellite dishes not exceeding one meter in diameter,' consistent with federal FCC regulations. The board adopts a rule requiring prior architectural approval and a $200 application fee for any satellite dish installation. A homeowner installs a dish without applying. The board attempts enforcement. Problem: the FCC's Over-the-Air Reception Devices (OTARD) rule preempts HOA restrictions that unreasonably delay or increase the cost of installing compliant satellite dishes. The $200 fee and prior-approval requirement likely violate federal law, which sits above the CC&Rs in the document hierarchy. The board's rule is unenforceable.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 202.004(a)",
          title: "Enforcement of Restrictive Covenants",
          text: "A property owners association or other representative designated by an owner may initiate, defend, or intervene in litigation or an administrative proceeding affecting the enforcement of a restrictive covenant. This section provides the statutory basis for an association's standing to enforce its CC&Rs in Texas courts.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "knowledge-check",
          question: "Which of the following is most appropriately addressed in the Bylaws rather than the CC&Rs?",
          options: [
            "A prohibition on commercial vehicle parking in driveways.",
            "The procedure for electing members to the board of directors.",
            "A requirement that all exterior paint colors be approved by the architectural committee.",
            "The association's authority to levy fines for covenant violations.",
          ],
          correctIndex: 1,
          explanation: "Board election procedures are a matter of internal corporate governance, which is the domain of the Bylaws. Use restrictions (parking, paint colors) and enforcement powers (fines) are properly addressed in the CC&Rs.",
        },
        {
          type: "drag-drop-match",
          title: "Match the Provision to the Document",
          instruction: "Drag each provision to the governing document where it most properly belongs.",
          pairs: [
            { item: "No lot shall be used for other than single-family residential purposes", match: "CC&Rs (Declaration)" },
            { item: "The board shall consist of five directors elected for two-year terms", match: "Bylaws" },
            { item: "The community pool is open from 8:00 AM to 10:00 PM daily", match: "Rules & Regulations" },
            { item: "Each lot owner shall pay annual assessments as determined by the board", match: "CC&Rs (Declaration)" },
            { item: "A quorum for a board meeting requires a majority of directors", match: "Bylaws" },
            { item: "Guest parking is limited to 48 hours without prior board approval", match: "Rules & Regulations" },
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Practical Tip",
          text: "Before enforcing any restriction, always trace it back to the specific provision in the CC&Rs that authorizes it. If the restriction exists only in a board-adopted rule, verify that the CC&Rs grant the board authority to adopt rules on that subject. Document this analysis — it will be invaluable if the enforcement action is challenged.",
        },
        {
          type: "prose",
          text: "Understanding the distinct roles and limitations of each governing document is essential for effective and legally defensible enforcement. In the next lesson, we will examine how Texas state law — specifically the Texas Property Code — overlays and constrains these private governing documents.",
        },
      ],
    },
  });

  // ── Module 1, Lesson 3: Texas Property Code Basics ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[2].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Texas Property Code Basics",
        },
        {
          type: "prose",
          text: "Texas has enacted several statutory frameworks that directly govern property owners associations and condominium owners associations. Three chapters of the Texas Property Code are especially critical: Chapter 202 (restrictive covenants generally), Chapter 209 (the Texas Residential Property Owners Protection Act, applicable to HOAs and POAs), and Chapter 82 (the Uniform Condominium Act, applicable to COAs). Every board member and manager must understand how these statutes interact with the association's governing documents.",
        },
        {
          type: "heading",
          level: 2,
          text: "Chapter 202: Restrictive Covenants",
        },
        {
          type: "prose",
          text: "Chapter 202 applies broadly to all residential restrictive covenants in Texas. It defines key terms, establishes the enforceability of restrictive covenants, and addresses specific issues such as flag display rights, solar energy devices, rain harvesting, drought-resistant landscaping, and religious displays. Chapter 202 sets the baseline rules that apply to all communities with recorded restrictive covenants, whether or not they have a formal property owners association.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 202.010",
          title: "Flag Display",
          text: "A property owners association may not prohibit a property owner from displaying the United States flag, the Texas state flag, or an official branch of the U.S. military flag on the owner's property. The flag must be displayed in a manner consistent with 4 U.S.C. §§ 5-10 and must not be larger than 4 feet by 6 feet. This is a common source of disputes — boards must know that flag display rights are protected by statute regardless of what the CC&Rs say.",
          appliesTo: ["HOA", "POA", "COA"],
        },
        {
          type: "heading",
          level: 2,
          text: "Chapter 209: Texas Residential Property Owners Protection Act",
        },
        {
          type: "prose",
          text: "Chapter 209 is the most consequential statute for HOA and POA governance in Texas. It imposes mandatory procedural requirements on property owners associations, including: requirements for open board meetings, owner access to association records, mandatory notice and hearing before fines can be assessed, limitations on foreclosure for assessment liens, restrictions on the suspension of owner rights, and requirements for alternative dispute resolution before certain legal actions. Compliance with Chapter 209 is not optional. An association that fails to follow the procedures mandated by Chapter 209 risks having its enforcement actions invalidated by a court.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.006",
          title: "Owner Access to Records",
          text: "A property owners association must make its books and records available to an owner or the owner's authorized agent within 10 business days after a written request. This includes financial records, meeting minutes, and governing documents. Failure to comply can result in a penalty of $500 per day, up to $10,000, recoverable by the owner in a court proceeding.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.007",
          title: "Notice Required Before Fine or Suspension",
          text: "Before a property owners association may suspend an owner's rights, charge a fine, or file a suit against an owner (other than for unpaid assessments), the association must provide written notice describing the violation, give the owner at least 30 days to cure the violation, and if the violation is not cured, provide an opportunity to be heard at a board meeting before a fine is levied or rights are suspended. The notice must be sent by certified mail.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "heading",
          level: 2,
          text: "Chapter 82: Uniform Condominium Act",
        },
        {
          type: "prose",
          text: "Chapter 82 governs condominium associations (COAs) in Texas. While it shares some principles with Chapter 209, there are important differences. Chapter 82 addresses the creation and organization of condominium regimes, the condominium declaration and bylaws, unit boundaries and common elements, assessment and lien provisions, insurance requirements, and the powers and duties of the unit owners association. COA boards must pay particular attention to the provisions regarding common elements, as enforcement disputes in condominiums frequently involve the boundary between unit owner responsibility and association responsibility for maintenance and repair.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 82.102",
          title: "Creation of Condominium",
          text: "A condominium is created by recording a declaration in the county deed records. The declaration must describe the land, identify the units and common elements, allocate ownership interests, and establish the unit owners association. This section establishes the foundational requirements for every condominium regime in Texas.",
          appliesTo: ["COA"],
        },
        {
          type: "comparison-table",
          title: "Chapter 209 (HOA/POA) vs. Chapter 82 (COA)",
          headers: ["Topic", "Chapter 209 (HOA/POA)", "Chapter 82 (COA)"],
          rows: [
            ["Applies to", "Residential POAs with mandatory membership", "Condominium regimes created under Ch. 82"],
            ["Open meetings", "Required (§ 209.0051)", "Required by most declarations; Ch. 82 less prescriptive"],
            ["Notice before fine", "30-day cure + hearing required (§ 209.007)", "Governed by declaration; Ch. 82 less prescriptive"],
            ["Assessment liens", "Regulated; foreclosure restrictions (§ 209.009)", "Lien provisions in § 82.113"],
            ["Record access", "10-day response required (§ 209.006)", "Governed by declaration and nonprofit law"],
            ["ADR requirement", "Required before certain suits (§ 209.00593)", "Not specifically mandated by Ch. 82"],
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "COA Boards: Know Your Obligations",
          text: "Because Chapter 82 is less prescriptive on enforcement procedures than Chapter 209, many condominium declarations incorporate procedural protections similar to those required by Chapter 209. Always check your specific declaration — the procedures it requires may exceed the statutory minimum.",
        },
        {
          type: "knowledge-check",
          question: "Under Texas Property Code Chapter 209, what must a property owners association do BEFORE levying a fine against a homeowner for a covenant violation?",
          options: [
            "Obtain a court order authorizing the fine.",
            "Send written notice of the violation, allow at least 30 days to cure, and provide an opportunity for a hearing if the violation is not cured.",
            "Hold a vote of the full membership to approve the fine.",
            "File a lien against the property.",
          ],
          correctIndex: 1,
          explanation: "Section 209.007 requires written notice, a minimum 30-day cure period, and an opportunity for a hearing before the board before a fine can be assessed. This mandatory procedure protects homeowner due process rights.",
        },
        {
          type: "accordion",
          title: "Deep Dive: Key Statutes",
          items: [
            {
              heading: "§ 202.003 — Extension of Restrictive Covenants",
              body: "This section allows property owners to petition for the extension of restrictive covenants before they expire. The petition must be signed by owners representing at least 75% of the property covered by the restrictions. This prevents an association from losing its enforcement authority simply because the original covenant term expires.",
            },
            {
              heading: "§ 209.00505 — Management Certificates",
              body: "A POA must record a management certificate in the county records that identifies the association, its mailing address, and contact information. This certificate must be updated when information changes. It provides a public record so that owners and potential purchasers can identify and contact the association.",
            },
            {
              heading: "§ 82.113 — Lien for Assessments",
              body: "The association has a lien on each unit for any assessment levied against the unit from the time the assessment becomes due. The lien is prior to all liens except tax liens and certain first-lien deed of trust liens. The association may foreclose its lien in the manner provided for foreclosure of mortgages.",
            },
          ],
        },
        {
          type: "prose",
          text: "Understanding these three chapters gives you the statutory framework within which all CC&R enforcement in Texas must operate. In the next lesson, we will examine what happens when a violation actually occurs and how to begin the enforcement process.",
        },
      ],
    },
  });

  // ── Module 1, Lesson 4: When Violations Occur ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[3].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "When Violations Occur",
        },
        {
          type: "prose",
          text: "Covenant violations can arise in many forms — from overgrown lawns and unauthorized exterior modifications to noise complaints and prohibited commercial activities. How the association responds to the first report of a violation sets the tone for the entire enforcement process. A well-handled initial response can resolve most issues without escalation. A poorly handled one can create legal exposure and community conflict.",
        },
        {
          type: "heading",
          level: 2,
          text: "Common Categories of Violations",
        },
        {
          type: "prose",
          text: "Most covenant violations fall into several broad categories: (1) Maintenance violations — failure to maintain property in accordance with community standards, including lawn care, exterior paint, and structural upkeep. (2) Architectural violations — unauthorized modifications to the exterior of a home, including additions, fences, paint colors, and landscaping changes. (3) Use violations — using the property in a manner prohibited by the CC&Rs, such as operating a business, keeping prohibited animals, or short-term rentals. (4) Behavioral violations — conduct that disturbs the peace and enjoyment of the community, including noise, parking, and nuisance activities. (5) Assessment violations — failure to pay required assessments. This category has its own enforcement track, including lien and foreclosure rights.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Selective Enforcement Defense",
          text: "One of the most powerful defenses a homeowner can raise is selective enforcement — the argument that the association has enforced a restriction against them but not against others who have committed the same or similar violations. To protect against this defense, associations must enforce their covenants consistently and uniformly. Document every violation and every enforcement action to create a defensible record of consistent enforcement.",
        },
        {
          type: "scenario",
          title: "The Selective Enforcement Trap",
          text: "Riverwalk HOA has a CC&R provision prohibiting fences taller than 6 feet. Over the past five years, six homeowners have built 7-foot fences and the board has taken no action. A seventh homeowner builds a 7-foot fence, and the board sends a violation notice. The homeowner raises the selective enforcement defense. Because the board knowingly allowed six prior violations without action, a court may find that the board has waived its right to enforce the 6-foot limit — or at minimum, must begin enforcement against all violators simultaneously. The lesson: enforce early, enforce consistently, or risk losing the ability to enforce at all.",
        },
        {
          type: "heading",
          level: 2,
          text: "Sources of Violation Reports",
        },
        {
          type: "prose",
          text: "Violations come to the association's attention through several channels: (1) Board or committee inspections — regular community inspections, often conducted by the architectural review committee or a management company. (2) Homeowner complaints — reports filed by neighbors. These should be documented in writing. (3) Management company observations — professional managers often identify violations during routine property visits. (4) Self-reporting — occasionally, homeowners will contact the association to ask about a planned activity, allowing the board to address potential violations before they occur. Regardless of the source, the association should have a standardized intake process for recording violation reports.",
        },
        {
          type: "timeline",
          title: "Initial Response Timeline",
          events: [
            {
              label: "Day 0",
              title: "Violation Reported",
              description: "A complaint is received or a violation is observed during inspection. Log the report with date, description, and source.",
            },
            {
              label: "Days 1-3",
              title: "Preliminary Investigation",
              description: "Verify the report. Confirm that the alleged conduct actually violates a specific CC&R provision or rule. Photograph or document the condition.",
            },
            {
              label: "Days 3-7",
              title: "Board/Committee Review",
              description: "Present findings to the appropriate committee or board. Determine whether formal enforcement action is warranted.",
            },
            {
              label: "Days 7-14",
              title: "Initial Contact",
              description: "If enforcement is warranted, send an initial courtesy notice or, depending on severity, a formal violation notice per the CC&Rs and Chapter 209 requirements.",
            },
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Privacy Considerations",
          text: "When receiving complaints from neighbors, protect the identity of the complainant. The association should investigate and act on its own authority — not as an agent of the complaining neighbor. Disclosing the identity of the complainant can create neighbor-to-neighbor conflict and may discourage future reporting.",
        },
        {
          type: "knowledge-check",
          question: "An HOA board member notices a violation while driving through the neighborhood. Three other homes have the same violation. What is the best course of action?",
          options: [
            "Send a violation notice only to the home closest to the board member.",
            "Document all four violations and initiate enforcement proceedings against all of them simultaneously.",
            "Ignore the violations since the board member is personally acquainted with some of the homeowners.",
            "Wait to see if any neighbors file complaints before taking action.",
          ],
          correctIndex: 1,
          explanation: "Consistent enforcement is critical. The board should document and address all violations it discovers, regardless of personal relationships. Treating violators differently exposes the association to a selective enforcement defense.",
        },
        {
          type: "checkpoint",
          moduleIndex: 0,
          title: "Module 1 Checkpoint",
          question: "You have completed Module 1: Understanding Governing Documents. Before proceeding, confirm your understanding: If a board-adopted rule contradicts a provision in the recorded CC&Rs, which document controls?",
          options: [
            "The board-adopted rule, because it is more recent.",
            "The CC&Rs, because they occupy a higher position in the document hierarchy.",
            "Whichever document is more specific controls.",
            "Neither — the conflict must be resolved by a court.",
          ],
          correctIndex: 1,
          explanation: "The CC&Rs always take precedence over board-adopted rules in the document hierarchy. A rule that contradicts the CC&Rs is unenforceable. The board must follow the formal amendment process to change a CC&R provision.",
        },
        {
          type: "prose",
          text: "With a solid understanding of governing documents, the document hierarchy, Texas statutes, and how violations arise, you are now prepared to move into Module 2, where we will examine the enforcement process in detail — from identifying violations through formal hearings and fines.",
        },
      ],
    },
  });

  // ─── Module 2 Content ────────────────────────────────────────────────
  console.log("Creating lesson content for Module 2...");

  // ── Module 2, Lesson 1: Identifying and Documenting Violations ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[0].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Identifying and Documenting Violations",
        },
        {
          type: "prose",
          text: "Proper identification and documentation of covenant violations is the foundation of any successful enforcement action. Without clear evidence that a violation exists — and that it violates a specific provision of the governing documents — the association's enforcement efforts will fail. This lesson covers the process of identifying violations, the documentation standards that will hold up under legal scrutiny, and best practices for creating an enforcement record.",
        },
        {
          type: "heading",
          level: 2,
          text: "Step 1: Identify the Specific Provision",
        },
        {
          type: "prose",
          text: "Before documenting anything, identify exactly which CC&R provision, rule, or statutory requirement is being violated. Pull out the governing document and read the provision carefully. Ask yourself: Does the provision clearly prohibit the conduct in question? Is the provision specific enough that a reasonable person would know their conduct violates it? Has the provision been validly adopted (if it is a rule) or properly amended? Has the provision been consistently enforced in the past? If you cannot point to a specific, enforceable provision, you do not have a violation — you have a nuisance complaint, which may require a different approach.",
        },
        {
          type: "callout",
          variant: "info",
          title: "The Specificity Rule",
          text: "Texas courts construe restrictive covenants strictly. If a CC&R provision is vague or ambiguous, it will generally be interpreted in favor of the property owner's free use of their property. The more specific and clear the provision, the easier it is to enforce.",
        },
        {
          type: "heading",
          level: 2,
          text: "Step 2: Document the Violation",
        },
        {
          type: "prose",
          text: "Once you have identified the applicable provision, document the violation thoroughly. Effective documentation includes: (1) Photographs — take date-stamped photographs from multiple angles. Include context that identifies the property (house numbers, street signs). (2) Written description — record what you observed, when you observed it, and who observed it. Be factual, not conclusory. Write 'Vehicle with commercial signage parked in driveway' rather than 'Homeowner is running an illegal business.' (3) Dates and times — record the exact dates and times of each observation. For ongoing violations, document multiple instances. (4) Witness information — if other people observed the violation, record their names and contact information. (5) Prior correspondence — if there have been previous communications about the same or similar issues, compile them.",
        },
        {
          type: "comparison-table",
          title: "Good vs. Bad Documentation",
          headers: ["Element", "Poor Documentation", "Proper Documentation"],
          rows: [
            ["Description", "Yard looks terrible", "Front lawn exceeds 8 inches in height in violation of Section 5.3 of the CC&Rs requiring lawn maintenance"],
            ["Photo", "Blurry photo with no context", "Date-stamped, high-resolution photo showing house number and violation clearly"],
            ["Date", "Sometime last week", "March 12, 2026 at approximately 2:30 PM"],
            ["Observer", "Someone on the board saw it", "Observed by Board Member Jane Smith during scheduled community inspection"],
            ["Provision cited", "Against the rules", "Violation of Declaration Section 5.3(a) requiring all owners to 'maintain landscaping in a neat and attractive condition'"],
          ],
        },
        {
          type: "scenario",
          title: "Documentation Saves the Day",
          text: "Creekside POA sends a violation notice to a homeowner regarding an unpermitted storage shed in the backyard. The homeowner contests the violation, claiming the shed has been there since before they purchased the property and is 'grandfathered in.' The management company produces an inspection report from 14 months ago showing no shed on the property, along with a dated aerial photograph from the county appraisal district taken 18 months ago — also showing no shed. The homeowner's claim is disproved. Without this documentation, the association would face a difficult factual dispute.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Documentation Pitfalls",
          text: "Never trespass on private property to photograph or investigate a violation. Observations and photographs should be taken from public areas (streets, sidewalks) or common areas. If the violation is not visible from these areas, the association may need to request an inspection or rely on other evidence. Additionally, never use hidden cameras or surveillance targeting a specific homeowner — this can create serious privacy liability.",
        },
        {
          type: "heading",
          level: 2,
          text: "Step 3: Create the Violation File",
        },
        {
          type: "prose",
          text: "Every violation should have its own file (physical or digital) containing: the initial violation report, the specific CC&R provision cited, all photographs and documentation, copies of all correspondence sent to and received from the homeowner, records of any board or committee actions, notes from any hearings or meetings, and the ultimate disposition (resolved, fine assessed, escalated to counsel). This file becomes the official record of the enforcement action and will be critical if the matter escalates to litigation.",
        },
        {
          type: "knowledge-check",
          question: "A board member observes what they believe is a violation of the CC&Rs. What should be their FIRST step?",
          options: [
            "Immediately send a formal violation notice to the homeowner.",
            "Identify the specific CC&R provision that is being violated and verify that it is enforceable.",
            "Call the association's attorney for legal advice.",
            "Discuss the matter informally with the homeowner.",
          ],
          correctIndex: 1,
          explanation: "Before any enforcement action, you must first identify the specific provision being violated and confirm it is enforceable. Without a clear legal basis, enforcement efforts may be invalid and expose the association to liability.",
        },
        {
          type: "accordion",
          title: "Documentation Checklists",
          items: [
            {
              heading: "Maintenance Violation Checklist",
              body: "Record: specific address and lot number, CC&R section cited, description of the maintenance deficiency, date-stamped photographs from the public right-of-way, comparison to community standards (photos of compliant neighboring properties if helpful), date of observation, name of inspector or observer.",
            },
            {
              heading: "Architectural Violation Checklist",
              body: "Record: specific address and lot number, CC&R section cited, description of the unauthorized modification, date-stamped photographs showing the modification, copy of the approved architectural review application (if one was submitted) or notation that no application was filed, comparison to any approved plans, date of observation, name of inspector.",
            },
            {
              heading: "Use Violation Checklist",
              body: "Record: specific address and lot number, CC&R section cited, description of the prohibited use, dates and times of observed violations (multiple observations strengthen the case), any evidence of commercial activity (signage, customer traffic, delivery vehicles), photographs from public areas, names and contact information of any witnesses.",
            },
          ],
        },
        {
          type: "prose",
          text: "Thorough documentation is the difference between an enforcement action that succeeds and one that fails. In the next lesson, we will cover the formal notice process — the critical step that triggers the homeowner's right to cure the violation before further action is taken.",
        },
      ],
    },
  });

  // ── Module 2, Lesson 2: The Notice Process ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[1].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "The Notice Process",
        },
        {
          type: "prose",
          text: "The notice process is arguably the most critical procedural step in CC&R enforcement. Under Texas Property Code Chapter 209, a property owners association must provide specific written notice before it can levy a fine, suspend an owner's rights, or file suit for a violation. Failure to comply with the notice requirements can render the entire enforcement action void. For condominium associations under Chapter 82, the declaration typically sets out notice requirements that, while not identical to Chapter 209, serve a similar due process function.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.007(a)",
          title: "Required Notice Before Enforcement",
          text: "A property owners association may not, except for nonpayment of assessments, charge a property owner a fee, levy a fine, or file suit against a property owner unless the association provides the owner written notice describing the violation or property damage and gives the owner a reasonable time (at least 30 days) to cure the violation. If the owner does not cure the violation within the allotted time, the association must provide a second notice that informs the owner that a committee hearing will be held to determine whether a fine should be levied.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "heading",
          level: 2,
          text: "Elements of an Effective Violation Notice",
        },
        {
          type: "prose",
          text: "A proper violation notice must include: (1) The date of the notice. (2) The name and address of the property owner. (3) A description of the violation — what specific conduct or condition violates the governing documents. Be precise: reference the section and paragraph of the CC&Rs or rule. (4) The specific governing document provision being violated — quote or paraphrase the relevant text. (5) The cure period — state the deadline by which the violation must be corrected. Under Chapter 209, this must be at least 30 days. (6) The consequences of failure to cure — explain that failure to correct the violation may result in a hearing, fine, or other enforcement action. (7) The delivery method — Chapter 209 requires notice to be sent by certified mail to the owner's last known address.",
        },
        {
          type: "timeline",
          title: "Chapter 209 Enforcement Notice Timeline",
          events: [
            {
              label: "Step 1",
              title: "First Written Notice",
              description: "Send certified mail notice describing the violation, citing the specific CC&R provision, and providing at least 30 days to cure.",
            },
            {
              label: "Step 2",
              title: "30+ Day Cure Period",
              description: "The homeowner has at least 30 days to correct the violation. Document whether the violation is cured during this period.",
            },
            {
              label: "Step 3",
              title: "Second Notice (If Not Cured)",
              description: "If the violation is not cured, send a second certified mail notice informing the owner that a hearing will be held before the board or a committee appointed by the board.",
            },
            {
              label: "Step 4",
              title: "Hearing",
              description: "Conduct a hearing where the homeowner may present their case. The board or committee then determines whether to levy a fine or take other enforcement action.",
            },
            {
              label: "Step 5",
              title: "Written Decision",
              description: "After the hearing, provide the homeowner with a written notice of the board's decision, including any fine assessed and the basis for the decision.",
            },
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Certified Mail Is Not Optional",
          text: "Chapter 209 requires that violation notices be sent by certified mail. Regular mail, email, or posting a notice on the door is not sufficient for formal enforcement notices. If you cannot prove the notice was sent by certified mail, you have not satisfied the statutory requirement. Keep certified mail receipts in the violation file.",
        },
        {
          type: "scenario",
          title: "The Defective Notice",
          text: "Meadowbrook POA sends a violation notice stating: 'Your property is not in compliance with community standards. Please correct the situation within 10 days or fines will be assessed.' This notice is defective in multiple ways: it does not identify the specific violation, does not cite the applicable CC&R provision, provides only 10 days to cure (Chapter 209 requires at least 30), and threatens fines without mention of a hearing. If the association levies a fine based on this notice, the homeowner can challenge the fine and will likely prevail because the association failed to comply with the mandatory notice requirements.",
        },
        {
          type: "prose",
          text: "A best practice is to use a standardized violation notice template that has been reviewed by the association's attorney. The template should include all required elements and be easily customizable for specific violations. This ensures consistency and reduces the risk of procedural errors.",
        },
        {
          type: "knowledge-check",
          question: "Under Chapter 209, an HOA sends a violation notice on March 1 giving the homeowner until March 15 to cure. Is this notice compliant?",
          options: [
            "Yes, two weeks is a reasonable cure period.",
            "No, Chapter 209 requires at least 30 days to cure the violation.",
            "Yes, as long as the notice was sent by certified mail.",
            "It depends on the severity of the violation.",
          ],
          correctIndex: 1,
          explanation: "Chapter 209 mandates a minimum 30-day cure period. A 15-day cure period violates the statute regardless of how the notice was delivered or the nature of the violation. The cure deadline should be at least March 31.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Courtesy Notices",
          text: "Many associations send an informal courtesy notice before the formal Chapter 209 notice. While not legally required, a friendly reminder letter can resolve many violations without the need for formal enforcement. However, the courtesy notice does NOT satisfy the Chapter 209 notice requirement — you must still send the formal certified-mail notice if the violation is not cured.",
        },
        {
          type: "drag-drop-match",
          title: "Match the Notice Element to Its Purpose",
          instruction: "Drag each notice element to the reason it is required.",
          pairs: [
            { item: "Specific description of the violation", match: "Ensures the homeowner knows exactly what conduct must be corrected" },
            { item: "Citation to the CC&R provision", match: "Establishes the legal basis for the enforcement action" },
            { item: "30-day cure period", match: "Satisfies the statutory minimum under Chapter 209" },
            { item: "Certified mail delivery", match: "Provides proof that the notice was sent as required by statute" },
            { item: "Description of consequences", match: "Informs the homeowner of the potential outcomes of non-compliance" },
          ],
        },
        {
          type: "prose",
          text: "Proper notice is the gateway to the enforcement process. Without valid notice, no fine, suspension, or legal action can survive a challenge. In the next lesson, we will examine the hearing process — what happens when the homeowner does not cure the violation within the notice period.",
        },
      ],
    },
  });

  // ── Module 2, Lesson 3: Hearings and Due Process ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[2].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Hearings and Due Process",
        },
        {
          type: "prose",
          text: "When a homeowner fails to cure a violation within the notice period, the association's next step is to provide an opportunity for a hearing. The hearing is a fundamental due process protection — it gives the homeowner a chance to present their side of the story before the association takes punitive action. Under Chapter 209, the hearing is a mandatory prerequisite to levying fines or suspending owner rights. Even where not strictly required by statute (such as in some COA contexts), providing a hearing is a best practice that strengthens the association's legal position.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.007(b)",
          title: "Hearing Requirement",
          text: "If the property owner does not cure the violation within the period specified in the notice, the association shall notify the owner that a hearing will be held by the board or a committee appointed by the board to discuss and verify facts and resolve the matter. The notice must inform the owner of the date, time, and location of the hearing and that the owner may attend and present information.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "heading",
          level: 2,
          text: "Conducting the Hearing",
        },
        {
          type: "prose",
          text: "A violation hearing is not a courtroom proceeding, but it must be conducted fairly. The following procedures are recommended: (1) Provide adequate notice of the hearing date, time, and location — at least 10 days is a common best practice. (2) Allow the homeowner to attend in person. (3) Present the association's evidence — photographs, inspection reports, the violation notice, the relevant CC&R provision. (4) Allow the homeowner to respond — they may present evidence, witnesses, or explanations. (5) The board or committee deliberates and makes a decision. (6) Provide the homeowner with a written decision after the hearing.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Who Conducts the Hearing?",
          text: "Chapter 209 allows the hearing to be conducted by the full board or a committee appointed by the board. Some associations use a Compliance Committee or Hearing Committee composed of non-board homeowner volunteers. This can add a layer of impartiality. However, the ultimate authority to levy fines typically rests with the board.",
        },
        {
          type: "prose",
          text: "During the hearing, board members should: listen actively and avoid interrupting the homeowner, ask clarifying questions, avoid making the decision during the hearing itself (deliberate afterward), maintain a professional and respectful tone, and have the association's manager or attorney take detailed notes. The goal is to demonstrate that the association acted fairly and gave the homeowner a meaningful opportunity to be heard.",
        },
        {
          type: "scenario",
          title: "A Fair Hearing",
          text: "Bridgewater HOA notifies a homeowner that his unpermitted fence violates Section 7.4 of the CC&Rs. The homeowner attends the hearing and explains that he built the fence because his young children were at risk near a drainage easement. He shows that he submitted an architectural review application that was never processed. The board reviews its records and discovers the application was indeed received but was lost during a management transition. The board gives the homeowner 60 days to submit a new application and bring the fence into compliance. This fair resolution — acknowledging the board's own error — strengthens community trust and avoids litigation.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Conflicts of Interest",
          text: "If a board member has a personal conflict with the homeowner who is the subject of the hearing, that board member should recuse themselves from the hearing and the decision. Participation by a biased decision-maker can undermine the entire enforcement action.",
        },
        {
          type: "heading",
          level: 2,
          text: "The Written Decision",
        },
        {
          type: "prose",
          text: "After the hearing, the association must provide the homeowner with a written notice of the board's decision. The written decision should include: the date of the hearing, a summary of the evidence presented, the board's findings of fact, the specific CC&R provision violated, the action taken (fine, deadline for compliance, suspension of privileges), the amount of any fine assessed, and information about any appeal process available under the governing documents.",
        },
        {
          type: "timeline",
          title: "Hearing Process Flow",
          events: [
            {
              label: "Pre-Hearing",
              title: "Notice of Hearing",
              description: "Send written notice of hearing date, time, location, and the homeowner's right to attend and present information. Allow at least 10 days advance notice.",
            },
            {
              label: "Hearing Day",
              title: "Conduct the Hearing",
              description: "Present evidence, allow homeowner response, maintain detailed minutes. Board deliberates after the homeowner's presentation.",
            },
            {
              label: "Post-Hearing",
              title: "Board Deliberation",
              description: "Board discusses the evidence in executive session (if permitted) and reaches a decision. Consider whether the violation is proven and what remedy is appropriate.",
            },
            {
              label: "Within 7-10 Days",
              title: "Written Decision",
              description: "Provide the homeowner with a written decision including findings, the action taken, and any fine assessed. Send by certified mail.",
            },
          ],
        },
        {
          type: "knowledge-check",
          question: "A homeowner was sent a hearing notice but did not attend. Can the board proceed with the hearing and levy a fine?",
          options: [
            "No, the board must reschedule until the homeowner attends.",
            "Yes, the board may proceed if the homeowner was given proper notice and a reasonable opportunity to attend.",
            "Yes, but the board must automatically levy the maximum fine.",
            "No, the board must send a third notice before proceeding.",
          ],
          correctIndex: 1,
          explanation: "The statutory requirement is to provide the homeowner with an opportunity to be heard, not to guarantee their attendance. If the homeowner was properly notified and chose not to attend, the board may proceed with the hearing and make its decision based on the evidence presented.",
        },
        {
          type: "prose",
          text: "Fair hearings protect both the homeowner and the association. They create a defensible record, demonstrate good faith, and often lead to reasonable resolutions. In the next lesson, we will examine fines and other enforcement actions the board may take after a violation is confirmed through the hearing process.",
        },
      ],
    },
  });

  // ── Module 2, Lesson 4: Fines and Enforcement Actions ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[3].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Fines and Enforcement Actions",
        },
        {
          type: "prose",
          text: "After a violation has been documented, notice has been sent, the cure period has expired, and a hearing has been conducted, the association has several enforcement tools at its disposal. Fines are the most common, but the association may also suspend certain privileges, pursue compliance through the courts, or — in the case of unpaid assessments — exercise its lien and foreclosure rights. The choice of enforcement action should be proportionate to the violation and consistent with the association's established practices.",
        },
        {
          type: "heading",
          level: 2,
          text: "Fines",
        },
        {
          type: "prose",
          text: "The authority to levy fines must be established in the CC&Rs or the bylaws. The board cannot create a fine authority that does not exist in the governing documents. Key considerations for fine schedules include: the maximum fine amount authorized by the CC&Rs, whether the fine is a one-time charge or a per-day continuing charge, graduated fine schedules for repeat violations, and the total cap on accumulated fines. Many associations adopt a published fine schedule that specifies the amount for different categories of violations. This promotes transparency and consistency.",
        },
        {
          type: "comparison-table",
          title: "Sample Fine Schedule",
          headers: ["Violation Type", "First Offense", "Second Offense", "Third+ Offense"],
          rows: [
            ["Maintenance (lawn, exterior)", "$50", "$100", "$200 + daily $25"],
            ["Architectural (unapproved modification)", "$100", "$200", "$500 + daily $50"],
            ["Use (commercial activity, prohibited animals)", "$200", "$500", "$500 + daily $50"],
            ["Parking (unauthorized vehicles)", "$50", "$100", "$200"],
            ["Noise / Nuisance", "$100", "$200", "$500"],
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Fines Must Be Reasonable",
          text: "Texas courts may review fine amounts for reasonableness. An association that levies grossly disproportionate fines — for example, $10,000 for a minor landscaping violation — may find its fine invalidated as an unreasonable penalty. The fine should be proportionate to the severity of the violation and designed to encourage compliance, not to punish.",
        },
        {
          type: "heading",
          level: 2,
          text: "Suspension of Privileges",
        },
        {
          type: "prose",
          text: "The association may suspend certain privileges for violations, such as access to amenities (pool, clubhouse, gym), voting rights on association matters, and the right to serve on the board or committees. However, the association generally cannot suspend an owner's right to use their own property, access common areas necessary for ingress and egress, or receive essential services. Suspension of privileges must also follow the same notice and hearing requirements as fines under Chapter 209.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.006(b-1)",
          title: "Limitations on Suspension",
          text: "The association may not restrict an owner's access to the owner's property. While the association may suspend certain amenity privileges for non-compliance, it may not deny an owner access to their lot or to common areas necessary for accessing their lot. Any suspension must follow the notice and hearing procedures required by § 209.007.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "heading",
          level: 2,
          text: "Liens and Foreclosure",
        },
        {
          type: "prose",
          text: "For unpaid assessments (not fines), the association typically has a lien on the property. The lien arises from the CC&Rs and is enforceable under Texas law. Important limitations: under Chapter 209, a POA generally may not foreclose a lien for fines or attorney's fees alone — only for unpaid assessments. Foreclosure is a drastic remedy and should only be pursued after all other collection methods have been exhausted. Before pursuing foreclosure, consult with the association's attorney.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.009",
          title: "Foreclosure Restrictions",
          text: "A property owners association may not foreclose a lien on a homeowner's property if the debt securing the lien consists solely of fines assessed by the association or attorney's fees incurred by the association associated with fines assessed by the association. Additionally, non-judicial foreclosure by a POA requires specific notice provisions and waiting periods.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "scenario",
          title: "Enforcement Escalation",
          text: "A homeowner at Cedar Park HOA has accumulated $2,500 in fines over 18 months for an ongoing architectural violation (an unpermitted carport). The homeowner refuses to remove the carport or pay the fines. The board wants to foreclose. Analysis: The $2,500 consists entirely of fines, not unpaid assessments. Under § 209.009, the association CANNOT foreclose for fines alone. The association's options are: (1) file a civil lawsuit to obtain a court order requiring removal of the carport and payment of fines, or (2) continue to assess fines and attempt mediation. If the homeowner also has unpaid assessments, those may be subject to lien foreclosure, but the fines cannot be the basis for foreclosure.",
        },
        {
          type: "knowledge-check",
          question: "An HOA homeowner has $3,000 in unpaid fines and $0 in unpaid assessments. Can the association foreclose on the property?",
          options: [
            "Yes, $3,000 is a significant amount that justifies foreclosure.",
            "No, under Chapter 209, a POA may not foreclose a lien consisting solely of fines.",
            "Yes, but only through judicial foreclosure.",
            "Yes, if the CC&Rs specifically authorize foreclosure for fines.",
          ],
          correctIndex: 1,
          explanation: "Section 209.009 expressly prohibits a POA from foreclosing a lien that consists solely of fines or attorney's fees related to fines, regardless of the amount or what the CC&Rs say. The statute overrides any contrary provision in the governing documents.",
        },
        {
          type: "checkpoint",
          moduleIndex: 1,
          title: "Module 2 Checkpoint",
          question: "You have completed Module 2: The Enforcement Process. Before proceeding, confirm: Under Texas Property Code Chapter 209, what is the minimum cure period that must be provided in a violation notice before a fine can be levied?",
          options: [
            "10 days",
            "15 days",
            "30 days",
            "60 days",
          ],
          correctIndex: 2,
          explanation: "Chapter 209 requires that the homeowner be given at least 30 days to cure the violation before the association can proceed to a hearing and potential fine. This 30-day minimum is a statutory requirement that cannot be shortened by the governing documents.",
        },
        {
          type: "prose",
          text: "Understanding the full range of enforcement tools — and their legal limitations — is essential for effective community governance. In Module 3, we will examine what happens when standard enforcement is not enough: evidence preservation, escalation decisions, alternative dispute resolution, and working with legal counsel.",
        },
      ],
    },
  });

  // ─── Module 3 Content ────────────────────────────────────────────────
  console.log("Creating lesson content for Module 3...");

  // ── Module 3, Lesson 1: Evidence Collection and Preservation ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[0].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Evidence Collection and Preservation",
        },
        {
          type: "prose",
          text: "When a covenant violation escalates beyond informal resolution, the quality of the association's evidence becomes critical. Whether the matter proceeds to mediation, arbitration, or litigation, the association must be able to prove the violation occurred, that proper procedures were followed, and that the enforcement action was reasonable. This lesson covers the principles and practices of evidence collection and preservation for community association enforcement.",
        },
        {
          type: "heading",
          level: 2,
          text: "Types of Evidence in Enforcement Cases",
        },
        {
          type: "prose",
          text: "Associations typically rely on several categories of evidence: (1) Documentary evidence — the governing documents themselves, violation notices, correspondence, hearing minutes, and board resolutions. (2) Photographic and video evidence — date-stamped photographs and video recordings of the violation. (3) Witness testimony — statements from board members, managers, committee members, or neighbors who observed the violation. (4) Expert evidence — in some cases, professional opinions may be needed (e.g., a structural engineer for a building code violation, a surveyor for an encroachment dispute). (5) Public records — county appraisal records, building permits, deed records, and plat maps.",
        },
        {
          type: "callout",
          variant: "info",
          title: "The Best Evidence Principle",
          text: "Always preserve original evidence. A copy of a photograph is less persuasive than the original digital file with its metadata intact. An original signed letter is better than a photocopy. When collecting evidence, think about what a judge or mediator would want to see — and preserve it in its most authentic form.",
        },
        {
          type: "heading",
          level: 2,
          text: "Preservation Obligations",
        },
        {
          type: "prose",
          text: "Once the association reasonably anticipates that a matter may result in litigation, it has a duty to preserve relevant evidence. This is known as the litigation hold or preservation obligation. Destruction of evidence — even if unintentional — after a preservation obligation arises can result in sanctions, including adverse inferences (the court may instruct the jury to assume the destroyed evidence was unfavorable to the association). The association should: identify all individuals who may have relevant documents or information, instruct them to preserve all related materials, suspend any routine document destruction policies for related records, and document the preservation steps taken.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Digital Evidence",
          text: "Emails, text messages, social media posts, and digital photographs all constitute evidence. Board members who discuss enforcement matters via personal email or text message should preserve those communications. Deleting emails or text messages after a dispute arises can constitute spoliation of evidence.",
        },
        {
          type: "comparison-table",
          title: "Evidence Preservation Checklist",
          headers: ["Evidence Type", "Where to Find It", "How to Preserve It"],
          rows: [
            ["Governing documents", "County records, association files", "Keep certified copies; verify against recorded versions"],
            ["Violation notices", "Association correspondence files", "Preserve originals with certified mail receipts"],
            ["Photographs", "Inspector cameras, phones", "Download originals with metadata; store on secure server"],
            ["Hearing minutes", "Board secretary files", "Preserve signed originals; distribute copies to participants"],
            ["Email correspondence", "Email accounts (board, manager)", "Do NOT delete; export and archive relevant threads"],
            ["Financial records", "Accounting software, bank statements", "Maintain for statutory retention period (7+ years)"],
          ],
        },
        {
          type: "scenario",
          title: "Spoliation Consequences",
          text: "Lakeside HOA is in a dispute with a homeowner over alleged unauthorized construction. During the dispute, the management company migrates to a new software system and deletes old violation records, including photographs and correspondence related to the homeowner's case. The homeowner's attorney argues spoliation of evidence. The court agrees and instructs the jury that it may assume the destroyed records would have been unfavorable to the HOA. The HOA's enforcement case is severely weakened — not because the violation did not occur, but because the evidence was destroyed. Cost of the migration convenience: potentially hundreds of thousands of dollars in an adverse judgment.",
        },
        {
          type: "heading",
          level: 2,
          text: "Chain of Custody",
        },
        {
          type: "prose",
          text: "For evidence to be admissible in a legal proceeding, the association must be able to demonstrate the chain of custody — that is, who collected the evidence, when it was collected, how it has been stored, and that it has not been altered. For photographs, this means preserving the original digital files (not just printed copies), maintaining date-stamp metadata, and documenting who took the photograph and when. For documents, it means keeping originals in a secure location and tracking who has had access to them.",
        },
        {
          type: "knowledge-check",
          question: "The association's management company is upgrading its software and plans to delete all records older than two years. One of those records relates to an ongoing enforcement dispute. What should the association do?",
          options: [
            "Allow the deletion to proceed since the software company needs to migrate.",
            "Immediately issue a litigation hold for all records related to the ongoing dispute and instruct the management company to preserve them.",
            "Rely on the homeowner to preserve their own copies.",
            "Wait until after the migration to determine if the records are needed.",
          ],
          correctIndex: 1,
          explanation: "The association has a duty to preserve evidence related to any matter it reasonably anticipates may result in litigation. Allowing the destruction of records related to an ongoing dispute could constitute spoliation and result in sanctions.",
        },
        {
          type: "accordion",
          title: "Evidence Best Practices",
          items: [
            {
              heading: "Photographing Violations",
              body: "Use a camera or phone with GPS and timestamp enabled. Take wide-angle shots that show the property address, then close-up shots of the specific violation. Include a reference object for scale if relevant. Take photographs from public areas only. Store original files — do not rely on printed copies alone.",
            },
            {
              heading: "Documenting Inspections",
              body: "Use a standardized inspection form. Record the date, time, inspector name, properties inspected, conditions observed, and photographs taken. Have the inspector sign and date the form. Maintain inspection records in chronological order.",
            },
            {
              heading: "Preserving Electronic Communications",
              body: "Board members should use official association email accounts for enforcement matters whenever possible. If personal accounts are used, those communications must also be preserved. Consider implementing an automatic email archiving policy. Never discuss enforcement matters on social media.",
            },
          ],
        },
        {
          type: "prose",
          text: "Evidence collection and preservation may seem burdensome, but it is the foundation of every successful enforcement action. In the next lesson, we will discuss how to decide when a matter has escalated beyond what the board can handle internally and needs to be referred to legal counsel.",
        },
      ],
    },
  });

  // ── Module 3, Lesson 2: Deciding When to Escalate ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[1].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Deciding When to Escalate",
        },
        {
          type: "prose",
          text: "Not every covenant violation requires legal action. In fact, the vast majority of violations are resolved through the standard notice-and-cure process. However, some situations require escalation — either to the association's legal counsel, to mediation, or ultimately to litigation. Knowing when to escalate is one of the most important judgment calls a board will make. Escalating too early wastes money and damages community relationships. Escalating too late allows violations to become entrenched and may weaken the association's legal position.",
        },
        {
          type: "heading",
          level: 2,
          text: "Indicators That Escalation Is Warranted",
        },
        {
          type: "prose",
          text: "Consider escalation when one or more of the following conditions exist: (1) The homeowner has been given proper notice and a hearing, but refuses to cure the violation or pay assessed fines. (2) The violation poses a safety risk to the community (structural hazards, fire risks, dangerous animals). (3) The homeowner has threatened legal action against the association. (4) The matter involves complex legal issues (constitutional claims, fair housing issues, disability accommodations). (5) The homeowner has retained an attorney and is communicating through counsel. (6) Multiple homeowners are engaged in similar violations and a precedent-setting response is needed. (7) The violation involves significant property damage or liability exposure.",
        },
        {
          type: "callout",
          variant: "info",
          title: "The Cost-Benefit Analysis",
          text: "Before escalating, conduct an honest cost-benefit analysis. Compare the cost of legal action (attorney's fees, court costs, staff time) against the potential recovery (fines, compliance, injunctive relief) and the broader community impact. Sometimes the most pragmatic approach is to negotiate a compromise rather than pursue full litigation.",
        },
        {
          type: "comparison-table",
          title: "Escalation Decision Matrix",
          headers: ["Factor", "Favor Internal Resolution", "Favor Escalation"],
          rows: [
            ["Homeowner cooperation", "Homeowner is communicating and attempting to cure", "Homeowner is unresponsive or hostile"],
            ["Violation severity", "Minor aesthetic or procedural issue", "Safety hazard or major structural violation"],
            ["Legal complexity", "Straightforward CC&R provision", "Constitutional, fair housing, or disability issues"],
            ["Financial impact", "Low cost to association", "Significant liability exposure or precedent value"],
            ["Community impact", "Isolated incident", "Pattern of violations or community-wide concern"],
            ["Homeowner representation", "Homeowner is pro se", "Homeowner has retained counsel"],
          ],
        },
        {
          type: "scenario",
          title: "To Escalate or Not?",
          text: "Heritage Hills POA has a homeowner who has been running a daycare out of their home for the past year, in apparent violation of Section 3.1 of the CC&Rs prohibiting commercial use of residential lots. The board sent a notice, held a hearing, and assessed fines totaling $1,500. The homeowner claims that a small in-home daycare is not a 'commercial use' and has continued operations. The homeowner has also obtained a county home occupation permit. Analysis: This situation warrants escalation to legal counsel because (a) there is a reasonable legal argument on both sides regarding the definition of 'commercial use,' (b) the homeowner has a government permit that may complicate enforcement, (c) the violation is ongoing despite fines, and (d) the outcome will set a precedent for future home occupation disputes. The board should consult with the association's attorney before taking further action.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.00593",
          title: "Alternative Dispute Resolution",
          text: "Before filing suit against a property owner (other than for unpaid assessments or to enforce a prior judgment), a property owners association must first make a written offer to the owner to use an alternative dispute resolution procedure. The association may not file suit until 30 days after the date the offer is made if the owner does not accept the offer. This mandatory ADR step must be completed before the association can escalate to litigation.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "heading",
          level: 2,
          text: "The Referral to Counsel",
        },
        {
          type: "prose",
          text: "When the board decides to escalate, the referral to the association's attorney should include: a complete copy of the violation file (all notices, correspondence, photographs, hearing minutes), the specific CC&R provisions at issue, a summary of all enforcement actions taken to date, the board's objective (compliance, collection, injunction), and any information about the homeowner's legal representation or defenses. The more organized and complete the referral package, the more efficiently the attorney can evaluate the situation and recommend a course of action.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Attorney-Client Privilege",
          text: "Communications between the board and the association's attorney are protected by attorney-client privilege. However, this privilege can be waived if the communications are shared with third parties. Board members should not discuss the attorney's legal advice in open meetings, in emails to the community, or on social media. Legal strategy discussions should occur in executive session.",
        },
        {
          type: "knowledge-check",
          question: "A homeowner has paid all assessed fines but continues the violation. What should the board consider?",
          options: [
            "The matter is resolved since the fines were paid.",
            "Continue to assess fines indefinitely.",
            "Evaluate whether to escalate to legal counsel to seek injunctive relief (a court order requiring the homeowner to stop the violation).",
            "Remove the homeowner from the association.",
          ],
          correctIndex: 2,
          explanation: "Payment of fines does not resolve an ongoing violation. If the homeowner continues to violate the CC&Rs despite paying fines, the board should consider seeking injunctive relief through the courts — a court order that actually requires the homeowner to stop the prohibited activity. Fines alone are a collection remedy, not a compliance remedy.",
        },
        {
          type: "prose",
          text: "The decision to escalate should be deliberate, well-documented, and based on a clear assessment of the situation. In the next lesson, we will examine Alternative Dispute Resolution — the step that Chapter 209 requires before filing suit and that often provides the best path to a lasting resolution.",
        },
      ],
    },
  });

  // ── Module 3, Lesson 3: Alternative Dispute Resolution ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[2].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Alternative Dispute Resolution",
        },
        {
          type: "prose",
          text: "Alternative Dispute Resolution (ADR) encompasses methods of resolving disputes outside of traditional litigation. For community associations in Texas, ADR is not merely an option — under Chapter 209, it is a prerequisite to filing suit in many situations. ADR methods include negotiation, mediation, and arbitration. Each offers distinct advantages and is appropriate for different types of disputes. Understanding ADR is essential for every board member and community manager.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.00593",
          title: "Mandatory ADR Offer",
          text: "A property owners association or property owner may not file a suit related to a dispute between the association and a property owner (other than a suit to collect a regular or special assessment or foreclose under an association's lien) unless the party filing suit first makes a written offer to the other party to resolve the dispute through an ADR procedure. The party receiving the offer has 30 days to accept. If the offer is not accepted, the filing party has satisfied the statutory prerequisite to suit.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "heading",
          level: 2,
          text: "Mediation",
        },
        {
          type: "prose",
          text: "Mediation is a facilitated negotiation in which a neutral third party (the mediator) helps the disputing parties reach a voluntary agreement. Key features of mediation include: it is voluntary — neither party is forced to agree to a resolution, the mediator does not impose a decision, all communications during mediation are confidential and generally not admissible in subsequent legal proceedings, mediation is typically much faster and less expensive than litigation, and the parties often develop creative solutions that a court could not order. Mediation is particularly well-suited to community association disputes because the parties will continue to live in the same community after the dispute is resolved.",
        },
        {
          type: "heading",
          level: 2,
          text: "Arbitration",
        },
        {
          type: "prose",
          text: "Arbitration is a more formal process in which a neutral arbitrator (or panel) hears evidence and arguments from both sides and renders a binding decision. Unlike mediation, arbitration produces a winner and a loser. Some CC&Rs contain mandatory arbitration clauses requiring certain disputes to be submitted to binding arbitration. Advantages include faster resolution than court litigation and the ability to select an arbitrator with subject-matter expertise. Disadvantages include limited appeal rights and the potential for significant arbitrator fees.",
        },
        {
          type: "comparison-table",
          title: "Mediation vs. Arbitration vs. Litigation",
          headers: ["Feature", "Mediation", "Arbitration", "Litigation"],
          rows: [
            ["Decision-maker", "Parties themselves (facilitated)", "Arbitrator", "Judge / Jury"],
            ["Binding?", "Only if parties agree", "Yes (if binding arbitration)", "Yes"],
            ["Cost", "Low ($500-$3,000 typical)", "Moderate ($3,000-$15,000)", "High ($10,000-$100,000+)"],
            ["Timeline", "1-3 months", "3-6 months", "12-36 months"],
            ["Confidential?", "Yes", "Usually yes", "No (public record)"],
            ["Relationship impact", "Low — cooperative process", "Moderate", "High — adversarial process"],
            ["Creative remedies?", "Yes — parties control outcome", "Limited by arbitrator's authority", "Limited by law"],
          ],
        },
        {
          type: "scenario",
          title: "Mediation Success Story",
          text: "Willow Glen HOA and a homeowner have been in a dispute for over a year regarding an enclosed patio that the homeowner built without architectural approval. The board has assessed $4,500 in fines. The homeowner refuses to remove the patio, claiming it increases property value and that similar structures exist in the neighborhood (selective enforcement). The parties agree to mediation. The mediator helps them reach a creative solution: the homeowner will submit an after-the-fact architectural review application, modify the patio to comply with setback requirements, and pay a reduced fine of $1,500. The board agrees to process the application on an expedited basis. Total cost: $2,000 for mediation. The alternative — litigation — would have cost the association an estimated $25,000-$50,000 with an uncertain outcome.",
        },
        {
          type: "heading",
          level: 2,
          text: "Preparing for ADR",
        },
        {
          type: "prose",
          text: "Effective ADR preparation includes: assembling the complete violation file with all documentation, identifying the association's objectives (what outcome does the board want?), determining the board's authority to settle (what compromises are acceptable?), selecting an appropriate mediator or arbitrator with community association experience, and briefing the association's representative on the facts, the law, and the desired outcome. The board should designate a representative with authority to settle at the mediation — otherwise the process is wasted if every proposed resolution must be taken back to the full board for approval.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Finding a Mediator",
          text: "Texas has several resources for finding qualified mediators, including the Texas Association of Mediators, local bar association dispute resolution centers, and county-funded mediation services. Look for mediators with experience in real property or community association disputes. Many counties offer low-cost mediation services through community dispute resolution centers.",
        },
        {
          type: "knowledge-check",
          question: "Under Chapter 209, what must an HOA do before filing a lawsuit against a homeowner for a covenant violation (other than unpaid assessments)?",
          options: [
            "Obtain approval from 75% of the membership.",
            "Make a written offer to resolve the dispute through alternative dispute resolution and wait 30 days.",
            "File a complaint with the Texas Attorney General.",
            "Attempt informal negotiation for at least 6 months.",
          ],
          correctIndex: 1,
          explanation: "Section 209.00593 requires the association to make a written offer of ADR and allow the homeowner 30 days to accept before filing suit. This mandatory step applies to all suits against homeowners except suits to collect assessments or enforce a prior judgment.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Document the ADR Offer",
          text: "The written ADR offer must be documented and preserved. Send it by certified mail and keep a copy with the certified mail receipt. If the matter does proceed to litigation, you must be able to prove that you complied with the Chapter 209 ADR prerequisite. A court may dismiss the association's lawsuit if this step was not properly completed.",
        },
        {
          type: "prose",
          text: "ADR is not a sign of weakness — it is a sign of good governance. Boards that embrace ADR resolve disputes faster, at lower cost, and with less community disruption. In the final lesson, we will discuss how to work effectively with legal counsel when litigation becomes necessary.",
        },
      ],
    },
  });

  // ── Module 3, Lesson 4: Working with Legal Counsel ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[3].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Working with Legal Counsel",
        },
        {
          type: "prose",
          text: "Every community association should have a relationship with an attorney who specializes in community association law. The attorney's role is to advise the board on legal matters, review governing documents, ensure compliance with state law, and represent the association when disputes escalate to litigation. Working effectively with legal counsel is a skill that board members must develop — it requires understanding when to seek legal advice, how to manage the attorney-client relationship, and how to control legal costs.",
        },
        {
          type: "heading",
          level: 2,
          text: "When to Consult the Attorney",
        },
        {
          type: "prose",
          text: "Board members should consult the association's attorney when: (1) a homeowner retains an attorney or threatens litigation, (2) the board is considering an action that could affect homeowners' legal rights (amending CC&Rs, foreclosure, suspension of rights), (3) a fair housing complaint or accommodation request is received, (4) the association receives a demand letter or legal notice, (5) the board is unsure about the interpretation of a CC&R provision or statute, (6) the association is drafting or amending governing documents, and (7) a dispute is being escalated beyond the standard notice-and-hearing process. The rule of thumb: if you are asking whether you should call the attorney, you should call the attorney.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Preventive Legal Advice",
          text: "The most cost-effective legal services are preventive. An hour of attorney time to review a proposed rule or violation notice before it is issued can prevent thousands of dollars in litigation costs later. Boards should budget for regular legal review of policies and procedures, not just crisis management.",
        },
        {
          type: "heading",
          level: 2,
          text: "Selecting Association Counsel",
        },
        {
          type: "prose",
          text: "Not every real estate attorney is qualified to advise community associations. Look for: experience specifically in community association law (HOA/COA), familiarity with the Texas Property Code (Chapters 82, 202, and 209), membership in the Community Associations Institute (CAI) or Texas chapter, litigation experience in covenant enforcement cases, and a fee structure that fits the association's budget. Many associations use a flat monthly retainer for routine matters and hourly billing for litigation.",
        },
        {
          type: "comparison-table",
          title: "Fee Structures for Association Attorneys",
          headers: ["Structure", "Best For", "Typical Range", "Considerations"],
          rows: [
            ["Monthly retainer", "Ongoing advice, document review", "$500-$2,000/month", "Covers routine calls and emails; additional fees for litigation"],
            ["Hourly billing", "Specific projects, litigation", "$250-$500/hour", "Most common; track hours carefully to manage costs"],
            ["Flat fee per matter", "Document drafting, amendments", "$1,000-$10,000 per project", "Predictable cost; ensure scope is clearly defined"],
            ["Contingency (rare)", "Large collection cases", "20-40% of recovery", "Uncommon in association law; may create misaligned incentives"],
          ],
        },
        {
          type: "heading",
          level: 2,
          text: "Managing Legal Costs",
        },
        {
          type: "prose",
          text: "Legal costs can quickly consume an association's budget if not managed carefully. Best practices include: establish a clear budget for legal services at the beginning of each fiscal year, require the attorney to provide estimates before undertaking significant work, designate a single point of contact for attorney communications (usually the board president or management company), consolidate questions into a single call or email rather than multiple individual contacts, handle routine enforcement internally and reserve attorney involvement for complex or escalated matters, and review legal invoices monthly for accuracy and reasonableness.",
        },
        {
          type: "scenario",
          title: "Attorney Fee Recovery",
          text: "Magnolia Terrace POA prevails in a lawsuit against a homeowner for ongoing commercial use violations. The CC&Rs contain an attorney's fee provision allowing the prevailing party to recover reasonable attorney's fees. The association's legal costs were $35,000. The court awards the association $28,000 in attorney's fees, finding that amount to be reasonable. Key takeaway: check whether your CC&Rs include an attorney's fee provision. If they do, the prevailing party may recover its legal costs. If they do not, each party bears its own attorney's fees regardless of the outcome — making litigation much more expensive for the association.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.008",
          title: "Attorney's Fees in Covenant Enforcement",
          text: "In an action to enforce a restrictive covenant, the court may award costs and reasonable attorney's fees to the prevailing party. This provision applies to suits brought by or against a property owners association. This statutory authorization for fee recovery exists even if the CC&Rs do not contain an attorney's fee provision, though many CC&Rs include their own fee-shifting clauses as well.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "callout",
          variant: "warning",
          title: "The Attorney Represents the Association, Not Individual Board Members",
          text: "A critical point that is frequently misunderstood: the association's attorney represents the association as an entity, not the individual board members. If a board member's personal interests conflict with the association's interests, the attorney has a duty to the association. Individual board members who face personal liability may need to retain their own independent counsel.",
        },
        {
          type: "heading",
          level: 2,
          text: "Preparing for Litigation",
        },
        {
          type: "prose",
          text: "If ADR fails and litigation becomes necessary, the board should work with counsel to: clearly define the objectives of the litigation (injunction, damages, declaratory judgment), understand the estimated timeline and cost, ensure all evidence has been preserved and is organized, designate a board liaison to coordinate with the attorney, communicate appropriately with the community (general updates without privileged information), and understand the risks — litigation outcomes are never guaranteed, regardless of the strength of the case.",
        },
        {
          type: "knowledge-check",
          question: "The association's attorney advises the board in a closed executive session that the association has a weak case against a homeowner. A board member later tells the homeowner about this advice. What has occurred?",
          options: [
            "Nothing significant — the homeowner deserves to know.",
            "A potential waiver of attorney-client privilege that could harm the association's legal position.",
            "A violation of the Texas Property Code.",
            "An ethics violation that results in automatic removal from the board.",
          ],
          correctIndex: 1,
          explanation: "Attorney-client privilege protects confidential communications between the association and its attorney. When a board member discloses privileged legal advice to a third party, the privilege may be waived — meaning the association can no longer prevent that advice from being disclosed in court. This can severely damage the association's legal position.",
        },
        {
          type: "checkpoint",
          moduleIndex: 2,
          title: "Module 3 Checkpoint",
          question: "You have completed Module 3: Pre-Lawsuit, Counsel & Alternatives. Before proceeding to the assessment, confirm: Under Chapter 209, what must an association do before filing a lawsuit against a homeowner for a covenant violation?",
          options: [
            "Obtain a court order authorizing the lawsuit.",
            "Make a written offer of alternative dispute resolution and wait at least 30 days.",
            "Hold a vote of the full membership to authorize litigation.",
            "File a complaint with the Texas Real Estate Commission.",
          ],
          correctIndex: 1,
          explanation: "Section 209.00593 requires the association to offer ADR in writing before filing suit. The homeowner has 30 days to accept the offer. This mandatory pre-suit step ensures that associations explore less costly and adversarial resolution methods before resorting to litigation.",
        },
        {
          type: "prose",
          text: "Working effectively with legal counsel is the final piece of the enforcement puzzle. You now have a comprehensive understanding of the entire enforcement process — from governing documents and Texas statutes, through identification, notice, hearing, fines, evidence preservation, escalation, ADR, and litigation. You are ready to complete the course assessment.",
        },
      ],
    },
  });

  // ─── 8. Assessment Questions ─────────────────────────────────────────
  console.log("Creating assessment questions...");

  const scenario =
    "Green Valley HOA has received a complaint that a homeowner at 123 Oak Street has been operating a commercial auto repair business from their garage for the past 6 months, in violation of Section 4.2 of the CC&Rs which prohibits commercial activities in residential lots.";

  const q1 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "What should the association's FIRST step be upon receiving this complaint?",
      scenario,
      sortOrder: 1,
      explanation:
        "The association must follow the enforcement process outlined in Chapter 209. The first step is to send a formal violation notice via certified mail, citing the specific CC&R provision. Filing a lawsuit immediately or imposing a fine without notice both violate the mandatory procedural requirements.",
      answerOptions: {
        create: [
          { text: "File a lawsuit immediately", isCorrect: false, sortOrder: 0 },
          {
            text: "Send a formal violation notice to the homeowner citing the specific CC&R provision",
            isCorrect: true,
            sortOrder: 1,
          },
          { text: "Impose a fine without notice", isCorrect: false, sortOrder: 2 },
          { text: "Call the police", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  const q2 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "Under Texas Property Code Chapter 209, what is required before the HOA can assess a fine?",
      scenario,
      sortOrder: 2,
      explanation:
        "Section 209.007 requires written notice of the violation, a minimum 30-day cure period, and an opportunity for a hearing before the board or a board-appointed committee. Fines cannot be assessed immediately, and neither a membership vote nor court approval is required.",
      answerOptions: {
        create: [
          { text: "Nothing—fines can be assessed immediately", isCorrect: false, sortOrder: 0 },
          { text: "A vote of all homeowners", isCorrect: false, sortOrder: 1 },
          {
            text: "Written notice and an opportunity for a hearing before the board",
            isCorrect: true,
            sortOrder: 2,
          },
          { text: "Approval from the county court", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  const q3 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "The homeowner responds that their CC&Rs don't specifically mention auto repair. What is the strongest legal approach?",
      scenario,
      sortOrder: 3,
      explanation:
        "The CC&Rs prohibit 'commercial activities' broadly. Auto repair operated as a business falls squarely within a general commercial activity prohibition. The association should argue that the general prohibition covers auto repair as a specific instance of commercial activity. Dropping the matter is not warranted, and amending the CC&Rs or seeking immediate injunctive relief are unnecessary when the existing provision applies.",
      answerOptions: {
        create: [
          {
            text: "Drop the matter since auto repair isn't specifically listed",
            isCorrect: false,
            sortOrder: 0,
          },
          {
            text: "Argue that the general prohibition on commercial activity covers auto repair",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            text: "Amend the CC&Rs to specifically list auto repair",
            isCorrect: false,
            sortOrder: 2,
          },
          { text: "Seek an injunction immediately", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  const q4 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "After proper notice and hearing, the homeowner refuses to stop the activity and refuses to pay the assessed fine. What is the recommended next step before litigation?",
      scenario,
      sortOrder: 4,
      explanation:
        "Chapter 209 requires the association to offer alternative dispute resolution before filing suit. Mediation is the recommended approach. Placing a lien for fines alone is restricted under § 209.009. Turning off utilities is illegal. Publicizing the violation to neighbors is potentially defamatory and counterproductive.",
      answerOptions: {
        create: [
          { text: "Place a lien on the property immediately", isCorrect: false, sortOrder: 0 },
          {
            text: "Attempt mediation or alternative dispute resolution",
            isCorrect: true,
            sortOrder: 1,
          },
          { text: "Turn off the homeowner's utilities", isCorrect: false, sortOrder: 2 },
          { text: "Publicize the violation to neighbors", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  // ─── 9. Learner Progress ─────────────────────────────────────────────
  console.log("Creating learner progress records...");

  // Learner 1 (Emily Rodriguez) — completed all 3 modules, passed assessment, has certificate
  const allM1LessonIds = m1Lessons.map((l) => l.id);
  const allM2LessonIds = m2Lessons.map((l) => l.id);
  const allM3LessonIds = m3Lessons.map((l) => l.id);

  await db.moduleProgress.createMany({
    data: [
      {
        userId: learner1.id,
        moduleId: module1.id,
        completedLessons: allM1LessonIds,
        checkpointsPassed: 1,
        completedAt: new Date("2026-02-15T10:00:00Z"),
      },
      {
        userId: learner1.id,
        moduleId: module2.id,
        completedLessons: allM2LessonIds,
        checkpointsPassed: 1,
        completedAt: new Date("2026-02-22T14:30:00Z"),
      },
      {
        userId: learner1.id,
        moduleId: module3.id,
        completedLessons: allM3LessonIds,
        checkpointsPassed: 1,
        completedAt: new Date("2026-03-01T09:15:00Z"),
      },
    ],
  });

  const attempt1 = await db.assessmentAttempt.create({
    data: {
      userId: learner1.id,
      courseId: course.id,
      score: 100,
      passed: true,
      answers: {
        [q1.id]: 1,
        [q2.id]: 2,
        [q3.id]: 1,
        [q4.id]: 1,
      },
    },
  });

  await db.courseCompletion.create({
    data: {
      userId: learner1.id,
      courseId: course.id,
      completedAt: new Date("2026-03-02T11:00:00Z"),
    },
  });

  await db.certificate.create({
    data: {
      userId: learner1.id,
      attemptId: attempt1.id,
      serialNumber: "CERT-2026-SR-00001",
      orgName: "Sunset Ridge HOA",
      userName: "Emily Rodriguez",
      issuedAt: new Date("2026-03-02T11:00:00Z"),
    },
  });

  // Learner 2 (James Wilson) — completed module 1 only, disclaimer acknowledged
  await db.moduleProgress.create({
    data: {
      userId: learner2.id,
      moduleId: module1.id,
      completedLessons: allM1LessonIds,
      checkpointsPassed: 1,
      completedAt: new Date("2026-03-10T16:45:00Z"),
    },
  });

  // Learner 3 (Maria Garcia) — no progress at all (already has disclaimerAcknowledgedAt: null)

  // ─── 10. Audit Log Entries ───────────────────────────────────────────
  console.log("Creating audit log entries...");

  await db.auditLog.createMany({
    data: [
      // Super admin creates orgs
      {
        actorId: superAdmin.id,
        orgId: sunsetRidge.id,
        action: AuditAction.ORG_CREATED,
        metadata: { orgName: "Sunset Ridge HOA" },
        createdAt: new Date("2026-01-01T09:00:00Z"),
      },
      {
        actorId: superAdmin.id,
        orgId: lakewood.id,
        action: AuditAction.ORG_CREATED,
        metadata: { orgName: "Lakewood Condominiums" },
        createdAt: new Date("2026-01-01T09:05:00Z"),
      },
      // Org admins register
      {
        actorId: orgAdmin1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.USER_REGISTERED,
        metadata: { email: "orgadmin@sunsetridge.com" },
        createdAt: new Date("2026-01-02T10:00:00Z"),
      },
      {
        actorId: orgAdmin2.id,
        orgId: lakewood.id,
        action: AuditAction.USER_REGISTERED,
        metadata: { email: "orgadmin@lakewood.com" },
        createdAt: new Date("2026-01-02T10:30:00Z"),
      },
      // Learner 1 activity
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.USER_REGISTERED,
        metadata: { email: "learner1@example.com" },
        createdAt: new Date("2026-02-01T08:00:00Z"),
      },
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.DISCLAIMER_ACKNOWLEDGED,
        metadata: {},
        createdAt: new Date("2026-02-01T08:05:00Z"),
      },
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.MODULE_COMPLETED,
        metadata: { moduleTitle: "Understanding Governing Documents" },
        createdAt: new Date("2026-02-15T10:00:00Z"),
      },
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.MODULE_COMPLETED,
        metadata: { moduleTitle: "The Enforcement Process" },
        createdAt: new Date("2026-02-22T14:30:00Z"),
      },
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.MODULE_COMPLETED,
        metadata: { moduleTitle: "Pre-Lawsuit, Counsel & Alternatives" },
        createdAt: new Date("2026-03-01T09:15:00Z"),
      },
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.ASSESSMENT_PASSED,
        metadata: { score: 100 },
        createdAt: new Date("2026-03-02T10:45:00Z"),
      },
      {
        actorId: learner1.id,
        orgId: sunsetRidge.id,
        action: AuditAction.CERTIFICATE_ISSUED,
        metadata: { serialNumber: "CERT-2026-SR-00001" },
        createdAt: new Date("2026-03-02T11:00:00Z"),
      },
      // Learner 2 activity
      {
        actorId: learner2.id,
        orgId: sunsetRidge.id,
        action: AuditAction.USER_REGISTERED,
        metadata: { email: "learner2@example.com" },
        createdAt: new Date("2026-03-05T12:00:00Z"),
      },
      {
        actorId: learner2.id,
        orgId: sunsetRidge.id,
        action: AuditAction.DISCLAIMER_ACKNOWLEDGED,
        metadata: {},
        createdAt: new Date("2026-03-05T12:10:00Z"),
      },
      {
        actorId: learner2.id,
        orgId: sunsetRidge.id,
        action: AuditAction.MODULE_COMPLETED,
        metadata: { moduleTitle: "Understanding Governing Documents" },
        createdAt: new Date("2026-03-10T16:45:00Z"),
      },
      // Learner 3 activity
      {
        actorId: learner3.id,
        orgId: lakewood.id,
        action: AuditAction.USER_REGISTERED,
        metadata: { email: "learner3@example.com" },
        createdAt: new Date("2026-03-15T09:00:00Z"),
      },
      // Content published
      {
        actorId: superAdmin.id,
        orgId: null,
        action: AuditAction.CONTENT_PUBLISHED,
        metadata: { courseTitle: "CCR Enforcement Training", modules: 3, lessons: 12 },
        createdAt: new Date("2026-01-15T14:00:00Z"),
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("  - 1 Super Admin");
  console.log("  - 2 Organizations (HOA + COA)");
  console.log("  - 2 Org Admins");
  console.log("  - 3 Learners (various progress stages)");
  console.log("  - 1 Course with 3 Modules and 12 Lessons");
  console.log("  - 12 Lesson Content Versions with real educational content");
  console.log("  - 4 Assessment Questions");
  console.log("  - Progress records, certificate, and audit logs");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
