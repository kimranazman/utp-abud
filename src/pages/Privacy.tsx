import { Link } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="pt-14">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-foreground/90 mb-4">
                The UTP Alumni Business Directory ("Platform") is operated by the Universiti Teknologi PETRONAS (UTP) Alumni Association ("we", "us", or "our"). We are committed to protecting your personal data and respecting your privacy in compliance with the Personal Data Protection Act 2010 (PDPA) of Malaysia and other applicable data protection laws.
              </p>
              <p className="text-foreground/90">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you use our Platform. Please read this policy carefully. By using the Platform, you consent to the collection and use of your personal data as described in this Privacy Policy.
              </p>
            </section>

            {/* Data Controller */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Data Controller</h2>
              <p className="text-foreground/90">
                The data controller responsible for your personal data is:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-3">
                <p className="font-medium">Universiti Teknologi PETRONAS (UTP) Alumni Association</p>
                <p className="text-sm text-muted-foreground mt-1">Universiti Teknologi PETRONAS</p>
                <p className="text-sm text-muted-foreground">32610 Seri Iskandar, Perak, Malaysia</p>
              </div>
            </section>

            {/* Personal Data We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Personal Data We Collect</h2>
              <p className="text-foreground/90 mb-4">
                We collect and process the following categories of personal data:
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Profile Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Full name, email address, and date of birth</li>
                <li>Profile picture and avatar</li>
                <li>Graduation year and academic programme/course</li>
                <li>Biographical information and professional tags</li>
                <li>Profile visibility preferences</li>
                <li>Location information (country, state, city)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Education and Career Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Education history (programme level, graduation year)</li>
                <li>Career history (company name, position, employment dates, descriptions)</li>
                <li>Current employment status</li>
                <li>Professional achievements and certifications</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Business Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Business name, description, and industry</li>
                <li>Business size, employee count, and ownership type</li>
                <li>Business location and contact details</li>
                <li>Business logo, banner, and gallery images</li>
                <li>Services offered and business achievements</li>
                <li>Business registration information</li>
                <li>Team member information and roles</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Contact and Social Links</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Social media profiles and links</li>
                <li>Website URLs</li>
                <li>Professional networking links</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.5 Contributions and Community Engagement</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Contributions to UTP or alumni community (monetary and non-monetary)</li>
                <li>Volunteer roles and community involvement</li>
                <li>Business reviews and ratings</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.6 Communication Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Messages and conversations between users</li>
                <li>Message content and timestamps</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.7 Technical and Usage Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Platform usage patterns and analytics</li>
                <li>Onboarding progress and session information</li>
              </ul>
            </section>

            {/* How We Use Your Data */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Personal Data</h2>
              <p className="text-foreground/90 mb-4">
                We process your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Platform Services:</strong> To provide, maintain, and improve our alumni directory and business networking services</li>
                <li><strong>User Accounts:</strong> To create and manage your user account and profile</li>
                <li><strong>Communication:</strong> To enable communication between alumni members and facilitate networking</li>
                <li><strong>Directory Listings:</strong> To display your profile and business information in our directories based on your visibility settings</li>
                <li><strong>Verification:</strong> To verify your alumni status and business ownership</li>
                <li><strong>Analytics:</strong> To analyze platform usage and improve user experience</li>
                <li><strong>Security:</strong> To protect the platform, prevent fraud, and ensure platform security</li>
                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our terms of service</li>
                <li><strong>Community Engagement:</strong> To track and recognize contributions to the UTP alumni community</li>
              </ul>
            </section>

            {/* Legal Basis */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Legal Basis for Processing</h2>
              <p className="text-foreground/90 mb-4">
                Under the PDPA 2010, we process your personal data based on:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Consent:</strong> You have given explicit consent for us to process your personal data for specific purposes</li>
                <li><strong>Contractual Necessity:</strong> Processing is necessary to fulfill our contractual obligations to provide platform services</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for legitimate interests pursued by us or third parties, provided such interests are not overridden by your data protection rights</li>
                <li><strong>Legal Obligations:</strong> Processing is necessary to comply with legal and regulatory requirements</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. How We Share Your Personal Data</h2>
              <p className="text-foreground/90 mb-4">
                We may share your personal data with:
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Other Platform Users</h3>
              <p className="text-foreground/90 mb-3">
                Your profile information, business listings, and other data you choose to make public or share with the alumni community will be visible to other users based on your privacy settings.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Service Providers</h3>
              <p className="text-foreground/90 mb-3">
                We use trusted third-party service providers to support our platform operations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Supabase:</strong> Database hosting and authentication services</li>
                <li><strong>Mapbox:</strong> Map and location services</li>
                <li><strong>Cloud Storage Providers:</strong> For storing images and files</li>
                <li><strong>Analytics Providers:</strong> For platform analytics and performance monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Legal Requirements</h3>
              <p className="text-foreground/90">
                We may disclose your personal data if required by law, court order, or governmental authority, or to protect the rights, property, or safety of the Platform, our users, or others.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
              <p className="text-foreground/90 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure hosting infrastructure</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal data, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-foreground/90 mb-4">
                We retain your personal data for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Active Accounts:</strong> We retain your data while your account is active</li>
                <li><strong>Closed Accounts:</strong> After account closure, we may retain certain data for up to 7 years for legal compliance and audit purposes</li>
                <li><strong>Business Records:</strong> Business-related data may be retained for regulatory compliance periods</li>
                <li><strong>Messages:</strong> Message data may be retained as long as both parties maintain active accounts</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Your Rights Under PDPA</h2>
              <p className="text-foreground/90 mb-4">
                Under the Personal Data Protection Act 2010, you have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-foreground/90">
                <li>
                  <strong>Right of Access:</strong> You have the right to request access to your personal data and obtain information about how we process it
                </li>
                <li>
                  <strong>Right to Correction:</strong> You have the right to request correction of inaccurate or incomplete personal data
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you have the right to withdraw your consent at any time
                </li>
                <li>
                  <strong>Right to Limit Processing:</strong> You have the right to request limitation of processing in certain circumstances
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used format
                </li>
                <li>
                  <strong>Right to Object:</strong> You have the right to object to processing of your personal data in certain circumstances
                </li>
              </ul>
              <p className="text-foreground/90 mt-4">
                To exercise any of these rights, please contact us using the details provided in the "Contact Us" section below.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Cookies and Tracking Technologies</h2>
              <p className="text-foreground/90 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our Platform. These technologies help us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Remember your preferences and settings</li>
                <li>Maintain your login session</li>
                <li>Analyze platform usage and performance</li>
                <li>Improve user experience and functionality</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                You can control cookie settings through your browser preferences. However, disabling cookies may affect the functionality of certain features on the Platform.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
              <p className="text-foreground/90">
                Your personal data may be transferred to and processed in countries outside Malaysia, including data center locations used by our service providers (e.g., Supabase, cloud storage providers). When we transfer data internationally, we ensure appropriate safeguards are in place to protect your personal data in accordance with PDPA requirements and international data protection standards.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Children's Privacy</h2>
              <p className="text-foreground/90">
                Our Platform is intended for alumni of Universiti Teknologi PETRONAS, who are typically 18 years of age or older. We do not knowingly collect personal data from individuals under 18 years of age. If you believe we have inadvertently collected data from a minor, please contact us immediately.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-foreground/90">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on the Platform with a new "Last Updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
              <p className="text-foreground/90 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">UTP Alumni Association - Data Protection Office</p>
                <p className="text-sm text-foreground/90">Email: alumni@utp.edu.my</p>
                <p className="text-sm text-foreground/90">Address: Universiti Teknologi PETRONAS, 32610 Seri Iskandar, Perak, Malaysia</p>
              </div>
              <p className="text-foreground/90 mt-4">
                We will respond to your inquiry within 21 days as required under the PDPA 2010.
              </p>
            </section>

            {/* Complaints */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Complaints</h2>
              <p className="text-foreground/90">
                If you believe we have not handled your personal data in accordance with this Privacy Policy or the PDPA 2010, you have the right to lodge a complaint with the Personal Data Protection Commissioner of Malaysia:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-3 space-y-2">
                <p className="font-medium">Personal Data Protection Department</p>
                <p className="text-sm text-foreground/90">Ministry of Communications and Digital</p>
                <p className="text-sm text-foreground/90">Level 4-7, Lot 4G9, Precinct 4, Federal Government Administrative Centre</p>
                <p className="text-sm text-foreground/90">62100 Putrajaya, Malaysia</p>
                <p className="text-sm text-foreground/90">Website: www.pdp.gov.my</p>
              </div>
            </section>

            {/* Footer Links */}
            <div className="border-t pt-8 mt-12">
              <p className="text-sm text-muted-foreground">
                Related Documents:{' '}
                <Link to="/abud/terms" className="text-primary hover:underline">
                  Terms of Service
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
