import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Vitota Technologies",
  description:
    "Terms & Conditions governing the use of Vitota Technologies website and services.",
};

const Section = ({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-12">
    <h2 className="mb-5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
      <span className="mr-2 text-cyan-400">{number}.</span>
      {title}
    </h2>

    <div className="space-y-5 text-[15px] leading-8 text-slate-300 sm:text-base">
      {children}
    </div>
  </section>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="ml-5 list-disc space-y-2 pl-2 marker:text-cyan-400">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const NumberedList = ({ items }: { items: string[] }) => (
  <ol className="ml-5 list-decimal space-y-2 pl-2 marker:text-cyan-400">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ol>
);

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050b18] text-slate-200">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute right-0 top-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-5xl px-5 pb-12 pt-20 sm:px-8 sm:pt-28 lg:px-10">
            {/* Brand */}
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                V
              </div>

              <div>
                <p className="text-lg font-semibold text-white sm:text-xl">
                  Vitota Technologies
                </p>
                <p className="text-sm text-slate-400">
                  Technology • Innovation • Digital Solutions
                </p>
              </div>
            </div>

            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                Legal Document
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Terms &amp; Conditions
              </h1>

              <div className="mt-7 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:gap-8">
                <p>
                  <span className="text-slate-300">Effective Date:</span>{" "}
                  25 September 2026
                </p>

                <p>
                  <span className="text-slate-300">Last Updated:</span>{" "}
                  25 September 2026
                </p>
              </div>

              <div className="mt-8 h-px w-full bg-gradient-to-r from-cyan-400/40 via-blue-500/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Document */}
        <article className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          {/* Introduction */}
          <div className="mb-14 rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/10 sm:p-8">
            <p className="text-base leading-8 text-slate-300 sm:text-lg">
              Welcome to <strong className="text-white">Vitota Technologies</strong>.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
              These Terms &amp; Conditions (“Terms”, “Agreement”) govern your
              access to and use of the website, applications, software, digital
              products, technology services, development services, consulting
              services, design services, hosting-related services, and any
              other services provided by{" "}
              <strong className="text-white">Vitota Technologies</strong>{" "}
              (“Vitota Technologies”, “Company”, “we”, “us”, or “our”).
            </p>

            <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
              By accessing, browsing, registering on, purchasing from, or using
              any part of our website or services, you acknowledge that you
              have read, understood, and agreed to be bound by these Terms.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
              If you do not agree with any part of these Terms, you must not
              use our website or services.
            </p>
          </div>

          {/* 1 */}
          <Section number="1" title="DEFINITIONS">
            <p>For the purpose of these Terms:</p>

            <BulletList
              items={[
                "“Company” means Vitota Technologies.",
                "“Website” means the official website of Vitota Technologies and its related pages, subdomains, portals, and digital platforms.",
                "“User”, “Customer”, “Client”, “You”, or “Your” means any person, business, organization, or entity accessing or using our website or services.",
                "“Services” means all products and services offered by Vitota Technologies, including but not limited to website development, software development, UI/UX design, graphic design, digital solutions, consulting, maintenance, hosting assistance, technology services, and related services.",
                "“Content” means text, images, graphics, logos, videos, documents, code, software, information, data, or other materials.",
                "“Third-Party Services” means services, platforms, APIs, hosting providers, payment processors, plugins, libraries, applications, domains, social-media platforms, AI tools, or other services operated by third parties.",
              ]}
            />
          </Section>

          {/* 2 */}
          <Section number="2" title="ACCEPTANCE OF TERMS">
            <p>By using our website or services, you confirm that:</p>

            <NumberedList
              items={[
                "You have the legal capacity to enter into these Terms, or you have obtained the necessary authorization from your parent, guardian, employer, organization, or legal representative where applicable.",
                "The information provided by you is accurate and not misleading.",
                "You will use our website and services only for lawful purposes.",
                "You will comply with all applicable laws, rules, regulations, and third-party terms.",
                "You accept these Terms and any applicable policies referenced by them.",
              ]}
            />

            <p>
              If you are using our services on behalf of a company, organization,
              or another person, you represent that you have authority to bind
              that entity or person to these Terms.
            </p>
          </Section>

          {/* 3 */}
          <Section number="3" title="CHANGES TO THESE TERMS">
            <p>
              Vitota Technologies reserves the right to modify, update, replace,
              or revise these Terms at any time.
            </p>

            <p>
              Updated Terms may be published on our website. Your continued use
              of our website or services after such changes are published
              constitutes acceptance of the updated Terms, to the extent
              permitted by applicable law.
            </p>

            <p>
              You are responsible for periodically reviewing the Terms.
            </p>
          </Section>

          {/* 4 */}
          <Section number="4" title="DESCRIPTION OF SERVICES">
            <p>
              Vitota Technologies may provide technology-related services
              including, but not limited to:
            </p>

            <BulletList
              items={[
                "Website development",
                "Web application development",
                "Software development",
                "UI/UX design",
                "Graphic design",
                "Website maintenance",
                "Technology consulting",
                "Digital solutions",
                "Hosting assistance",
                "Domain-related assistance",
                "API integration",
                "Third-party integrations",
                "Database-related development",
                "AI-assisted technology services",
                "Custom software solutions",
                "Other technology services introduced by the Company from time to time",
              ]}
            />

            <p>
              The exact scope of any project will depend on the proposal,
              quotation, invoice, project agreement, statement of work, or
              other written communication applicable to that project.
            </p>
          </Section>

          {/* 5 */}
          <Section number="5" title="PROJECT SCOPE">
            <p>Unless expressly agreed otherwise in writing:</p>

            <BulletList
              items={[
                "Only the services specifically included in the agreed scope are included.",
                "Additional features, revisions, pages, integrations, functionality, designs, or technical requirements may constitute additional work.",
                "Additional work may be subject to additional charges and timelines.",
                "Verbal statements or informal discussions do not automatically modify the agreed project scope.",
                "The Company may require written confirmation before performing work outside the agreed scope.",
              ]}
            />

            <p>
              Any estimated timeline is an estimate unless a specific completion
              date is expressly guaranteed in a written agreement.
            </p>
          </Section>

          {/* 6 */}
          <Section number="6" title="CLIENT RESPONSIBILITIES">
            <p>
              The Client is responsible for providing accurate, complete, and
              lawful information, materials, credentials, approvals, content,
              images, trademarks, documents, and other materials necessary to
              complete the project.
            </p>

            <p>
              The Client represents that they have the necessary rights,
              permissions, licenses, and authorizations to provide such
              materials to Vitota Technologies.
            </p>

            <p>The Company shall not be responsible for delays caused by:</p>

            <BulletList
              items={[
                "Failure to provide required information;",
                "Delayed approvals;",
                "Incorrect information;",
                "Changes requested by the Client;",
                "Failure to provide access or credentials;",
                "Third-party service failures;",
                "Hosting or domain issues outside the Company's control;",
                "Internet or infrastructure failures;",
                "Force majeure events;",
                "Government actions or legal restrictions;",
                "Other circumstances beyond the Company's reasonable control.",
              ]}
            />
          </Section>

          {/* 7 */}
          <Section number="7" title="CLIENT-PROVIDED CONTENT">
            <p>
              You are solely responsible for the legality, accuracy, ownership,
              and authorization of content supplied by you.
            </p>

            <p>You agree not to provide content that:</p>

            <BulletList
              items={[
                "Infringes intellectual-property rights;",
                "Violates applicable law;",
                "Contains malicious code;",
                "Contains unlawful or fraudulent material;",
                "Violates another person's privacy;",
                "Violates third-party terms;",
                "Is defamatory, deceptive, or otherwise unlawful.",
              ]}
            />

            <p>
              You grant Vitota Technologies the limited permission necessary to
              use, reproduce, modify, process, and display Client-provided
              materials solely for the purpose of providing the agreed services.
            </p>
          </Section>

          {/* 8 */}
          <Section number="8" title="INTELLECTUAL PROPERTY">
            <p>
              Unless otherwise expressly agreed in writing, all rights in the
              Company's pre-existing:
            </p>

            <BulletList
              items={[
                "Software;",
                "Frameworks;",
                "Templates;",
                "Libraries;",
                "Components;",
                "Source code;",
                "Tools;",
                "Processes;",
                "Documentation;",
                "Designs;",
                "Branding;",
                "Logos;",
                "Methodologies;",
                "Know-how;",
                "Reusable components;",
                "Technology;",
              ]}
            />

            <p>
              remain the property of Vitota Technologies or the respective rights
              holder.
            </p>

            <p>
              Client-specific deliverables shall be transferred or licensed only
              according to the applicable project agreement, payment status, and
              applicable law.
            </p>

            <p>
              Payment for a service does not automatically transfer ownership of
              the Company's pre-existing intellectual property.
            </p>
          </Section>

          {/* 9 */}
          <Section number="9" title="THIRD-PARTY MATERIALS AND SERVICES">
            <p>
              Our services may depend on or integrate with third-party services,
              including but not limited to:
            </p>

            <BulletList
              items={[
                "Hosting providers;",
                "Domain registrars;",
                "Payment gateways;",
                "APIs;",
                "Cloud services;",
                "AI platforms;",
                "Plugins;",
                "Software libraries;",
                "Advertising platforms;",
                "Analytics services;",
                "Social-media platforms;",
                "Email providers;",
                "Security services.",
              ]}
            />

            <p>
              Vitota Technologies does not control third-party services and
              cannot guarantee their availability, performance, pricing,
              security, policies, compatibility, or continued operation.
            </p>

            <p>
              Any third-party service may change, discontinue, restrict,
              suspend, or modify its services without notice.
            </p>

            <p>
              Where a third-party service causes a failure, limitation, loss,
              delay, suspension, incompatibility, or additional cost, Vitota
              Technologies shall not be responsible to the extent permitted by
              applicable law.
            </p>
          </Section>

          {/* 10 */}
          <Section number="10" title="DOMAIN AND HOSTING SERVICES">
            <p>
              Where Vitota Technologies assists with domain registration,
              hosting, DNS, SSL, email, servers, cloud services, or similar
              services, such services may be provided directly by third-party
              providers.
            </p>

            <p>The Client acknowledges that:</p>

            <BulletList
              items={[
                "Domain ownership may be subject to registrar policies.",
                "Hosting availability may depend on the hosting provider.",
                "DNS propagation may take time.",
                "SSL certificates may expire or require renewal.",
                "Third-party providers may suspend or terminate services.",
                "Pricing and policies may change.",
                "Technical downtime may occur.",
              ]}
            />

            <p>
              Vitota Technologies does not guarantee uninterrupted availability
              of third-party infrastructure.
            </p>
          </Section>

          {/* 11 */}
          <Section number="11" title="PAYMENTS">
            <p>Unless otherwise agreed in writing:</p>

            <BulletList
              items={[
                "Fees must be paid according to the applicable quotation, invoice, proposal, or agreement.",
                "Work may begin only after the required advance payment is received.",
                "The Company may pause work where payments are overdue.",
                "Additional work may incur additional charges.",
                "Taxes, government charges, third-party fees, domain fees, hosting fees, licenses, subscriptions, and other external costs may be charged separately unless expressly included.",
              ]}
            />

            <p>
              All applicable taxes and statutory charges shall be handled in
              accordance with applicable law.
            </p>
          </Section>

          {/* 12 */}
          <Section number="12" title="REFUNDS AND CANCELLATIONS">
            <p>
              Refund eligibility shall depend on the applicable project
              agreement, quotation, invoice, service-specific refund policy,
              and applicable law.
            </p>

            <p>
              Where work has already been performed, costs have been incurred,
              third-party services have been purchased, or customized work has
              been created, the amount refundable, if any, may be reduced
              accordingly, subject to applicable law.
            </p>

            <p>
              The Company reserves the right to evaluate cancellation and refund
              requests individually according to the applicable agreement and
              law.
            </p>

            <p>
              Nothing in these Terms excludes any mandatory consumer rights that
              cannot legally be excluded.
            </p>
          </Section>

          {/* 13 */}
          <Section number="13" title="REVISIONS AND APPROVALS">
            <p>
              Where revisions are included in a project, the number and scope of
              revisions shall be determined by the applicable project agreement.
            </p>

            <p>
              Once a Client approves a design, website, application, content, or
              deliverable, subsequent changes may be treated as additional work.
            </p>

            <p>
              The Client is responsible for reviewing deliverables and informing
              the Company of material errors or requested changes within a
              reasonable period.
            </p>
          </Section>

          {/* 14 */}
          <Section number="14" title="WEBSITE AVAILABILITY">
            <p>
              We attempt to maintain our website and services in working
              condition; however, we do not guarantee that the website will
              always be:
            </p>

            <BulletList
              items={[
                "Available;",
                "Uninterrupted;",
                "Error-free;",
                "Secure from every possible threat;",
                "Compatible with every device or browser;",
                "Free from bugs or technical problems.",
              ]}
            />

            <p>
              The website may occasionally be unavailable due to maintenance,
              updates, technical problems, infrastructure issues, security
              measures, or circumstances beyond our reasonable control.
            </p>
          </Section>

          {/* 15 */}
          <Section number="15" title="NO GUARANTEE OF BUSINESS RESULTS">
            <p>
              Vitota Technologies may provide technology, development, design,
              or consulting services.
            </p>

            <p>However, we do not guarantee:</p>

            <BulletList
              items={[
                "Specific revenue;",
                "Sales;",
                "Profit;",
                "Website traffic;",
                "Search-engine rankings;",
                "Customer acquisition;",
                "Conversion rates;",
                "Business growth;",
                "Advertising performance;",
                "Investment returns;",
                "Market success;",
                "App downloads;",
                "Social-media growth;",
                "Any specific commercial result.",
              ]}
            />

            <p>
              Business results may depend on numerous factors outside the
              Company's control.
            </p>
          </Section>

          {/* 16 */}
          <Section number="16" title="AI-GENERATED OR AI-ASSISTED OUTPUT">
            <p>
              Where AI tools or AI-assisted systems are used, outputs may
              contain inaccuracies, omissions, errors, inconsistencies, or
              unintended similarities.
            </p>

            <p>
              AI-generated output should be reviewed by the Client before
              commercial, legal, medical, financial, educational, or other
              consequential use.
            </p>

            <p>
              Vitota Technologies does not guarantee that AI-generated or
              AI-assisted output is:
            </p>

            <BulletList
              items={[
                "Completely accurate;",
                "Unique;",
                "Error-free;",
                "Suitable for a particular purpose;",
                "Free from third-party rights claims;",
                "Appropriate for every use.",
              ]}
            />

            <p>
              The Client remains responsible for reviewing and approving final
              materials before use.
            </p>
          </Section>

          {/* 17 */}
          <Section number="17" title="SECURITY">
            <p>
              We may implement reasonable technical and organizational measures
              intended to protect systems and information.
            </p>

            <p>
              However, no website, server, software, network, or digital
              transmission can be guaranteed to be completely secure.
            </p>

            <p>
              Vitota Technologies shall not be responsible for security
              incidents caused by circumstances outside its reasonable control,
              including compromised third-party systems, Client-side security
              failures, stolen credentials, malware, phishing, unauthorized
              access resulting from Client actions, or vulnerabilities in
              third-party software.
            </p>
          </Section>

          {/* 18 */}
          <Section number="18" title="USER ACCOUNTS AND CREDENTIALS">
            <p>
              Where accounts, dashboards, hosting panels, administrative systems,
              or credentials are provided, the User is responsible for
              maintaining the confidentiality of their login information.
            </p>

            <p>
              You must immediately notify the Company if you believe that your
              credentials have been compromised.
            </p>

            <p>
              The Company shall not be responsible for losses resulting from
              credentials being shared, exposed, misused, or compromised due to
              the User&apos;s actions or negligence, except to the extent required
              by applicable law.
            </p>
          </Section>

          {/* 19 */}
          <Section number="19" title="PROHIBITED USE">
            <p>You must not use our website or services to:</p>

            <NumberedList
              items={[
                "Commit or facilitate unlawful activities.",
                "Distribute malware or malicious code.",
                "Attempt unauthorized access to systems.",
                "Conduct fraudulent activities.",
                "Violate intellectual-property rights.",
                "Conduct unauthorized security testing.",
                "Interfere with our infrastructure.",
                "Abuse APIs or services.",
                "Circumvent security measures.",
                "Impersonate another person or organization.",
                "Use our services for activities prohibited by applicable law.",
              ]}
            />

            <p>
              We may suspend or terminate access where reasonably necessary to
              protect our systems, users, business, or legal interests.
            </p>
          </Section>

          {/* 20 */}
          <Section number="20" title="DISCLAIMER OF WARRANTIES">
            <p>
              To the maximum extent permitted by applicable law, our website and
              services are provided on an “as available” and “as is” basis.
            </p>

            <p>
              Except where expressly provided in a written agreement or where
              prohibited by applicable law, Vitota Technologies makes no
              warranties regarding:
            </p>

            <BulletList
              items={[
                "Continuous availability;",
                "Accuracy of every website statement;",
                "Fitness for a particular purpose;",
                "Uninterrupted operation;",
                "Compatibility with every system;",
                "Error-free operation;",
                "Specific business results;",
                "Third-party services;",
                "Future availability of any feature.",
              ]}
            />

            <p>
              Nothing in these Terms is intended to exclude a warranty or legal
              right that cannot lawfully be excluded.
            </p>
          </Section>

          {/* 21 */}
          <Section number="21" title="LIMITATION OF LIABILITY">
            <p>
              To the maximum extent permitted by applicable law, Vitota
              Technologies, its owners, directors, employees, contractors,
              consultants, affiliates, service providers, and representatives
              shall not be liable for indirect, incidental, special,
              consequential, exemplary, or punitive losses arising from or
              related to the use of our website or services.
            </p>

            <p>This may include, where legally permissible:</p>

            <BulletList
              items={[
                "Loss of profits;",
                "Loss of revenue;",
                "Loss of business;",
                "Loss of data;",
                "Loss of opportunities;",
                "Loss of goodwill;",
                "Business interruption;",
                "Loss caused by third-party services;",
                "Loss caused by unauthorized access;",
                "Loss caused by downtime;",
                "Loss resulting from Client-provided information;",
                "Loss resulting from changes in third-party platforms.",
              ]}
            />

            <p>
              To the maximum extent permitted by applicable law, the Company&apos;s
              aggregate liability arising from a particular service or project
              shall not exceed the total amount actually paid by the Client to
              Vitota Technologies for the specific service giving rise to the
              claim during the applicable period, unless a different limitation
              is expressly required or prohibited by applicable law or agreed in
              writing.
            </p>

            <p>
              This limitation does not apply to liabilities that cannot legally
              be limited or excluded.
            </p>
          </Section>

          {/* 22 */}
          <Section number="22" title="CLIENT INDEMNIFICATION">
            <p>
              To the maximum extent permitted by applicable law, you agree to
              defend, indemnify, and hold harmless Vitota Technologies and its
              owners, directors, employees, contractors, affiliates,
              representatives, and service providers from claims, losses,
              damages, liabilities, costs, and reasonable expenses arising from:
            </p>

            <BulletList
              items={[
                "Your violation of these Terms;",
                "Your unlawful use of our services;",
                "Your violation of third-party rights;",
                "Client-provided content;",
                "Your breach of applicable law;",
                "Your unauthorized use of our services;",
                "Your misuse of third-party services;",
                "Your infringement of intellectual-property rights;",
                "False, misleading, or unauthorized information supplied by you.",
              ]}
            />

            <p>
              This obligation shall apply to the extent permitted by applicable
              law.
            </p>
          </Section>

          {/* 23 */}
          <Section number="23" title="FORCE MAJEURE">
            <p>
              Vitota Technologies shall not be responsible for delay or failure
              to perform caused by circumstances beyond its reasonable control.
            </p>

            <p>Such circumstances may include:</p>

            <BulletList
              items={[
                "Natural disasters;",
                "Fire;",
                "Flood;",
                "Earthquake;",
                "Epidemic or pandemic;",
                "War;",
                "Terrorism;",
                "Civil unrest;",
                "Government restrictions;",
                "Internet outages;",
                "Power failures;",
                "Cyberattacks;",
                "Major infrastructure failures;",
                "Cloud-provider failures;",
                "Hosting-provider failures;",
                "Domain or DNS failures;",
                "Third-party service outages;",
                "Strikes;",
                "Labor disruptions;",
                "Regulatory changes;",
                "Other events beyond reasonable control.",
              ]}
            />

            <p>
              Where reasonably possible, the Company may attempt to restore
              services or performance after such events.
            </p>
          </Section>

          {/* 24 */}
          <Section number="24" title="TERMINATION">
            <p>Vitota Technologies may suspend or terminate access to services where:</p>

            <BulletList
              items={[
                "You materially breach these Terms;",
                "Payment obligations remain unpaid;",
                "You misuse the services;",
                "Your activities create a security risk;",
                "Your activities violate applicable law;",
                "Continued service creates legal or operational risk;",
                "A third-party provider prevents continued service.",
              ]}
            />

            <p>
              Termination does not automatically eliminate obligations that
              accrued before termination.
            </p>

            <p>
              Provisions concerning intellectual property, payment obligations,
              liability, indemnification, confidentiality, dispute resolution,
              and other provisions intended by their nature to survive
              termination shall continue to apply.
            </p>
          </Section>

          {/* 25 */}
          <Section number="25" title="CONFIDENTIALITY">
            <p>
              Where confidential information is shared in connection with a
              project, each party should take reasonable measures to protect
              confidential information.
            </p>

            <p>
              Confidential information should not be disclosed to unauthorized
              persons except where:
            </p>

            <BulletList
              items={[
                "Required by law;",
                "Required by a competent authority;",
                "Necessary to perform the agreed services;",
                "Already publicly available through no breach of confidentiality;",
                "Properly obtained from an authorized third party.",
              ]}
            />

            <p>
              Where a separate NDA or confidentiality agreement exists, that
              agreement shall govern in case of conflict concerning
              confidentiality.
            </p>
          </Section>

          {/* 26 */}
          <Section number="26" title="INTELLECTUAL-PROPERTY INFRINGEMENT CLAIMS">
            <p>
              If you believe that material available through our website
              infringes your intellectual-property rights, you may contact
              Vitota Technologies with sufficient information to identify:
            </p>

            <BulletList
              items={[
                "The allegedly infringing material;",
                "The protected work or right;",
                "Your basis for ownership or authorization;",
                "Your contact information;",
                "Any relevant supporting information.",
              ]}
            />

            <p>
              We may investigate and take appropriate action where reasonably
              justified.
            </p>
          </Section>

          {/* 27 */}
          <Section number="27" title="THIRD-PARTY LINKS">
            <p>
              Our website may contain links to third-party websites.
            </p>

            <p>
              Such links are provided for convenience and do not necessarily
              constitute endorsement, sponsorship, or recommendation.
            </p>

            <p>
              Vitota Technologies does not control third-party websites and is
              not responsible for their:
            </p>

            <BulletList
              items={[
                "Content;",
                "Privacy practices;",
                "Security;",
                "Availability;",
                "Products;",
                "Services;",
                "Policies;",
                "Accuracy.",
              ]}
            />

            <p>
              You access third-party websites at your own discretion and subject
              to their terms.
            </p>
          </Section>

          {/* 28 */}
          <Section number="28" title="PRIVACY">
            <p>
              Your use of our website may also be governed by our Privacy Policy.
            </p>

            <p>
              The Privacy Policy explains how information may be collected, used,
              stored, processed, and protected.
            </p>

            <p>
              Where required by applicable law, you may have certain rights
              concerning your personal information.
            </p>
          </Section>

          {/* 29 */}
          <Section number="29" title="COMMUNICATIONS">
            <p>
              By contacting Vitota Technologies or using our services, you may
              receive service-related communications concerning:
            </p>

            <BulletList
              items={[
                "Projects;",
                "Payments;",
                "Technical issues;",
                "Security;",
                "Account information;",
                "Updates;",
                "Important notices.",
              ]}
            />

            <p>
              Marketing communications, where applicable, may be subject to
              separate consent or applicable law.
            </p>
          </Section>

          {/* 30 */}
          <Section number="30" title="ERRORS AND TYPOGRAPHICAL MISTAKES">
            <p>
              We attempt to keep website information accurate.
            </p>

            <p>
              However, the website may occasionally contain typographical
              errors, outdated information, technical inaccuracies, pricing
              errors, or other mistakes.
            </p>

            <p>
              To the extent permitted by law, Vitota Technologies reserves the
              right to correct errors and update information without creating an
              obligation to honor an obvious error.
            </p>
          </Section>

          {/* 31 */}
          <Section number="31" title="PROFESSIONAL ADVICE DISCLAIMER">
            <p>
              Unless expressly stated otherwise, information provided through
              our website should not be treated as legal, financial, medical,
              tax, investment, accounting, or other regulated professional
              advice.
            </p>

            <p>
              Users should consult an appropriately qualified professional where
              professional advice is required.
            </p>
          </Section>

          {/* 32 */}
          <Section number="32" title="WEBSITE CONTENT">
            <p>
              The content on our website is provided for general informational
              purposes.
            </p>

            <p>
              We may modify, update, remove, or replace website content at any
              time.
            </p>

            <p>
              We do not guarantee that every piece of information will remain
              current indefinitely.
            </p>
          </Section>

          {/* 33 */}
          <Section number="33" title="USER FEEDBACK">
            <p>
              If you voluntarily provide feedback, suggestions, ideas,
              recommendations, or other comments concerning our services, you
              grant Vitota Technologies permission to use such feedback for
              improving its products and services, to the extent permitted by
              law.
            </p>

            <p>
              Such use does not obligate the Company to provide compensation
              unless expressly agreed in writing.
            </p>
          </Section>

          {/* 34 */}
          <Section number="34" title="TESTIMONIALS AND PORTFOLIO">
            <p>
              Where permitted by applicable law and agreement, Vitota
              Technologies may display completed projects, screenshots, designs,
              or general project descriptions in its portfolio or marketing
              materials.
            </p>

            <p>
              If a project is subject to confidentiality or a written restriction
              against public display, the Company will respect the applicable
              restriction.
            </p>

            <p>
              Client trademarks and confidential information will not be publicly
              used contrary to an applicable agreement or legal requirement.
            </p>
          </Section>

          {/* 35 */}
          <Section number="35" title="NO PARTNERSHIP OR AGENCY">
            <p>
              Use of our website or services does not create a partnership,
              joint venture, employment relationship, franchise relationship, or
              agency relationship between you and Vitota Technologies unless
              expressly agreed in writing.
            </p>

            <p>
              Neither party may represent that it has authority to bind the
              other party unless such authority has been expressly granted.
            </p>
          </Section>

          {/* 36 */}
          <Section number="36" title="ASSIGNMENT">
            <p>
              You may not transfer or assign your rights or obligations under
              these Terms without the Company&apos;s prior written consent, except
              where such restriction is prohibited by applicable law.
            </p>

            <p>
              Vitota Technologies may assign or transfer its rights and
              obligations in connection with a restructuring, merger,
              acquisition, sale of assets, or similar transaction, subject to
              applicable law.
            </p>
          </Section>

          {/* 37 */}
          <Section number="37" title="SEVERABILITY">
            <p>
              If any provision of these Terms is determined to be invalid,
              unlawful, or unenforceable by a competent authority, that
              provision shall be modified or limited to the minimum extent
              necessary, and the remaining provisions shall continue to the
              extent legally permissible.
            </p>
          </Section>

          {/* 38 */}
          <Section number="38" title="NO WAIVER">
            <p>
              Failure by Vitota Technologies to enforce any provision of these
              Terms shall not constitute a waiver of its right to enforce that
              provision later.
            </p>
          </Section>

          {/* 39 */}
          <Section number="39" title="ENTIRE AGREEMENT">
            <p>
              These Terms, together with any applicable:
            </p>

            <BulletList
              items={[
                "Privacy Policy;",
                "Refund Policy;",
                "Project Agreement;",
                "Quotation;",
                "Invoice;",
                "Statement of Work;",
                "NDA;",
                "Service-specific terms;",
              ]}
            />

            <p>
              constitute the agreement governing the applicable relationship,
              subject to any express written agreement between the parties.
            </p>

            <p>
              If there is a conflict between these Terms and a specific written
              project agreement, the specific written agreement may control to
              the extent expressly stated.
            </p>
          </Section>

          {/* 40 */}
          <Section number="40" title="GOVERNING LAW AND JURISDICTION">
            <p>
              These Terms shall be governed by the laws applicable to the
              Company&apos;s applicable legal jurisdiction, subject to mandatory
              provisions of applicable law.
            </p>

            <p>
              Any dispute shall be subject to the jurisdiction of the competent
              courts or authorities having jurisdiction over the matter, unless
              the parties have agreed to another legally valid dispute-resolution
              mechanism in writing.
            </p>

            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5 text-amber-100/90">
              <p>
                <strong className="text-amber-200">
                  Company-specific jurisdiction details should be completed
                  based on the actual legal entity, registered office, and
                  applicable Indian law before publication.
                </strong>
              </p>
            </div>
          </Section>

          {/* 41 */}
          <Section number="41" title="DISPUTE RESOLUTION">
            <p>
              Where reasonably possible, the parties should first attempt to
              resolve disputes through good-faith communication.
            </p>

            <p>
              A party raising a dispute should provide reasonable details
              concerning the issue and allow the other party a reasonable
              opportunity to respond.
            </p>

            <p>
              Nothing in this section prevents either party from exercising
              rights or remedies that cannot legally be waived.
            </p>
          </Section>

          {/* 42 */}
          <Section number="42" title="SURVIVAL">
            <p>
              Provisions that by their nature should survive termination shall
              continue after termination, including provisions concerning:
            </p>

            <BulletList
              items={[
                "Payments;",
                "Intellectual property;",
                "Confidentiality;",
                "Indemnification;",
                "Limitation of liability;",
                "Dispute resolution;",
                "Governing law;",
                "Other continuing obligations.",
              ]}
            />
          </Section>

          {/* 43 */}
          <Section number="43" title="CONTACT INFORMATION">
            <p>
              For questions, notices, or concerns regarding these Terms, please
              contact:
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <p className="font-semibold text-white">
                Vitota Technologies
              </p>

              <div className="mt-5 space-y-3 text-slate-300">
                <p>
                  <strong className="text-slate-200">Website:</strong>{" "}
                  [INSERT OFFICIAL WEBSITE]
                </p>

                <p>
                  <strong className="text-slate-200">Email:</strong>{" "}
                  [INSERT OFFICIAL EMAIL]
                </p>

                <p>
                  <strong className="text-slate-200">Phone:</strong>{" "}
                  [INSERT OFFICIAL PHONE NUMBER]
                </p>

                <p>
                  <strong className="text-slate-200">
                    Registered/Business Address:
                  </strong>{" "}
                  [INSERT LEGAL ADDRESS]
                </p>
              </div>
            </div>
          </Section>

          {/* 44 */}
          <Section number="44" title="ACKNOWLEDGEMENT">
            <p>
              By accessing or using the website or services of Vitota
              Technologies, you acknowledge that:
            </p>

            <NumberedList
              items={[
                "You have read these Terms.",
                "You understand these Terms.",
                "You agree to comply with these Terms.",
                "You understand that technology services may involve third-party dependencies.",
                "You understand that specific project terms may apply to individual services.",
                "You accept responsibility for information and materials supplied by you.",
                "You understand that applicable law may provide rights that cannot be excluded or limited by contract.",
              ]}
            />

            <div className="mt-10 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-blue-500/10 to-cyan-400/5 p-7 text-center">
              <p className="text-lg font-medium text-white">
                Thank you for using Vitota Technologies.
              </p>

              <p className="mt-3 text-sm text-slate-400">
                © 2026 Vitota Technologies. All rights reserved.
              </p>
            </div>
          </Section>
        </article>
      </div>
    </main>
  );
}