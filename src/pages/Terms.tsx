import { Link } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="pt-14">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-foreground/90 mb-4">
                Welcome to the UTP Alumni Business Directory ("Platform"). These Terms of Service ("Terms") constitute a legally binding agreement between you and the Universiti Teknologi PETRONAS (UTP) Alumni Association ("we", "us", or "our") governing your access to and use of the Platform.
              </p>
              <p className="text-foreground/90">
                By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use the Platform.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
              <p className="text-foreground/90 mb-4">
                To use the Platform, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Be an alumnus or alumna of Universiti Teknologi PETRONAS (UTP)</li>
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and truthful information during registration</li>
                <li>Not be prohibited from using the Platform under Malaysian law or any other applicable jurisdiction</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                The UTP Alumni Association reserves the right to verify your alumni status and may request supporting documentation.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Account Creation</h3>
              <p className="text-foreground/90 mb-3">
                To access certain features of the Platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Responsibility</h3>
              <p className="text-foreground/90">
                You are solely responsible for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to maintain account security.
              </p>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Conduct and Prohibited Activities</h2>
              <p className="text-foreground/90 mb-4">
                You agree to use the Platform in a responsible and lawful manner. You shall not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation with UTP</li>
                <li>Harass, threaten, defame, or discriminate against other users</li>
                <li>Upload or transmit viruses, malware, or any harmful code</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Scrape, crawl, or use automated tools to extract data from the Platform</li>
                <li>Use the Platform for any illegal, fraudulent, or unauthorized purpose</li>
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Share or disclose other users' personal information without consent</li>
                <li>Post spam, advertisements, or unsolicited promotional content</li>
                <li>Interfere with or disrupt the Platform's functionality or infrastructure</li>
              </ul>
            </section>

            {/* Content */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Content</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Your Content</h3>
              <p className="text-foreground/90 mb-3">
                "User Content" means any information, data, text, images, profiles, business listings, messages, reviews, or other content that you submit, post, or display on the Platform.
              </p>
              <p className="text-foreground/90">
                You retain ownership of your User Content. However, by posting User Content on the Platform, you grant us a non-exclusive, worldwide, royalty-free, transferable license to use, reproduce, display, distribute, and modify your User Content solely for the purpose of operating and improving the Platform.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Content Standards</h3>
              <p className="text-foreground/90 mb-3">
                Your User Content must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Be accurate, truthful, and not misleading</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not infringe on any third-party intellectual property rights</li>
                <li>Not contain offensive, obscene, or defamatory material</li>
                <li>Not contain confidential or sensitive information belonging to others</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Content Moderation</h3>
              <p className="text-foreground/90">
                We reserve the right (but are not obligated) to review, monitor, remove, or modify any User Content that violates these Terms or is otherwise objectionable, without prior notice. We do not endorse or guarantee the accuracy of User Content.
              </p>
            </section>

            {/* Business Listings */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Business Directory Listings</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Business Information</h3>
              <p className="text-foreground/90 mb-3">
                If you create a business listing, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>You have the legal authority to represent the business</li>
                <li>All business information provided is accurate and current</li>
                <li>Your business complies with all applicable laws and regulations</li>
                <li>You will promptly update any changes to your business information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Business Verification</h3>
              <p className="text-foreground/90">
                We may verify business ownership and authenticity. Providing false business information may result in account suspension or termination.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Reviews and Ratings</h3>
              <p className="text-foreground/90">
                Users may post reviews and ratings of businesses. Reviews must be honest, factual, and based on genuine experiences. Fake reviews, review manipulation, or incentivized reviews are strictly prohibited.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Platform Ownership</h3>
              <p className="text-foreground/90">
                The Platform, including its design, features, software, graphics, logos, and trademarks, is owned by or licensed to the UTP Alumni Association and is protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Platform without our express written permission.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.2 UTP Trademarks</h3>
              <p className="text-foreground/90">
                "Universiti Teknologi PETRONAS", "UTP", and related marks are trademarks of Universiti Teknologi PETRONAS. Use of these marks requires prior written authorization.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
              <p className="text-foreground/90">
                Your privacy is important to us. Our collection, use, and disclosure of your personal data is governed by our <Link to="/abud/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Platform, you consent to the data practices described in our Privacy Policy.
              </p>
            </section>

            {/* Communication */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Communications and Messaging</h2>
              <p className="text-foreground/90 mb-4">
                The Platform includes messaging features that allow users to communicate with each other. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Use messaging features respectfully and professionally</li>
                <li>Not send spam, harassment, or unsolicited commercial messages</li>
                <li>Respect other users' privacy and communication preferences</li>
                <li>Report any abusive or inappropriate messages to us</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                We may monitor communications to ensure compliance with these Terms and to protect users' safety, but we are not responsible for the content of messages between users.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations of Liability</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.1 Platform "As Is"</h3>
              <p className="text-foreground/90">
                THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.2 User Content Disclaimer</h3>
              <p className="text-foreground/90">
                We do not verify, endorse, or guarantee the accuracy, reliability, or quality of User Content, business listings, or information provided by users. You use such information at your own risk.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.3 Business Transactions</h3>
              <p className="text-foreground/90">
                We are not a party to any transactions, agreements, or relationships between users or between users and businesses listed on the Platform. We are not responsible for disputes, losses, or damages arising from such interactions.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.4 Limitation of Liability</h3>
              <p className="text-foreground/90">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE UTP ALUMNI ASSOCIATION, UNIVERSITI TEKNOLOGI PETRONAS, AND THEIR RESPECTIVE OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
              <p className="text-foreground/90">
                You agree to indemnify, defend, and hold harmless the UTP Alumni Association, Universiti Teknologi PETRONAS, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising out of or relating to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mt-3">
                <li>Your use of the Platform</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of third parties</li>
                <li>Your violation of applicable laws or regulations</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Account Termination</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">12.1 Termination by You</h3>
              <p className="text-foreground/90">
                You may terminate your account at any time through your account settings or by contacting us. Upon termination, your access to the Platform will cease, though certain data may be retained as described in our Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">12.2 Termination by Us</h3>
              <p className="text-foreground/90 mb-3">
                We reserve the right to suspend or terminate your account and access to the Platform, without notice, for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Violation of these Terms</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Requests by law enforcement or regulatory authorities</li>
                <li>Technical or security concerns</li>
                <li>Any other reason at our sole discretion</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">12.3 Effect of Termination</h3>
              <p className="text-foreground/90">
                Upon termination, all licenses and rights granted to you under these Terms will immediately cease. Provisions that by their nature should survive termination shall survive, including but not limited to intellectual property rights, disclaimers, indemnification, and limitations of liability.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution and Governing Law</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">13.1 Governing Law</h3>
              <p className="text-foreground/90">
                These Terms shall be governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">13.2 Jurisdiction</h3>
              <p className="text-foreground/90">
                Any disputes arising out of or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts of Malaysia.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">13.3 Informal Resolution</h3>
              <p className="text-foreground/90">
                Before initiating formal legal proceedings, you agree to first attempt to resolve any dispute informally by contacting us at alumni@utp.edu.my.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms of Service</h2>
              <p className="text-foreground/90">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Platform with a new "Last Updated" date or by sending you an email notification. Your continued use of the Platform after such changes constitutes your acceptance of the updated Terms. If you do not agree to the modified Terms, you must stop using the Platform.
              </p>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">15. General Provisions</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">15.1 Entire Agreement</h3>
              <p className="text-foreground/90">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding your use of the Platform and supersede all prior agreements and understandings.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">15.2 Severability</h3>
              <p className="text-foreground/90">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">15.3 Waiver</h3>
              <p className="text-foreground/90">
                Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">15.4 Assignment</h3>
              <p className="text-foreground/90">
                You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">15.5 Force Majeure</h3>
              <p className="text-foreground/90">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, pandemics, or government restrictions.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
              <p className="text-foreground/90 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">UTP Alumni Association</p>
                <p className="text-sm text-foreground/90">Email: alumni@utp.edu.my</p>
                <p className="text-sm text-foreground/90">Address: Universiti Teknologi PETRONAS, 32610 Seri Iskandar, Perak, Malaysia</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">17. Acknowledgment</h2>
              <p className="text-foreground/90">
                BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
              </p>
            </section>

            {/* Footer Links */}
            <div className="border-t pt-8 mt-12">
              <p className="text-sm text-muted-foreground">
                Related Documents:{' '}
                <Link to="/abud/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                <Link to="/abud" className="text-primary hover:underline">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
