# Website Critique — Friends of the SF Mandarin School

Reviewed: March 15, 2026
Pages reviewed: Homepage (index.html), About, How to Help

---

## 1. Technical / Web Engineering

### What's working
- Single-page inline CSS/JS keeps deployment dead simple for GitHub Pages — no build step, no dependency management.
- Google Places autocomplete, Mailchimp JSONP, and Google Sheets Apps Script are all solid, low-maintenance choices for a project at this stage.
- Mobile responsiveness is solid across all three pages.

### What needs attention

**Componentize the nav and footer.** You now have three pages with identical nav and footer markup duplicated inline. Every time you add a nav link (like we just did with "About"), you have to edit three files in six places. This will get worse with FAQ, Updates/Blog, and Links & Resources pages. Options:
- **Simplest:** A shared `header.html` and `footer.html` loaded via a small JS `fetch()` + `innerHTML` snippet. No build step needed.
- **Better:** A simple static site generator like [11ty](https://www.11ty.dev/) — still deploys to GitHub Pages, gives you partials/templates, and scales cleanly.
- **Not yet needed:** React, Next.js, or anything with a real build pipeline. This site doesn't need that complexity.

**Shared CSS file.** The three pages share ~80% of the same CSS (variables, nav, footer, typography, animations, responsive breakpoints). A single `styles.css` would eliminate drift and make design changes a one-file edit. The page-specific styles (partnership section, workstream items, etc.) can stay inline or go in small per-page files.

**OG image dimensions are wrong.** The meta tags say `1536x1024` but the actual image is `1200x630`. About page has the same issue. This could cause platforms to render the preview incorrectly.

**Accessibility.** The forms work, but there are no visible `<label>` associations on some inputs (using `placeholder` as the label). Screen readers will struggle. The date of birth dropdowns could use `aria-label` attributes. The color contrast on gold text over cream backgrounds may not meet WCAG AA.

**No favicon.** The site has no favicon — browsers show a generic icon. A small touch that signals professionalism.

**Subscribe form duplication.** The subscribe handler JS is copy-pasted across all three pages. Same with the mobile menu toggle. These are prime candidates for a shared `main.js` file.

**Analytics.** Still not implemented. You're flying blind on traffic, referral sources, and form conversion rates. Cloudflare Web Analytics is free, takes 5 minutes to set up, and requires zero cookies. This should happen before any major outreach push.

### Priority recommendation
Extract shared nav/footer/CSS/JS into separate files now, before building FAQ or Updates pages. The cost of doing it later only goes up.

---

## 2. Organizer & Storytelling Perspective

### What's working
- The homepage narrative arc is strong: urgency (stats banner) → context (why this matters) → credibility (our work) → action (interest form + how to help).
- The About page restructure is a major improvement — leading with the SFUSD partnership establishes this as a real, institutionally-backed effort, not just a parent wishlist.
- "Whatever brings you here, you belong" is a genuinely great line. Inclusive without being performative.
- The stats banner (66 seats / 400 families / countdown) is immediately compelling. Three numbers that tell the whole story.

### What could be stronger

**The homepage hero is passive.** "SFUSD committed to launching a Mandarin immersion K-8 school for the 2027-2028 school year. We are the parents and community members making sure it happens." — This buries the lead. The most powerful framing is the *gap*: 400 families want in, 66 seats exist. Consider leading with the tension, not the institutional statement.

**"Making It Real" timeline beat mentions Liana Szeto** but she's not introduced anywhere else on the site. A visitor who doesn't know her won't know why this matters. Either add context ("founding principal of Alice Fong Yu, the first public Chinese immersion school in the country") or save the name for a future team/supporters section.

**The How to Help page is a dead end.** After reading nine concrete ways to help, there's only an email address. There's no interest form link, no "go back to sign up" CTA, no subscribe prompt. Someone who arrived via direct link (not from the homepage) might leave without converting. Add a CTA section at the bottom similar to the About page's red closing block.

**The "Driving Urgency" card on the homepage feels off.** You've noted this isn't a real workstream — and it reads differently from the other three, which are concrete activities. It's more of a meta-goal. Consider reframing it as "Community Advocacy" or "Public Engagement" — or rolling its message (September 2026 deadline) into the section header copy and keeping just three cards.

**No social proof from outside the org.** The About page has a supporters placeholder, but the homepage has none. A single quote from a Board of Education member, a principal, or a community leader — even just a name and title — would dramatically increase credibility for a first-time visitor.

**No email address on the homepage.** The How to Help page has info@sfmandarinschool.org but the homepage doesn't. For media, potential donors, or SFUSD officials landing on the homepage, there's no way to reach you except through the interest form (which asks for children's names and DOBs — not appropriate for a journalist or official).

### Priority recommendation
Add a CTA to the bottom of How to Help, and get at least one supporter name into the supporters section before major outreach.

---

## 3. Design Perspective

### What's working
- The color palette is warm and distinctive — cream/red/gold feels community-oriented without being childish.
- Typography pairing (Lora + Inter) is excellent. Lora gives warmth and authority, Inter keeps body text clean.
- The charcoal-to-red gradient on subpage headers is a nice touch — sophisticated without being flashy.
- The stats banner is visually strong. Dark gold background, bold numbers, clean layout.

### What could be improved

**The homepage hero is visually heavy.** The left column (headline + subtitle) and the right column (full interest form) compete for attention on desktop. The form has a lot of fields — name, email, address, phone, child name, DOB, two checkboxes, submit button. On first load, it can feel like a wall of inputs. Consider whether the form could start collapsed ("Show your interest →" button that expands the form) or whether some fields could move to a second step.

**Section transitions on the homepage.** The background alternation (charcoal hero → dark gold stats → cream timeline → white cards → red teaser → dark footer) is busy. Six different background colors in one scroll. The cream-to-white transition in particular is very subtle and might read as inconsistent rather than intentional. Consider whether cream-and-white can unify into one.

**The About page "Our Story" section could use a pull quote.** The story highlight style (gold left-border callout) is defined in the CSS but not used in the current content. The line "With immersion, kids don't just study the language — they *live* in it" or "Whatever brings you here, you belong" would work beautifully as a pull quote to break up the text.

**The How to Help cards are text-dense.** Nine items across three columns, each with a bold title and description. On desktop it works, but consider adding subtle visual differentiation — icons, numbered steps, or colored accent bars (like the Our Work cards on the homepage) to help scanning.

**Footer subscribe form.** On mobile, the email input and subscribe button stack vertically, but there's no visual separation from the footer content below. It can feel cramped. A bit more padding or a clearer visual boundary would help.

**Supporters section looks incomplete.** "More supporters coming soon" as the only content reads as a placeholder that shipped. If you're not ready to populate it, consider hiding it until you have at least 2-3 names, or reframing it as "Join the growing list of supporters" with a CTA rather than an empty state.

### Priority recommendation
Use the pull quote style on the About page — it's already built and would immediately improve the reading experience. Consider hiding the supporters section until it's populated.

---

## 4. Opponent's Perspective

Someone opposing this effort — whether a skeptical board member, a parent who prefers the status quo, or a competing interest — would likely pick up on:

**"Parent-led" can be used against you.** The framing as a "parent-led partnership" is a strength for supporters, but opponents could characterize this as "a small group of parents trying to dictate district policy." The 200/400 family number helps counter this, but the site doesn't show *diversity* of support — geographic, socioeconomic, linguistic background. If this reads as a Noe Valley/Pacific Heights parent group, it's easier to dismiss.

**No educational evidence cited.** The site mentions "cognitive advantages of bilingual education" and "depth of a learning experience" but doesn't link to any research. An opponent could say "where's the evidence?" A single link to a peer-reviewed study or a recognized authority (e.g., the Center for Applied Linguistics) would preempt this.

**Resource allocation framing.** The site doesn't address the elephant in the room: SFUSD is in a budget crisis. An opponent will say "why are we launching a new school when we're closing others?" The site should have a ready answer for this — even if it's in a future FAQ — because this *will* come up at the board meeting.

**"Mandarin immersion for whom?"** The site is in English only. The bilingual toggle is listed as a future goal, but an opponent could point out the irony — and more importantly, question whether this school primarily serves English-speaking families who *want* Mandarin, rather than Mandarin-speaking families who *need* language support. The inclusive framing is good, but the lack of any Chinese-language content is a gap.

**The countdown creates a zero-sum framing.** "Days to secure our school" implies that if the board doesn't vote yes, something is lost. An opponent could reframe this as pressure tactics — "this group is trying to rush the board into a decision." Consider whether the countdown language could be softer: "days until the board decision" rather than "days to secure our school."

**No plan for what happens after approval.** The site is entirely focused on getting the board vote. A skeptical board member might ask: "And then what? Where's the building? Where are the teachers? What's the budget?" The site doesn't need a full implementation plan, but acknowledging the post-approval roadmap would show maturity.

### Priority recommendation
Add a FAQ page sooner rather than later. It's the natural home for addressing the resource allocation question, the "who is this for" question, and the post-approval roadmap. Having ready answers before the board meeting is critical.

---

## 5. SEO & Discoverability Perspective

This is a grassroots effort that relies heavily on word-of-mouth (WhatsApp, WeChat, Facebook groups, parent listservs). But there's a long-tail opportunity being missed:

**No search presence for key queries.** Parents googling "mandarin immersion san francisco," "SFUSD mandarin school," or "chinese immersion elementary school SF" should find this site. Right now there's no blog content, no structured data, and limited keyword density in the meta descriptions.

**The Updates/Blog page is high priority.** Each post about a board meeting, a milestone, or a community event is a new indexed page that can rank for relevant queries. It also gives you content to share in email updates and social media. This should be the next page built.

**No structured data.** Adding Organization schema markup would help Google understand what this site is and surface it in knowledge panels.

**Social sharing preview.** The OG image is good, but the OG description on the homepage still says "Join 200+ families" — make sure this stays current as the number grows. Stale social previews undermine credibility.

**No sitemap.xml.** GitHub Pages doesn't auto-generate one. A simple XML sitemap would help search engines discover all pages.

### Priority recommendation
Build the Updates/Blog page next. Each update is a new piece of indexed, shareable content — and it serves double duty as a Mailchimp email. This is the highest-leverage page you can build.

---

## Summary: Top 5 Actions

1. **Extract shared components** (nav, footer, CSS, JS) before building more pages
2. **Build the FAQ page** to preempt opponent arguments before the board meeting
3. **Add a CTA section** to the bottom of How to Help
4. **Set up Cloudflare Analytics** — takes 5 minutes, gives you data before your next outreach push
5. **Populate or hide the supporters section** — a visible placeholder undermines credibility
