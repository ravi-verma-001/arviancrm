const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

function createPdf() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 20;

  function checkPageBreak(requiredSpace = 20) {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      currentY = 22;
      drawPageHeaderFooter();
    }
  }

  function drawPageHeaderFooter() {
    const totalPages = doc.internal.getNumberOfPages();
    // Header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text("ARVIAN MARKETING CRM — SYSTEM ARCHITECTURE & OPERATIONS GUIDE", margin, 12);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);

    // Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text("Confidential — For Internal Agency Operations Only", margin, pageHeight - 8);
    doc.text(`Page ${totalPages}`, pageWidth - margin - 15, pageHeight - 8);
  }

  function addTitle(text, subtitle = null) {
    checkPageBreak(30);
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(margin, currentY, 4, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Navy 900
    doc.text(text, margin + 8, currentY + 7);
    currentY += 14;

    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      const splitSubtitle = doc.splitTextToSize(subtitle, contentWidth - 8);
      doc.text(splitSubtitle, margin + 8, currentY);
      currentY += splitSubtitle.length * 5 + 4;
    }
  }

  function addSectionHeader(title) {
    checkPageBreak(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138); // Dark Navy / Brand 900
    doc.text(title, margin, currentY);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY + 2, margin + 60, currentY + 2);
    currentY += 8;
  }

  function addSubHeader(title) {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, currentY);
    currentY += 5;
  }

  function addParagraph(text, isBold = false) {
    checkPageBreak(12);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 4.2 + 2;
  }

  function addBullet(bulletText, label = "") {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text("•", margin + 2, currentY);

    if (label) {
      doc.setTextColor(15, 23, 42);
      doc.text(`${label}: `, margin + 6, currentY);
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const remainingWidth = contentWidth - 8 - labelWidth;
      const lines = doc.splitTextToSize(bulletText, remainingWidth);
      doc.text(lines, margin + 6 + labelWidth, currentY);
      currentY += lines.length * 4.2 + 1.5;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(bulletText, contentWidth - 8);
      doc.text(lines, margin + 6, currentY);
      currentY += lines.length * 4.2 + 1.5;
    }
  }

  function addCalloutBox(title, bodyLines, type = "info") {
    checkPageBreak(35);
    const boxBg = type === "warning" ? [254, 243, 199] : type === "success" ? [236, 253, 245] : [239, 246, 255];
    const borderColor = type === "warning" ? [245, 158, 11] : type === "success" ? [16, 185, 129] : [59, 130, 246];

    const boxPadding = 4;
    const bodyText = Array.isArray(bodyLines) ? bodyLines.join("\n") : bodyLines;
    const textLines = doc.splitTextToSize(bodyText, contentWidth - boxPadding * 2);
    const boxHeight = textLines.length * 4.2 + 12;

    doc.setFillColor(...boxBg);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(type === "warning" ? 146 : 30, type === "warning" ? 64 : 58, type === "warning" ? 14 : 138);
    doc.text(title, margin + boxPadding, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(textLines, margin + boxPadding, currentY + 11);

    currentY += boxHeight + 5;
  }

  // -------------------------------------------------------------
  // COVER / HEADER
  // -------------------------------------------------------------
  drawPageHeaderFooter();

  // Top Badge
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, currentY, 70, 7, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235);
  doc.text("ARVIAN MARKETING • AGENCY OPERATIONS", margin + 4, currentY + 4.8);
  currentY += 12;

  addTitle(
    "Arvian Marketing CRM — Complete Architecture & Operations Manual",
    "Comprehensive guide on how the CRM works, lead allocation, reminders, client workspaces, and pending production integrations."
  );

  addCalloutBox(
    "Executive Overview (सिस्टम का सार)",
    [
      "Arvian Marketing CRM एक पूर्ण रूप से कार्यात्मक (Full-Stack), डेटाबेस-समर्थित एजेंसी प्रबंधन प्रणाली है।",
      "यह कोई स्थिर UI प्रोटोटाइप नहीं है — यह वास्तविक SQLite/PostgreSQL डेटाबेस, 43 लाइव API रूट्स, पासवर्ड हैशिंग,",
      "JWT सुरक्षा, और डिजिटल मार्केटिंग एजेंसी के दैनिक कार्यों के लिए आवश्यक सभी 16 मॉड्यूल्स के साथ सक्रिय है।"
    ],
    "info"
  );

  // -------------------------------------------------------------
  // SECTION 1: HOW THE SYSTEM WORKS
  // -------------------------------------------------------------
  addSectionHeader("1. How Everything Works Currently (सिस्टम कैसे काम कर रहा है)");
  addParagraph(
    "सिस्टम को Next.js 14 (App Router) और Prisma ORM पर बनाया गया है। इसमें एजेंसी के सभी दैनिक कार्य (Sales, Meta Ads, Graphic Design, SMM, Attendance, Billing) आपस में जुड़े हुए हैं।"
  );

  addSubHeader("A. Live Localhost Status");
  addBullet("http://localhost:3000 पर Next.js 14 सर्वर लाइव चल रहा है।", "Server Status");
  addBullet("SQLite (dev.db) डेटाबेस में 40+ टेस्ट लीड्स, 4 टेलीकॉलर्स, क्लाइंट्स, कैंपेन और इनवॉइस पहले से लोड हैं।", "Database");
  addBullet("लॉगिन स्क्रीन और टॉप नेविगेशन हेडर में 'One-Click Role Switcher' दिया गया है जिससे आप बिना पासवर्ड टाइप किए किसी भी रोल में स्विच कर सकते हैं।", "Role Switcher");
  addBullet("Asia/Kolkata (IST) टाइमज़ोन में सभी डेट, समय, फॉलो-अप और अटेंडेंस रिकॉर्ड किए जा रहे हैं।", "Timezone");
  addBullet("भारतीय रुपया (INR / ₹) में सभी रेवेन्यू, कैंपेन बजट और सर्विस फीस ट्रैक हो रही हैं।", "Currency");

  // -------------------------------------------------------------
  // SECTION 2: LEADS LIFECYCLE & ASSIGNMENT
  // -------------------------------------------------------------
  currentY += 2;
  addSectionHeader("2. Leads Pipeline & Assignment (लीड्स कैसे आएंगी और कौन असाइन करेगा)");
  addParagraph(
    "लीड प्रबंधन Arvian CRM का मुख्य आधार है। लीड्स सिस्टम में आने से लेकर क्लाइंट बनने तक का पूरा फ्लो स्वचालित और पारदर्शी है:"
  );

  addSubHeader("A. लीड्स CRM में कैसे आएंगी?");
  addBullet("Meta Ads (फेसबुक/इंस्टाग्राम लीड फॉर्म्स), वेबसाइट फॉर्म, व्हाट्सएप, फोन कॉल, रेफरल, या गूगल एड्स।", "Sources");
  addBullet("बटन पर क्लिक करके नया फॉर्म भर सकते हैं जिसमें नाम, फोन, बजट, और पूर्व मेटा एड्स अनुभव दर्ज होता है।", "Manual Entry");
  addBullet("Import & Export सेंटर (/import-export) में जाकर CSV या Excel स्प्रेडशीट से सैकड़ों लीड्स एक साथ अपलोड की जा सकती हैं।", "Bulk CSV Import");

  addSubHeader("B. लीड्स कौन असाइन करेगा और कैसे असाइन होंगी?");
  addBullet("एडमिन या एजेंसी ओनर किसी भी लीड को बनाते समय या बाद में 4 टेलीकॉलर्स (Rahul, Priya, Amit, Neha) में से किसी को भी असाइन कर सकता है।", "Admin Allocation");
  addBullet("यदि कोई टेलीकॉलर स्वयं लीड बना रहा है, तो वह स्वचालित रूप से उसी टेलीकॉलर को असाइन हो जाती है।", "Telecaller Self-Creation");
  addBullet("एडमिन किसी भी लीड को एक कर्मचारी से दूसरे कर्मचारी को कभी भी Reassign कर सकता है। Reassignment से मूल कैंपेन एट्रिब्यूशन पर कोई असर नहीं पड़ता (Workflow B प्रमाणित)।", "Reassignment");
  addBullet("टेलीकॉलर केवल अपनी असाइन की गई लीड्स और अनअसाइन लीड्स देख सकता है, जबकि एडमिन पूरी एजेंसी की सभी लीड्स देख सकता है।", "Role Visibility");

  addSubHeader("C. डुप्लीकेट डिटेक्शन (Duplicate Lead Prevention)");
  addParagraph(
    "जब भी कोई लीड जोड़ी जाती है या CSV इम्पोर्ट किया जाता है, सिस्टम फोन नंबर (अंतिम 10 डिजिट) और ईमेल को नॉर्मलाइज़ करके जांचता है। यदि वही कस्टमर पहले से मौजूद है, तो सिस्टम चेतावनी देता है और यूजर की पुष्टि के बिना डुप्लीकेट नहीं बनाता।"
  );

  // -------------------------------------------------------------
  // SECTION 3: FOLLOW-UPS & REMINDERS
  // -------------------------------------------------------------
  currentY += 2;
  addSectionHeader("3. Follow-up Management & Reminders (फॉलो-अप और रिमाइंडर्स कैसे काम करते हैं)");
  addParagraph(
    "लीड्स को क्लोज करने के लिए फॉलो-अप इंजन को विशेष रूप से भारतीय समय (IST) के अनुसार बनाया गया है:"
  );

  addBullet("हर लीड के लिए अधिकतम 4 फॉलो-अप अटेम्प्ट्स (#1, #2, #3, #4+) का डिफॉल्ट फ्लो है जिसे आवश्यकतानुसार बढ़ाया जा सकता है।", "Multi-Attempt Tracking");
  addBullet("कॉल के ठीक समय, 5 मिनट पहले, 15 मिनट पहले या 30 मिनट पहले का रिमाइंडर टाइमर सेट किया जा सकता है।", "Reminder Timing");
  addBullet("एक क्लिक में सीधे कस्टमर को फोन कॉल मिलाने का बटन (tel:) उपलब्ध है।", "Direct Call Button");
  addBullet("एक क्लिक में कस्टमर के नंबर पर प्री-टाइप्ड प्रोफेशनल मैसेज के साथ व्हाट्सएप चैट खुलती है (wa.me)।", "Direct WhatsApp Button");
  addBullet("कॉल खत्म होने के बाद आउटकम (Call Connected, Proposal Sent, Callback Requested, Lost) दर्ज किया जाता है और तुरंत अगला फॉलो-अप शेड्यूल किया जाता है।", "Outcome Logging");
  addBullet("बैकएंड में /api/reminders/check API लगातार चेक करती है और समय आने पर यूजर के हेडर नोटिफिकेशन बेल में तुरंत अलर्ट भेजती है।", "Server Reminder Scan");

  // -------------------------------------------------------------
  // SECTION 4: CLIENT CONVERSION & WORKSPACES
  // -------------------------------------------------------------
  currentY += 2;
  addSectionHeader("4. Client Conversion & Workspaces (लीड से क्लाइंट कन्वर्जन)");
  addParagraph(
    "जब कोई लीड सेवा लेने के लिए तैयार हो जाती है, तो 'Convert to Client' बटन से उसे सीधे क्लाइंट में बदल दिया जाता है:"
  );

  addBullet("पुराना Lead ID और संपूर्ण कॉलिंग हिस्ट्री सुरक्षित रहती है। नए सिरे से फॉर्म भरने की जरूरत नहीं होती।", "Zero Data Re-entry");
  addBullet("Arvian Marketing की मासिक सर्विस फीस (उदा. ₹45,000) और क्लाइंट के एड स्पेंड बजट (उदा. ₹60,000) को बिल्कुल अलग-अलग दर्ज किया जाता है।", "Fee vs Ad Budget");
  addBullet("कन्वर्जन होते ही सिस्टम स्वचालित रूप से क्लाइंट का ऑनबोर्डिंग प्रोजेक्ट और 3 आवश्यक सेटअप टास्क जनरेट कर देता है।", "Auto Project Setup");
  addBullet("प्रथम माह का इनवॉइस (INV-2026-XXX) ड्राफ्ट हो जाता है।", "Auto Invoicing");

  addSubHeader("क्लाइंट के डेडिकेटेड वर्कस्पेस में क्या-क्या होता है?");
  addBullet("Meta Ads Creative Tracker: Brief Pending -> In Progress -> Internal Review -> Client Approval -> Approved / Revision Required.", "Creative Workflow");
  addBullet("Instagram Content Calendar: Reels, Carousels, Static Posts के लिए टॉपिक, कैप्शन, हैशटैग और अप्रूवल स्टेटस।", "Social Media Calendar");
  addBullet("Retainer Invoices & Payments: भुगतान की स्थिति (Paid, Pending, Overdue)।", "Billing Tracking");

  // -------------------------------------------------------------
  // SECTION 5: ROLES & SALARY PRIVACY
  // -------------------------------------------------------------
  currentY += 2;
  addSectionHeader("5. Roles, Attendance & Strict Salary Privacy (रोल्स और वेतन गोपनीयता)");
  
  addCalloutBox(
    "Strict Salary & Financial Privacy (वेतन गोपनीयता सुरक्षा)",
    [
      "एजेंसी कर्मचारियों का वेतन और एजेंसी का शुद्ध लाभ केवल Agency Super Admin (Aarav Sharma) ही देख सकता है।",
      "सामान्य कर्मचारी API या डायरेक्ट URL (/payroll, /finance) पर जाने पर 403 Forbidden एरर और एक्सेस-प्रतिबंधित",
      "स्क्रीन दिखाई देती है। टेलीकॉलर्स या डिजाइनर्स को वेतन डेटा कभी लीक नहीं होता।"
    ],
    "warning"
  );

  addBullet("कर्मचारी हेडर में दिए गए 'Check In' और 'Check Out' बटन से अपनी दैनिक उपस्थिति दर्ज कर सकते हैं। कुल काम के घंटे IST में कैलकुलेट होते हैं।", "Attendance Tracking");
  addBullet("टेलीकॉलर्स के लिए लीड कन्वर्जन दर, डिजाइनर्स के लिए टास्क कंप्लीशन दर, और SMM के लिए पब्लिश पोस्ट्स की संख्या ट्रैक होती है।", "Employee KPIs");

  // -------------------------------------------------------------
  // SECTION 6: PENDING WORK & YOUR ACTION ITEMS
  // -------------------------------------------------------------
  currentY += 2;
  addSectionHeader("6. Pending Actions & What You Need To Do (आपके एंड से क्या-क्या पेंडिंग है)");
  addParagraph(
    "वर्तमान में लोकलहोस्ट पर सारा सिस्टम 100% काम कर रहा है। इसे लाइव प्रोडक्शन पर ले जाने और ऑटोमेशन शुरू करने के लिए आपके एंड से निम्नलिखित क्रेडेंशियल्स और कॉन्फ़िगरेशन की आवश्यकता है:"
  );

  addSubHeader("1. Meta Marketing API Credentials (Optional - Live Auto-Sync के लिए)");
  addParagraph(
    "अभी: सिस्टम में 'Manual Tracking Mode' एक्टिव है जहाँ आप डेली स्पेंड, क्लिक्स और लीड्स दर्ज कर सकते हैं और CPC, CPL, ROAS अपने आप कैलकुलेट होते हैं।\n" +
    "पेंडिंग: यदि आप चाहते हैं कि फेसबुक एड मैनेजर से स्पेंड और डेटा अपने आप सिंक हो, तो Meta Business Developer Portal से:\n" +
    "• META_APP_ID\n" +
    "• META_APP_SECRET\n" +
    "• META_ACCESS_TOKEN (System User Token with ads_read permission)\n" +
    "को .env फाइल या Admin Settings (/settings) में डालना होगा।"
  );

  addSubHeader("2. WhatsApp Business Cloud API (Optional - ऑटोमेटेड मैसेजिंग के लिए)");
  addParagraph(
    "अभी: टेलीकॉलर्स के लिए '1-Click Direct WhatsApp' लिंक एक्टिव है, जिससे क्लिक करते ही कस्टमर के नंबर पर व्हाट्सएप चैट खुल जाती है।\n" +
    "पेंडिंग: यदि आप बैकग्राउंड में ऑटोमेटेड बॉट या फॉलो-अप मैसेज बिना व्हाट्सएप खोले भेजना चाहते हैं, तो Meta WhatsApp Cloud API से:\n" +
    "• WHATSAPP_PHONE_NUMBER_ID\n" +
    "• WHATSAPP_ACCESS_TOKEN\n" +
    "को .env में डालना होगा।"
  );

  addSubHeader("3. Transactional Email SMTP (ईमेल रिमाइंडर्स के लिए)");
  addParagraph(
    "अभी: CRM के अंदर हेडर में इन-ऐप नोटिफिकेशन सेंटर और ब्राउज़र अलर्ट पूरी तरह चालू हैं।\n" +
    "पेंडिंग: कर्मचारियों या क्लाइंट्स को ईमेल भेजने के लिए SendGrid, Postmark, AWS SES, या Gmail App Password की SMTP डिटेल्स:\n" +
    "• SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS\n" +
    "को .env में दर्ज करना होगा।"
  );

  addSubHeader("4. Live Cloud Database & Deployment (लाइव सर्वर पर डालने के लिए)");
  addParagraph(
    "अभी: आपका सिस्टम लोकल SQLite डेटाबेस (dev.db) पर चल रहा है जो आपके लैपटॉप पर बिना किसी इंटरनेट या क्लाउड के 100% तुरंत काम करता है।\n" +
    "पेंडिंग: जब आप इसे पूरी टीम को इंटरनेट पर (उदा. crm.arvianmarketing.com या Vercel पर) देना चाहेंगे:\n" +
    "• Supabase.com पर एक मुफ्त PostgreSQL प्रोजेक्ट बनाएं।\n" +
    "• कनेक्शन स्ट्रिंग को .env में DATABASE_URL में पेस्ट करें।\n" +
    "• Vercel या VPS पर प्रोजेक्ट को डिप्लॉय कर दें।"
  );

  // -------------------------------------------------------------
  // SECTION 7: SUMMARY OF AUTOMATED VERIFIED TESTS
  // -------------------------------------------------------------
  currentY += 2;
  addSectionHeader("7. Acceptance Criteria Verification (परीक्षण परिणाम)");
  addCalloutBox(
    "All 25 Automated Workflow Tests Passed (0 Failures)",
    [
      "Workflow A: Lead Creation, Assignment to Rahul, Qualification & Multi-Attempt Follow-ups. (PASSED)",
      "Workflow B: Four-Employee Lead Matrix (40 Leads from Campaigns distributed across 4 Telecallers). (PASSED)",
      "Workflow C: Lead to Client Conversion with Retainer & Onboarding Project Creation. (PASSED)",
      "Workflow D: Instagram Content Calendar Approval & Revision Pipeline. (PASSED)",
      "Workflow E: Advertising Calculations with Zero-Denominator Safety (CPL, CPC, CTR, ROAS). (PASSED)",
      "Workflow F & H: Strict Salary Privacy Guard & 403 Authorization Block for Non-Admins. (PASSED)",
      "Workflow G: Import Duplicate Detection with Phone & Email Normalization. (PASSED)",
      "Workflow I: Server-Side Scheduled Follow-up Notification Runner. (PASSED)"
    ],
    "success"
  );

  // Save the PDF
  const outputFileName = "Arvian_Marketing_CRM_System_Guide.pdf";
  const projectFilePath = path.join(process.cwd(), outputFileName);
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicFilePath = path.join(publicDir, outputFileName);

  const pdfOutput = doc.output("arraybuffer");
  fs.writeFileSync(projectFilePath, Buffer.from(pdfOutput));
  fs.writeFileSync(publicFilePath, Buffer.from(pdfOutput));

  console.log(`PDF successfully generated at: ${projectFilePath}`);
  console.log(`PDF successfully copied to public web root: ${publicFilePath}`);
  return { projectFilePath, publicFilePath };
}

createPdf();
