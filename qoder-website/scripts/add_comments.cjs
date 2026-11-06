const fs = require('fs');

let html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

const replacements = [
  {
    target: '<header class="style_header__Zwktt',
    comment: '\n  <!-- =========================================\n       1. NAVIGATION HEADER (LOGO, NAV, ACTIONS)\n       ========================================= -->\n  <header class="style_header__Zwktt'
  },
  {
    target: '<section class="HeroSection_heroSection__Ficti"',
    comment: '\n  <!-- =========================================\n       2. HERO SECTION (TITLE, METRIC, DEMO)\n       ========================================= -->\n  <section class="HeroSection_heroSection__Ficti"'
  },
  {
    target: '<section class="ProductShowcase_productShowcase__Q__cE"',
    comment: '\n  <!-- =========================================\n       3. BUILD YOUR WAY (PRODUCT SHOWCASE TABS)\n       ========================================= -->\n  <section id="products" class="ProductShowcase_productShowcase__Q__cE"'
  },
  {
    target: '<section class="AgentIntegration_agentIntegration__uojAN"',
    comment: '\n  <!-- =========================================\n       4. AGENT INTEGRATION (SDK & CLOUD AGENTS)\n       ========================================= -->\n  <section id="agent-integration" class="AgentIntegration_agentIntegration__uojAN"'
  },
  {
    target: '<section class="Card_wakerSection__h3m96"',
    comment: '\n  <!-- =========================================\n       5. QODER WAKE (AUTONOMOUS AI EMPLOYEES)\n       ========================================= -->\n  <section id="qoderwake" class="Card_wakerSection__h3m96"'
  },
  {
    target: '<section class="EnterpriseSection_enterpriseSection__luBfN"',
    comment: '\n  <!-- =========================================\n       6. QODER ENTERPRISE (SECURITY & PLATFORMS)\n       ========================================= -->\n  <section class="EnterpriseSection_enterpriseSection__luBfN"'
  },
  {
    target: '<section class="TestimonialsSection_section__sa6gg"',
    comment: '\n  <!-- =========================================\n       7. TESTIMONIALS & SUCCESS STORIES\n       ========================================= -->\n  <section id="testimonials" class="TestimonialsSection_section__sa6gg"'
  },
  {
    target: '<section class="FAQs_faqsWrap__2Ak5h"',
    comment: '\n  <!-- =========================================\n       8. FREQUENTLY ASKED QUESTIONS (FAQS)\n       ========================================= -->\n  <section id="faq" class="FAQs_faqsWrap__2Ak5h"'
  },
  {
    target: '<footer class="style_footer__z4X_A"',
    comment: '\n  <!-- =========================================\n       9. FOOTER (LINKS, SOCIAL, COPYRIGHT)\n       ========================================= -->\n  <footer class="style_footer__z4X_A"'
  }
];

for (const item of replacements) {
  if (html.includes(item.target)) {
    html = html.replace(item.target, item.comment);
  }
}

fs.writeFileSync('g:/github_all_repo/rea/qoder-website/index.html', html, 'utf8');
console.log('Added clean semantic comments and section IDs to index.html!');
