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

  // Module 1 Lessons (2 teaching slides + 1 quiz)
  const m1Lessons = await Promise.all([
    db.lesson.create({
      data: {
        title: "Your Governing Documents & the Hierarchy",
        slug: "governing-docs-hierarchy",
        sortOrder: 1,
        moduleId: module1.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Texas Property Code & Your Association",
        slug: "texas-property-code-association",
        sortOrder: 2,
        moduleId: module1.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Module 1 Quiz",
        slug: "module-1-quiz",
        sortOrder: 3,
        moduleId: module1.id,
      },
    }),
  ]);

  // Module 2 Lessons (2 teaching slides + 1 quiz)
  const m2Lessons = await Promise.all([
    db.lesson.create({
      data: {
        title: "Identifying Violations & Proper Documentation",
        slug: "violations-documentation",
        sortOrder: 1,
        moduleId: module2.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "The Notice, Hearing & Fine Process",
        slug: "notice-hearing-fines",
        sortOrder: 2,
        moduleId: module2.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Module 2 Quiz",
        slug: "module-2-quiz",
        sortOrder: 3,
        moduleId: module2.id,
      },
    }),
  ]);

  // Module 3 Lessons (2 teaching slides + 1 quiz)
  const m3Lessons = await Promise.all([
    db.lesson.create({
      data: {
        title: "Evidence, Escalation & Knowing When to Act",
        slug: "evidence-escalation",
        sortOrder: 1,
        moduleId: module3.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "ADR, Mediation & Working with Counsel",
        slug: "adr-mediation-counsel",
        sortOrder: 2,
        moduleId: module3.id,
      },
    }),
    db.lesson.create({
      data: {
        title: "Module 3 Quiz",
        slug: "module-3-quiz",
        sortOrder: 3,
        moduleId: module3.id,
      },
    }),
  ]);

  // ─── 7. Lesson Content Versions ─────────────────────────────────────
  console.log("Creating lesson content...");

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 1: Understanding Governing Documents
  // ═══════════════════════════════════════════════════════════════════════

  // ── Module 1, Slide 1: Your Governing Documents & the Hierarchy ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[0].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Your Governing Documents & the Hierarchy",
        },
        {
          type: "prose",
          html: "Think of your community's governing documents like a stack of playing cards — the card on top always wins. Every HOA, POA, and COA in Texas operates under a strict hierarchy, and understanding it is the single most important thing you'll learn in this training. Get it right, and enforcement is straightforward. Get it wrong, and the association could end up in court.",
        },
        {
          type: "callout",
          variant: "info",
          title: "The #1 Rule",
          body: "No written provision = no enforceable violation. It doesn't matter how annoying the neighbor's lawn ornaments are — if the CC&Rs don't address it, the board can't enforce it.",
        },
        {
          type: "comparison-table",
          headers: ["Level", "Document", "What It Controls", "How It's Changed"],
          rows: [
            ["1 (Top)", "Federal & Texas Law", "Constitutional rights, Property Code, FCC rules", "Legislative process only"],
            ["2", "Texas Property Code (Ch. 202, 209, 82)", "Mandatory procedures for HOAs/POAs/COAs", "Legislative amendment"],
            ["3", "Declaration (CC&Rs)", "Property use restrictions, assessments, enforcement powers", "Membership vote (typically 67%)"],
            ["4", "Articles of Incorporation", "Corporate existence and purpose", "Board and/or membership vote"],
            ["5", "Bylaws", "Internal governance: elections, meetings, board structure", "Usually membership vote"],
            ["6 (Bottom)", "Rules & Regulations", "Day-to-day operations: pool hours, parking", "Board vote"],
          ],
        },
        {
          type: "prose",
          html: "<strong>CC&Rs</strong> (the Declaration) are the big one — recorded in county deed records, they bind every owner who buys into the community. They cover what homeowners can and can't do: use restrictions, architectural standards, assessments, and enforcement powers. <strong>Bylaws</strong> handle how the association runs internally — elections, meetings, quorums. They don't create property rules. <strong>Rules & Regulations</strong> are adopted by the board to fill in details under the CC&Rs (pool hours, parking), but they can never contradict the CC&Rs.",
        },
        {
          type: "scenario",
          title: "The 30-Pound Dog Rule",
          situation: "Oakwood Estates HOA's CC&Rs say homeowners may keep 'common household pets.' The board passes a rule banning all dogs over 30 pounds. A homeowner with a 50-pound Labrador fights back.",
          question: "Can a board-adopted rule override what the CC&Rs allow? What happens when the two conflict?",
          revealText: "The board's rule contradicts the CC&Rs. A Labrador is clearly a 'common household pet,' so the 30-pound limit is unenforceable. The board could regulate pet behavior (leashes, waste cleanup), but it can't use a simple board rule to effectively rewrite the CC&Rs. That requires a formal amendment vote by the membership.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "When In Doubt, the Homeowner Wins",
          body: "Texas courts interpret ambiguous CC&R provisions in favor of the homeowner's free use of their property. If a restriction can be read two ways, the less restrictive interpretation wins. This is why precise language in CC&Rs matters so much.",
        },
      ],
    },
  });

  // ── Module 1, Slide 2: Texas Property Code & Your Association ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[1].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Texas Property Code & Your Association",
        },
        {
          type: "prose",
          html: "Three chapters of the Texas Property Code directly control how your association operates. They sit above the CC&Rs in the hierarchy, which means <strong>they override your CC&Rs whenever there's a conflict</strong>. Here's the cheat sheet:",
        },
        {
          type: "comparison-table",
          headers: ["Statute", "What It Requires", "What Happens If You Don't"],
          rows: [
            ["§ 209.007 — Notice & Hearing", "Reasonable time to cure + owner has 30 days to request a hearing before fines", "Fine is void — thrown out in court"],
            ["§ 209.005 — Records Access", "Provide books/records within 10 business days", "$500/day penalty, up to $5,000"],
            ["§ 209.009 — Foreclosure Limits", "Cannot foreclose for fines alone", "Foreclosure dismissed + liability"],
            ["§ 209.00593 — ADR Requirement", "Written offer of mediation before filing suit", "Lawsuit may be dismissed"],
            ["§ 202.012 — Flag Display", "Cannot ban U.S., Texas, or military flags", "Restriction is void — period"],
          ],
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.007 — The Big One",
          summary: "Before levying a fine or filing suit: (1) Send written notice by certified or verified mail describing the violation, (2) Give the owner a reasonable time to cure (for curable violations), (3) The owner has 30 days to request a hearing where they can present their side. Skip any step and the entire enforcement action is invalid.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "scenario",
          title: "The $5,000 Ignored Email",
          situation: "A homeowner requests financial records and meeting minutes in writing. The board president thinks they're just being difficult and tosses the request in a drawer.",
          question: "What does § 209.005 require the association to do — and what's the penalty for ignoring this request?",
          revealText: "The lesson is simple: always respond to records requests within the statutory deadline, even if you think the request is unreasonable. Ignoring it is never worth the financial and legal risk. Set up a process so requests don't fall through the cracks.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Your CC&Rs Can't Override State Law",
          body: "Even if your CC&Rs say 'fines can be assessed without a hearing,' Chapter 209 still requires one. Even if your CC&Rs ban flag displays, § 202.012 makes that restriction void. State law always wins. Your CC&Rs can be stricter than the statute, but never less protective of homeowners.",
        },
        {
          type: "callout",
          variant: "info",
          title: "COA Boards: Chapter 82 Is Your Guide",
          body: "Condominium associations fall under Chapter 82, not Chapter 209. Chapter 82 has fewer mandatory procedures, so your Declaration's own rules matter even more. Many condo declarations voluntarily adopt Chapter 209-style protections — check yours carefully.",
        },
      ],
    },
  });

  // ── Module 1, Quiz ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m1Lessons[2].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Module 1 Quiz",
        },
        {
          type: "prose",
          html: "Let's make sure you have the fundamentals down before we move on to the enforcement process.",
        },
        {
          type: "knowledge-check",
          question: "Your HOA board adopts a rule banning all short-term rentals, but the CC&Rs are completely silent on rental restrictions. A homeowner challenges the rule. Which statement is most accurate?",
          options: [
            "The board rule is automatically valid because the board has general rulemaking authority under the CC&Rs.",
            "The board rule may be challengeable because a total ban on a previously permitted use could be seen as an amendment to the CC&Rs — which requires a membership vote, not just a board vote.",
            "The CC&Rs must specifically prohibit short-term rentals for any restriction to be enforceable.",
            "Texas law prohibits all HOA short-term rental restrictions.",
          ],
          correctIndex: 1,
          gateNext: true,
        },
        {
          type: "checkpoint",
          question: "If a board-adopted rule contradicts a provision in the recorded CC&Rs, which document controls?",
          options: [
            "The board-adopted rule, because it is more recent.",
            "The CC&Rs, because they occupy a higher position in the document hierarchy.",
            "Whichever document is more specific controls.",
            "Neither — the conflict must be resolved by a court.",
          ],
          correctIndex: 1,
          gateNext: true,
        },
      ],
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 2: The Enforcement Process
  // ═══════════════════════════════════════════════════════════════════════

  // ── Module 2, Slide 1: Identifying Violations & Proper Documentation ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[0].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Identifying Violations & Proper Documentation",
        },
        {
          type: "prose",
          html: "More enforcement actions fail because of bad documentation than bad facts. Before sending any notice, two things need to happen: <strong>identify the exact CC&R provision being violated</strong> (specific section and paragraph), and <strong>document the violation thoroughly enough to hold up in court</strong>. If both of those aren't solid, the enforcement isn't ready to move forward.",
        },
        {
          type: "callout",
          variant: "info",
          title: "The Specificity Rule in Texas",
          body: "Texas courts construe restrictive covenants strictly. If your CC&R provision is vague or ambiguous, a court will interpret it in favor of the homeowner's free use of their property. 'Maintain your yard in good condition' is harder to enforce than 'Lawn height shall not exceed 8 inches.' The more specific your provision, the stronger your enforcement position.",
        },
        {
          type: "comparison-table",
          headers: ["Element", "What Gets You in Trouble", "What Holds Up in Court"],
          rows: [
            ["Description", "Yard looks terrible", "Front lawn exceeds 8 inches in height; violation of Declaration Section 5.3(a)"],
            ["Photo", "Blurry photo, no context", "Date-stamped photo showing house number and specific violation"],
            ["Date", "Sometime last week", "March 12, 2026 at approximately 2:30 PM"],
            ["Observer", "Someone on the board saw it", "Board Member Jane Smith during scheduled community inspection"],
            ["Provision", "Against the rules", "Declaration Section 5.3(a): 'All owners shall maintain landscaping in a neat and attractive condition'"],
          ],
        },
        {
          type: "prose",
          html: "Every violation should have its own file containing: the initial report, the specific CC&R section cited, date-stamped photographs taken from public areas, all correspondence, hearing minutes, and the final disposition. This file is your evidence trail. It is what your attorney will use if the matter escalates. And here is the critical point many boards miss — you must enforce consistently. If you enforce against one homeowner but ignore the same violation by five others, you have just handed every future violator the 'selective enforcement' defense.",
        },
        {
          type: "scenario",
          title: "The Selective Enforcement Trap",
          situation: "Riverwalk HOA has a CC&R provision prohibiting fences taller than 6 feet. Over five years, six homeowners built 7-foot fences and the board took no action. When a seventh homeowner does the same, the board finally sends a violation notice.",
          question: "Does the seventh homeowner have a valid defense? What should the board have done differently?",
          revealText: "The homeowner raises the selective enforcement defense — and it's a strong one. Because the board knowingly allowed six prior violations, a court may find the board has waived its right to enforce, or at minimum must begin enforcement against all violators simultaneously. The takeaway: enforce early, enforce consistently, or risk losing the ability to enforce at all.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Never Trespass to Document",
          body: "All observations and photographs must be taken from public areas — streets, sidewalks, or common areas. Never enter a homeowner's backyard or private property without permission to photograph a violation. Never use hidden cameras or surveillance targeting a specific homeowner. The privacy liability can far exceed the value of the enforcement action.",
        },
        {
          type: "prose",
          html: "Think of documentation as building a case file, because that is exactly what it may become. Every photograph, every date, every citation to a CC&R section is a brick in the wall of your enforcement position. Build it right from the start, and you will rarely have problems down the road.",
        },
      ],
    },
  });

  // ── Module 2, Slide 2: The Notice, Hearing & Fine Process ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[1].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "The Notice, Hearing & Fine Process",
        },
        {
          type: "prose",
          html: "This is where most associations get into trouble — and it's completely preventable. Chapter 209 lays out a clear, step-by-step process that <strong>must</strong> be followed before levying a fine or taking enforcement action. Skip even one step, and the entire enforcement action can be thrown out in court.",
        },
        {
          type: "timeline",
          title: "The Chapter 209 Enforcement Process — Follow Every Step",
          steps: [
            {
              title: "Send First Written Notice (Certified or Verified Mail)",
              description: "Describe the specific violation, cite the CC&R provision, and give the homeowner a reasonable time to cure. This notice MUST be sent by certified or verified mail — regular mail, email, or a door notice does not satisfy the statute.",
            },
            {
              title: "Allow a Reasonable Cure Period",
              description: "The homeowner must be given a reasonable time to cure the violation (for curable violations). Document whether it is cured during this period. Note: the owner also has 30 days from the notice to request a hearing to contest whether a violation occurred.",
            },
            {
              title: "Send Notice of Hearing (If Not Cured)",
              description: "If the violation continues and/or a hearing is requested, send a certified or verified mail notice informing the homeowner of a hearing date, time, and location, and their right to attend and present their case.",
            },
            {
              title: "Conduct the Hearing",
              description: "Present your evidence. Let the homeowner respond. Take detailed minutes. Even if the homeowner does not attend, you may proceed — the statute requires you to provide the opportunity, not to guarantee attendance.",
            },
            {
              title: "Issue Written Decision",
              description: "After deliberation, send the homeowner a written decision including findings, the fine amount, and the CC&R provision violated. Send by certified or verified mail.",
            },
          ],
        },
        {
          type: "scenario",
          title: "The Notice That Got Everything Wrong",
          situation: "Meadowbrook POA sends a homeowner this notice: 'Your property is not in compliance with community standards. Please correct the situation within 10 days or fines will be assessed.' Looks official, right?",
          question: "How many things are wrong with this notice under Chapter 209? Would a fine based on it hold up?",
          revealText: "This notice fails on every level: (1) doesn't identify the specific violation, (2) doesn't cite a CC&R provision, (3) gives only 10 days — which is unlikely to be a 'reasonable time' to cure, (4) threatens fines without mentioning the owner's right to request a hearing, and (5) was sent by regular mail instead of certified or verified mail. Any fine based on this notice would be thrown out immediately. Always use a standardized template reviewed by the association's attorney.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Fine Authority & Foreclosure Limits",
          body: "Fine authority must come from the CC&Rs or bylaws — a board can't create it from thin air. And here's a critical limitation: under § 209.009, an association CANNOT foreclose on a property for unpaid fines alone. Foreclosure is only for unpaid assessments. A homeowner with $5,000 in fines and $0 in assessments? The only option is a civil lawsuit.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Certified or Verified Mail Is Not Optional",
          body: "Associations have lost enforcement actions because they sent violation notices by email or regular mail. Chapter 209 requires certified or verified mail. Keep the receipts in the violation file — they're proof the law was followed. No receipt = no proof = no enforcement.",
        },
        {
          type: "prose",
          html: "Follow the process. Every step, every time. It takes more effort up front, but it protects your association from costly legal challenges. Now let's test your understanding of the enforcement process.",
        },
      ],
    },
  });

  // ── Module 2, Quiz ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m2Lessons[2].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Module 2 Quiz",
        },
        {
          type: "prose",
          html: "Let's make sure you understand the enforcement process before we move on to pre-lawsuit strategies.",
        },
        {
          type: "knowledge-check",
          question: "Your HOA sends a violation notice on March 1 giving the homeowner until March 15 to cure. The notice was sent by certified mail and cites the correct CC&R provision. Is this notice compliant with Chapter 209?",
          options: [
            "Yes — two weeks is a reasonable cure period and the notice was properly sent by certified mail.",
            "No — two weeks is unlikely to be considered a 'reasonable time' to cure under Chapter 209, and the notice must also inform the owner of their right to request a hearing within 30 days.",
            "Yes — as long as the CC&Rs allow a shorter cure period.",
            "It depends on the severity of the violation.",
          ],
          correctIndex: 1,
          gateNext: true,
        },
        {
          type: "checkpoint",
          question: "Under Texas Property Code Chapter 209, how long does a homeowner have to request a hearing after receiving a violation notice?",
          options: [
            "10 days",
            "15 days",
            "30 days",
            "60 days",
          ],
          correctIndex: 2,
          gateNext: true,
        },
      ],
    },
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 3: Pre-Lawsuit, Counsel & Alternatives
  // ═══════════════════════════════════════════════════════════════════════

  // ── Module 3, Slide 1: Evidence, Escalation & Knowing When to Act ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[0].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Evidence, Escalation & Knowing When to Act",
        },
        {
          type: "prose",
          html: "Good news: most violations resolve themselves through the standard notice-and-cure process. But when a homeowner refuses to comply, retains an attorney, or raises complex legal defenses, the association needs to know when to escalate — and the evidence needs to be in order <em>before</em> that happens. The time to build the case file is at the beginning, not mid-dispute.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "The Litigation Hold — Do Not Destroy Evidence",
          body: "Once you reasonably anticipate that a matter may result in litigation, you have a legal duty to preserve all relevant evidence. This means emails, text messages, photographs, meeting minutes, and correspondence — all of it. Deleting records after a dispute arises can constitute spoliation of evidence, and a court may instruct the jury to assume the destroyed evidence was unfavorable to your association. Issue a litigation hold to your board, management company, and anyone with relevant records.",
        },
        {
          type: "comparison-table",
          headers: ["Factor", "Handle Internally", "Call Your Attorney"],
          rows: [
            ["Homeowner response", "Communicating, attempting to cure", "Unresponsive, hostile, or has retained counsel"],
            ["Violation type", "Minor aesthetic or procedural issue", "Safety hazard, structural, or commercial use"],
            ["Legal complexity", "Clear CC&R provision, straightforward facts", "Fair housing, disability, constitutional claims"],
            ["Financial exposure", "Low — routine fine matter", "Significant liability, precedent-setting for community"],
            ["Fines paid but violation continues", "N/A", "Need injunctive relief (court order to stop the conduct)"],
            ["Homeowner threatens lawsuit", "N/A", "Immediately consult counsel"],
          ],
        },
        {
          type: "prose",
          html: "Here's a common mistake: assuming a paid fine means the violation is resolved. It doesn't. If a homeowner pays every fine but keeps running a commercial business out of their garage, fines aren't working. The next step is <strong>injunctive relief</strong> — a court order requiring the homeowner to actually stop. That takes legal counsel and likely litigation.",
        },
        {
          type: "scenario",
          title: "The Daycare Dilemma — When It's Not Black and White",
          situation: "Heritage Hills POA has a homeowner running an in-home daycare, in apparent violation of Section 3.1 prohibiting 'commercial use.' The board sent notice, held a hearing, and assessed $1,500 in fines. The homeowner argues a small in-home daycare isn't 'commercial use' and has a county home occupation permit to prove it.",
          question: "Should the board keep handling this internally, or is it time to bring in legal counsel? What factors matter here?",
          revealText: "This is a case where both sides have a reasonable argument. 'Commercial use' is ambiguous when applied to a small daycare. The homeowner has a government permit that complicates the association's position. The violation is ongoing despite fines. And whatever the board decides sets a precedent for every future home occupation dispute. This is exactly when to bring in legal counsel — don't try to handle it alone.",
        },
        {
          type: "callout",
          variant: "info",
          title: "The Cost-Benefit Check",
          body: "Before escalating, do an honest cost-benefit analysis. Legal action typically costs $10,000-$50,000+. Compare that against the fine amount, the community impact, and the precedent value. Sometimes a negotiated compromise is the smarter play — even if you have the stronger legal position. Your attorney can help you evaluate this tradeoff.",
        },
        {
          type: "prose",
          html: "Build your evidence from day one. Escalate thoughtfully, not reactively. And when you do escalate, give your attorney a complete, organized case file — every notice, every photograph, every piece of correspondence. The more prepared you are, the more efficiently your attorney can advise you, and the less it will cost your association.",
        },
      ],
    },
  });

  // ── Module 3, Slide 2: ADR, Mediation & Working with Counsel ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[1].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "ADR, Mediation & Working with Counsel",
        },
        {
          type: "prose",
          html: "Before filing a lawsuit, Texas law requires one more step: a written offer of <strong>Alternative Dispute Resolution (ADR)</strong>. The homeowner gets 30 days to accept. Skip this, and a court can dismiss the entire lawsuit. But here's the thing — ADR isn't just a legal checkbox. Mediation actually resolves more HOA disputes than litigation does, at a fraction of the cost.",
        },
        {
          type: "statute-callout",
          statute: "Tex. Prop. Code § 209.00593",
          summary: "Before filing suit against a property owner (other than for unpaid assessments), the association must make a written offer to resolve the dispute through ADR. The homeowner has 30 days to accept. If they decline or do not respond, you have satisfied the prerequisite to filing suit. Send this offer by certified or verified mail and keep the receipt — you must be able to prove you completed this step.",
          appliesTo: ["HOA", "POA"],
        },
        {
          type: "comparison-table",
          headers: ["", "Mediation", "Arbitration", "Litigation"],
          rows: [
            ["Who decides?", "You and the homeowner (mediator facilitates)", "Arbitrator decides", "Judge or jury decides"],
            ["Binding?", "Only if both parties agree to a settlement", "Yes — limited appeal rights", "Yes — full appeal rights"],
            ["Typical cost", "$500 - $3,000", "$3,000 - $15,000", "$10,000 - $100,000+"],
            ["Timeline", "1-3 months", "3-6 months", "12-36 months"],
            ["Confidential?", "Yes", "Usually yes", "No — public record"],
            ["Best for", "Preserving community relationships", "Clear-cut disputes needing a final ruling", "Complex cases or when injunction needed"],
          ],
        },
        {
          type: "scenario",
          title: "The $2,000 Solution vs. the $50,000 Lawsuit",
          situation: "A homeowner built an enclosed patio without architectural approval. The board assessed $4,500 in fines. The homeowner refused to remove it, citing selective enforcement (similar structures exist nearby). After a year of back-and-forth going nowhere, both sides agreed to mediation.",
          question: "What kind of creative solution could mediation produce that a courtroom couldn't? Is the cost difference worth it?",
          revealText: "The mediator helped them reach a creative deal: the homeowner submits an after-the-fact architectural review, modifies the patio to meet setback requirements, and pays a reduced $1,500 fine. Total mediation cost: $2,000. The litigation alternative? $25,000-$50,000 with an uncertain outcome — and everyone still has to live in the same neighborhood afterward.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Working Effectively with Your Attorney",
          body: "The association's attorney represents the association as an entity — not individual board members. When engaging counsel, provide a complete case file: all notices, correspondence, photographs, hearing minutes, and the specific CC&R provisions at issue. Preventive advice is the most cost-effective: an hour of attorney time reviewing a notice before it goes out is far cheaper than litigating a defective enforcement action.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Protect Attorney-Client Privilege",
          body: "Communications between the board and the association's attorney are privileged and confidential. If a board member discloses legal advice to the homeowner or community — in an open meeting, an email, or a casual conversation — that privilege can be waived. The homeowner's attorney could then use that advice against the association in court. Legal strategy discussions should only occur in closed executive session.",
        },
        {
          type: "prose",
          html: "ADR isn't a sign of weakness — it's smart governance. Associations that embrace mediation resolve disputes faster, cheaper, and with less community fallout. And when litigation does become necessary, having followed every procedural step — documentation, notice, hearing, ADR offer — creates the strongest possible position.",
        },
      ],
    },
  });

  // ── Module 3, Quiz ──
  await db.lessonContentVersion.create({
    data: {
      lessonId: m3Lessons[2].id,
      version: 1,
      publishedAt: NOW,
      content: [
        {
          type: "heading",
          level: 1,
          text: "Module 3 Quiz",
        },
        {
          type: "prose",
          html: "One final question before you move on to the case study assessment.",
        },
        {
          type: "knowledge-check",
          question: "A homeowner has paid all fines assessed by the board but continues to operate a commercial business out of their garage in violation of the CC&Rs. The board wants to stop the activity. What is the most appropriate next step?",
          options: [
            "The matter is resolved because the homeowner paid all fines — the association has no further recourse.",
            "Continue assessing larger and larger fines until the homeowner stops.",
            "Consult with the association's attorney about seeking injunctive relief — a court order requiring the homeowner to cease the prohibited commercial activity.",
            "Revoke the homeowner's membership in the association.",
          ],
          correctIndex: 2,
          gateNext: true,
        },
        {
          type: "checkpoint",
          question: "Under Chapter 209, what must an association do before filing a lawsuit against a homeowner for a covenant violation?",
          options: [
            "Obtain a court order authorizing the lawsuit.",
            "Make a written offer of alternative dispute resolution and wait at least 30 days.",
            "Hold a vote of the full membership to authorize litigation.",
            "File a complaint with the Texas Real Estate Commission.",
          ],
          correctIndex: 1,
          gateNext: true,
        },
      ],
    },
  });

  // ─── 8. Assessment Questions ─────────────────────────────────────────
  console.log("Creating assessment questions...");

  const scenario =
    "You are advising the board of Green Valley HOA. A neighbor has complained that the homeowner at 123 Oak Street has been operating a commercial auto repair business out of their garage for the past 6 months. Customers come and go daily, and there is signage visible from the street. Section 4.2 of the CC&Rs states: 'No lot shall be used, in whole or in part, for any commercial, business, or professional purpose.' The board has never addressed a commercial use violation before and wants to know how to proceed.";

  const q1 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "What should the board's FIRST step be upon receiving this complaint?",
      scenario,
      sortOrder: 1,
      explanation:
        "Before taking any enforcement action, the board must verify that a specific, enforceable CC&R provision has been violated. Here, Section 4.2 clearly prohibits commercial use. The board should then document the violation with date-stamped photographs from public areas and send a formal violation notice via certified or verified mail citing Section 4.2, with a reasonable time to cure — as required by Chapter 209. The owner also has 30 days to request a hearing. You cannot skip straight to fines, litigation, or informal conversations when a formal enforcement process is mandated by statute.",
      answerOptions: {
        create: [
          { text: "File a lawsuit to immediately stop the commercial activity", isCorrect: false, sortOrder: 0 },
          {
            text: "Verify the CC&R provision, document the violation, and send a formal written notice via certified or verified mail citing Section 4.2 with a reasonable time to cure",
            isCorrect: true,
            sortOrder: 1,
          },
          { text: "Impose a fine at the next board meeting to send a strong message", isCorrect: false, sortOrder: 2 },
          { text: "Have a board member knock on the door and ask the homeowner to stop", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  const q2 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "The board sends proper notice. After a reasonable cure period, the homeowner has not cured the violation. What must happen BEFORE the board can levy a fine?",
      scenario,
      sortOrder: 2,
      explanation:
        "Under § 209.007, after the cure period expires without compliance, the association must send a second notice informing the homeowner of a hearing before the board or a board-appointed committee. The homeowner must be given the opportunity to attend and present their case. Only after this hearing can the board levy a fine. Skipping the hearing — even if the violation is obvious — makes the fine void and exposes the association to legal challenge.",
      answerOptions: {
        create: [
          { text: "Nothing further is required — the 30-day notice satisfies Chapter 209 and fines can be assessed immediately", isCorrect: false, sortOrder: 0 },
          { text: "The board must hold a vote of all homeowners to authorize the fine", isCorrect: false, sortOrder: 1 },
          {
            text: "The board must provide notice of a hearing where the homeowner can attend and present their side before any fine is levied",
            isCorrect: true,
            sortOrder: 2,
          },
          { text: "The board must obtain approval from the association's attorney before assessing any fine", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  const q3 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "At the hearing, the homeowner argues that Section 4.2 does not apply because it says 'commercial, business, or professional purpose' and auto repair is a 'trade,' not a 'business.' How should the board evaluate this defense?",
      scenario,
      sortOrder: 3,
      explanation:
        "Section 4.2 broadly prohibits commercial, business, and professional use. Operating an auto repair shop with customers, signage, and daily traffic clearly falls within a general prohibition on commercial activity — regardless of how the homeowner labels it. Texas courts look at the substance of the activity, not the label. The board should find the violation proven. However, while Texas courts construe ambiguous covenants in favor of free use of property, this provision is not ambiguous — it is a broad prohibition that clearly covers the conduct described.",
      answerOptions: {
        create: [
          {
            text: "Accept the homeowner's argument — since 'trade' is not specifically listed, the provision does not apply",
            isCorrect: false,
            sortOrder: 0,
          },
          {
            text: "Recognize that the broad language ('commercial, business, or professional purpose') clearly covers operating an auto repair shop with customers and signage, regardless of how the homeowner labels the activity",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            text: "Table the matter and amend the CC&Rs to specifically list auto repair before proceeding",
            isCorrect: false,
            sortOrder: 2,
          },
          { text: "Dismiss the case because Texas courts always construe covenants in favor of the homeowner", isCorrect: false, sortOrder: 3 },
        ],
      },
    },
  });

  const q4 = await db.question.create({
    data: {
      courseId: course.id,
      stem: "After a proper hearing, the board levies a fine. The homeowner pays the fine but continues operating the auto repair business. The board wants to stop the activity permanently. What is the correct next step?",
      scenario,
      sortOrder: 4,
      explanation:
        "Payment of fines does not cure an ongoing violation — fines are a collection remedy, not a compliance remedy. To actually stop the commercial activity, the association needs injunctive relief (a court order). But under § 209.00593, before filing suit, the association must first make a written offer of ADR (mediation or arbitration) and give the homeowner 30 days to accept. Foreclosure is not available because § 209.009 prohibits foreclosure for fines alone. Suspending utilities is illegal.",
      answerOptions: {
        create: [
          { text: "Foreclose on the property to force the homeowner to comply", isCorrect: false, sortOrder: 0 },
          {
            text: "Make a written offer of alternative dispute resolution as required by § 209.00593, and if declined, consult counsel about seeking injunctive relief in court",
            isCorrect: true,
            sortOrder: 1,
          },
          { text: "Suspend the homeowner's water and electricity until they comply", isCorrect: false, sortOrder: 2 },
          { text: "Continue assessing daily fines — eventually the homeowner will stop", isCorrect: false, sortOrder: 3 },
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
      score: 4,
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
        metadata: { score: 4 },
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
        metadata: { courseTitle: "CCR Enforcement Training", modules: 3, lessons: 9 },
        createdAt: new Date("2026-01-15T14:00:00Z"),
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("  - 1 Super Admin");
  console.log("  - 2 Organizations (HOA + COA)");
  console.log("  - 2 Org Admins");
  console.log("  - 3 Learners (various progress stages)");
  console.log("  - 1 Course with 3 Modules and 9 Lessons (2 slides + 1 quiz each)");
  console.log("  - 9 Lesson Content Versions with expert attorney teaching content");
  console.log("  - 4 Assessment Questions");
  console.log("  - Progress records, certificate, and audit logs");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
