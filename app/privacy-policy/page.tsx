"use client";

import {Card} from "@/components/ui/card";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

export default function PrivacyPolicyPage() {
    return (
        <>
            <title>Soulasia | Privacy Policy</title>
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4">
                    <Card className="max-w-4xl mx-auto p-6 md:p-8">
                        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

                        {/* Intro always visible */}
                        <section className="text-gray-600 space-y-3 mb-6">
                            <p>
                                This Privacy Policy explains how{" "}
                                <strong>Soulasia Management Sdn. Bhd.</strong> (&quot;Soulasia&quot;, &quot;we&quot;,
                                &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and protects your
                                personal data when you visit our websites, make a booking, stay at one of our
                                properties, or otherwise interact with us.
                            </p>
                            <p>
                                We handle your personal data in accordance with the{" "}
                                <strong>Personal Data Protection Act 2010 (PDPA) of Malaysia</strong> and other
                                applicable laws. By using our services or providing your personal data to us, you
                                acknowledge that you have read and understood this Privacy Policy.
                            </p>
                            <p className="text-sm text-gray-500">
                                Tip: tap or click a section below to expand and read the details.
                            </p>
                        </section>

                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-2 text-gray-600"
                            defaultValue="section-1"
                        >
                            {/* 1. Who We Are */}
                            <AccordionItem value="section-1">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    1. Who We Are
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        This Privacy Policy is issued by{" "}
                                        <strong>Soulasia Management Sdn. Bhd.</strong>, a company registered in
                                        Malaysia.
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong>Legal entity name:</strong> Soulasia Management Sdn. Bhd.
                                        </li>
                                        <li>
                                            <strong>Registration number:</strong> 202301007902 (1501823-H)
                                        </li>
                                        <li>
                                            <strong>Registered address:</strong> B1-22-2, The Soho Suites @KLCC, 20
                                            Jalan
                                            Perak, 50450, WP Kuala Lumpur, Malaysia
                                        </li>
                                        <li>
                                            <strong>Trading name:</strong> &quot;Soulasia&quot; is a registered
                                            trademark
                                            and used as our trading name in this Privacy Policy.
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 2. Scope */}
                            <AccordionItem value="section-2">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    2. Scope of This Policy
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>This Privacy Policy applies to:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            Visitors to our websites, including{" "}
                                            <strong>www.soulasia.com.my</strong>, <strong>checkin.soulasia.com.my</strong>{" "}
                                            and other related subdomains we operate;
                                        </li>
                                        <li>
                                            Individuals who make an enquiry or booking with us directly or via
                                            third-party
                                            platforms;
                                        </li>
                                        <li>Guests who stay in properties managed by Soulasia;</li>
                                        <li>
                                            Property owners, landlords and partners whose personal data we process;
                                        </li>
                                        <li>
                                            Representatives of corporate clients who deal with us on behalf of their
                                            company.
                                        </li>
                                    </ul>
                                    <p>
                                        It covers personal data collected through our websites and online forms,
                                        booking and reservation systems, identity verification and payment/deposit
                                        collection systems, from online travel platforms and business partners, as well
                                        as through our communication channels (including email, phone and messaging apps
                                        such as WhatsApp).
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 3. Types of Personal Data */}
                            <AccordionItem value="section-3">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    3. Types of Personal Data We Collect
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold">3.1 Data you provide to us</h3>
                                        <p className="mt-1">
                                            When you interact with us, we may collect the following categories of
                                            personal data:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>
                                                <strong>Identification and contact details:</strong> full name, email
                                                address, phone number (including WhatsApp number, where applicable).
                                            </li>
                                            <li>
                                                <strong>Travel and identification details:</strong> passport or ID
                                                number,
                                                passport or ID photo/scan, nationality or country of residence, date of
                                                birth (where required).
                                            </li>
                                            <li>
                                                <strong>Booking and stay information:</strong> property booked, check-in
                                                and
                                                check-out dates, number of guests and guest names (where provided),
                                                special
                                                requests or preferences (e.g. late check-in, early check-in, allergies,
                                                or
                                                other details you choose to share).
                                            </li>
                                            <li>
                                                <strong>Payment and billing information:</strong> payment method details
                                                (such as partial card details or transaction identifiers), billing
                                                address
                                                (where applicable), deposit and refund details.
                                            </li>
                                            <li>
                                                <strong>Corporate/partner information:</strong> company name and
                                                business
                                                contact details, job title or role, and information relating to property
                                                or
                                                partnership agreements.
                                            </li>
                                        </ul>
                                        <p className="mt-3">
                                            We generally use third-party payment service providers to process payments.
                                            We
                                            do not store full payment card numbers on our own systems.
                                        </p>
                                        <p className="mt-2">
                                            You may choose not to provide certain information, but if you do, we may not
                                            be able to provide some services (for example, we may not be able to
                                            complete
                                            your booking or comply with legal obligations).
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">3.2 Data collected automatically</h3>
                                        <p className="mt-1">
                                            When you visit our websites, we may automatically collect:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>IP address;</li>
                                            <li>Browser type and version;</li>
                                            <li>Device type and operating system;</li>
                                            <li>Pages visited, time and date of visit, and time spent on pages;</li>
                                            <li>Referring website or source (where available).</li>
                                        </ul>
                                        <p className="mt-3">
                                            We collect this information using standard technologies such as server logs,
                                            cookies and similar tools. This helps us keep our websites secure and
                                            functioning properly, understand how visitors use our websites, improve our
                                            content, user experience and services, and support security monitoring,
                                            business analytics and, where used, marketing activities.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">3.3 Data we receive from third parties</h3>
                                        <p className="mt-1">
                                            We may also receive personal data about you from third parties, such as:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Online travel and booking platforms where you book our properties;</li>
                                            <li>
                                                Corporate clients or relocation partners who make a booking on your
                                                behalf;
                                            </li>
                                            <li>
                                                Payment service providers who process your payments and confirm
                                                transaction
                                                status;
                                            </li>
                                            <li>Identity verification and deposit/security providers;</li>
                                            <li>
                                                Property owners, landlords and building management in relation to your
                                                stay;
                                            </li>
                                            <li>
                                                Other business partners involved in providing accommodation or related
                                                services.
                                            </li>
                                        </ul>
                                        <p className="mt-3">
                                            We handle this information in accordance with this Privacy Policy, in
                                            addition
                                            to any privacy terms you have agreed to with those third parties.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 4. Purposes */}
                            <AccordionItem value="section-4">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    4. Purposes for Which We Use Your Personal Data
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <p>
                                        We collect and process personal data for security, marketing and business
                                        analytical purposes, as well as for the day-to-day provision of our services.
                                    </p>

                                    <div>
                                        <h3 className="font-semibold">
                                            4.1 Guests (people who book and stay with us)
                                        </h3>
                                        <p className="mt-1">We use guest data to:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Create, manage and cancel reservations;</li>
                                            <li>Verify identity where required by law or our security procedures;</li>
                                            <li>Process payments, deposits and refunds;</li>
                                            <li>
                                                Send booking confirmations, pre-arrival messages, check-in instructions
                                                and
                                                receipts;
                                            </li>
                                            <li>
                                                Communicate with you via email, phone or messaging apps (including
                                                WhatsApp) in relation to your stay;
                                            </li>
                                            <li>Handle complaints, disputes, incident reports or claims;</li>
                                            <li>
                                                Comply with legal and regulatory requirements (e.g. immigration, tax and
                                                local authority reporting).
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">4.2 Website visitors</h3>
                                        <p className="mt-1">We use data about website visitors to:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Respond to contact form enquiries or direct messages;</li>
                                            <li>
                                                Send newsletters or promotional messages where you have subscribed or
                                                where
                                                permitted by law;
                                            </li>
                                            <li>
                                                Improve our website performance, content and user experience through
                                                analytics;
                                            </li>
                                            <li>
                                                Support marketing campaigns and retargeting activities (for example,
                                                through advertising platforms), where used.
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">4.3 Property owners and partners</h3>
                                        <p className="mt-1">
                                            We use data relating to property owners, landlords and partners to:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Manage contracts and agreements;</li>
                                            <li>Organise payouts, invoicing and financial reconciliation;</li>
                                            <li>Provide property performance reports and statements;</li>
                                            <li>Communicate about property operations, issues and improvements;</li>
                                            <li>
                                                Maintain our business relationship and meet our contractual obligations.
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            4.4 Internal operations, security and analytics
                                        </h3>
                                        <p className="mt-1">
                                            We also process personal data for internal purposes, including:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Staff training, quality assurance and service improvement;</li>
                                            <li>
                                                Generating reports and business analytics (e.g. occupancy, revenue,
                                                guest
                                                trends);
                                            </li>
                                            <li>Fraud prevention, risk management and security monitoring;</li>
                                            <li>
                                                Protecting our guests, staff, properties, systems and business
                                                interests.
                                            </li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 5. Legal Basis */}
                            <AccordionItem value="section-5">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    5. Legal Basis for Processing
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        Where required by law, we rely on one or more of the following legal bases to
                                        process personal data:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong>Performance of a contract:</strong> to provide our services, manage
                                            your booking and stay, and fulfil our contractual obligations.
                                        </li>
                                        <li>
                                            <strong>Compliance with legal obligations:</strong> to comply with
                                            applicable
                                            laws and regulations (for example, immigration, tax, accounting and
                                            reporting
                                            requirements) and lawful requests from authorities.
                                        </li>
                                        <li>
                                            <strong>Legitimate interests:</strong> to operate and improve our business,
                                            ensure safety and security, prevent fraud, respond to enquiries and
                                            complaints, run analytics and conduct marketing activities in a
                                            proportionate
                                            manner, provided that our interests are not overridden by your rights and
                                            interests.
                                        </li>
                                        <li>
                                            <strong>Consent:</strong> for certain activities, such as specific marketing
                                            communications or optional data you choose to provide, we may rely on your
                                            consent. You can withdraw your consent at any time without affecting the
                                            lawfulness of processing before withdrawal.
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 6. Sharing */}
                            <AccordionItem value="section-6">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    6. How We Share Your Personal Data
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <p>We do not sell your personal data.</p>
                                    <p>
                                        We may share your personal data with the following categories of recipients:
                                    </p>

                                    <div>
                                        <h3 className="font-semibold">6.1 Service providers (processors)</h3>
                                        <p className="mt-1">
                                            We work with third-party companies that assist us in delivering our
                                            services,
                                            for example:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Booking and reservation platforms;</li>
                                            <li>Identity verification and security providers;</li>
                                            <li>Payment processors and banks;</li>
                                            <li>IT hosting, infrastructure and support providers;</li>
                                            <li>Email and communication platforms;</li>
                                            <li>Analytics and, where used, marketing/advertising services.</li>
                                        </ul>
                                        <p className="mt-3">
                                            These service providers are only allowed to use your data under our
                                            instructions and for the purposes described in this Policy.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            6.2 Business partners and property stakeholders
                                        </h3>
                                        <p className="mt-1">
                                            We may share relevant information with property owners or building
                                            management
                                            where necessary for your stay, security and compliance; corporate clients or
                                            relocation partners who booked on your behalf; and other partners involved
                                            in
                                            providing your accommodation or add-on services.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">6.3 Authorities and legal recipients</h3>
                                        <p className="mt-1">
                                            We may disclose personal data where we are required to do so by law,
                                            regulation or court order; in response to lawful requests from law
                                            enforcement, regulatory or government authorities; or to establish, exercise
                                            or defend our legal rights, or to protect our guests, staff, properties or
                                            business.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">6.4 Business transfers</h3>
                                        <p className="mt-1">
                                            If Soulasia is involved in a merger, acquisition, restructuring, asset sale
                                            or
                                            similar transaction, your personal data may be transferred as part of that
                                            transaction, subject to appropriate confidentiality safeguards.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 7. International transfers */}
                            <AccordionItem value="section-7">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    7. International Data Transfers
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        Our service providers, business partners and systems may be located in countries
                                        other than the one you reside in. As a result, your personal data may be
                                        transferred to and processed in jurisdictions with different data protection
                                        laws.
                                    </p>
                                    <p>
                                        Where we transfer personal data internationally, we will take reasonable steps
                                        to ensure that such transfers comply with applicable legal requirements and that
                                        your personal data remains protected by appropriate safeguards.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 8. Retention */}
                            <AccordionItem value="section-8">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    8. Data Retention
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        We retain personal data only for as long as reasonably necessary for the
                                        purposes described in this Privacy Policy, including:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Providing our services and managing bookings and stays;</li>
                                        <li>Meeting legal, accounting, tax and regulatory obligations;</li>
                                        <li>Managing disputes and enforcing our rights.</li>
                                    </ul>
                                    <p className="mt-2">In general, we apply the following retention periods:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>
                                            <strong>Booking and finance records:</strong> kept for up to{" "}
                                            <strong>7 years</strong> to comply with tax, accounting and statutory record
                                            requirements.
                                        </li>
                                        <li>
                                            <strong>Passport/ID copies and related verification data:</strong> kept for
                                            up to <strong>12 months after check-out</strong>, unless a longer period is
                                            required by law or necessary in connection with an ongoing claim,
                                            investigation or dispute.
                                        </li>
                                        <li>
                                            <strong>Marketing-related data (e.g. newsletter
                                                subscriptions):</strong> kept
                                            until you unsubscribe, object to processing, or we no longer need it for the
                                            purpose collected, whichever comes first.
                                        </li>
                                    </ul>
                                    <p className="mt-2">
                                        When personal data is no longer needed, we will delete it, anonymise it or
                                        securely destroy it.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 9. Security */}
                            <AccordionItem value="section-9">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    9. How We Protect Your Personal Data
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        We use a combination of technical and organisational measures to protect your
                                        personal data, including:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Use of secure connections (HTTPS) on our websites;</li>
                                        <li>
                                            Access controls and authentication for systems where personal data is
                                            stored;
                                        </li>
                                        <li>
                                            Limiting access to personal data to authorised staff and service providers
                                            who
                                            need it to perform their duties;
                                        </li>
                                        <li>
                                            Internal procedures and awareness to encourage responsible handling of
                                            personal data.
                                        </li>
                                    </ul>
                                    <p className="mt-2">
                                        While we take reasonable steps to protect your data, no system or transmission
                                        can be guaranteed as completely secure.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 10. Rights */}
                            <AccordionItem value="section-10">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    10. Your Rights
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        Subject to applicable law, you may have the following rights in relation to your
                                        personal data:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong>Right of access</strong> – to request confirmation whether we
                                            process
                                            your personal data and obtain a copy of it.
                                        </li>
                                        <li>
                                            <strong>Right to correction</strong> – to request that inaccurate or
                                            incomplete data be corrected or updated.
                                        </li>
                                        <li>
                                            <strong>Right to deletion</strong> – to request that we delete your personal
                                            data in certain circumstances.
                                        </li>
                                        <li>
                                            <strong>Right to restriction</strong> – to request that we limit the
                                            processing of your data in certain situations.
                                        </li>
                                        <li>
                                            <strong>Right to object</strong> – to object to certain processing,
                                            including
                                            direct marketing.
                                        </li>
                                        <li>
                                            <strong>Right to withdraw consent</strong> – where processing is based on
                                            your
                                            consent, you may withdraw it at any time.
                                        </li>
                                    </ul>
                                    <p className="mt-2">
                                        To exercise any of these rights, please contact us using the details in Section
                                        13. We may need to verify your identity before handling your request and may be
                                        unable to comply where we are legally required or permitted to retain certain
                                        data.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 11. Cookies */}
                            <AccordionItem value="section-11">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    11. Cookies and Similar Technologies
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        Our websites may use cookies and similar technologies to ensure the website
                                        functions properly, remember certain preferences where applicable, collect
                                        statistics on how the site is used (for analytics), and support marketing and
                                        advertising activities (where used).
                                    </p>
                                    <p>
                                        You can usually configure your browser to block or delete cookies, or to alert
                                        you when cookies are being set. If you disable cookies, some features of the
                                        website may not work properly.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 12. Third-party websites */}
                            <AccordionItem value="section-12">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    12. Third-Party Websites
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        Our websites and communications may contain links to third-party websites or
                                        services that are not operated by us. We are not responsible for the privacy
                                        practices or content of those third parties.
                                    </p>
                                    <p>
                                        We encourage you to review the privacy policies of any external sites or
                                        services you use.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 13. Contact */}
                            <AccordionItem value="section-13">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    13. Contacting Us
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        If you have any questions about this Privacy Policy, our data practices, or if
                                        you wish to exercise your rights, you can contact us at:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong>Email:</strong> admin@soulasia.com.my
                                        </li>
                                        <li>
                                            <strong>Postal address:</strong> Soulasia Management Sdn. Bhd., B1-22-2, The
                                            Soho Suites @KLCC, 20 Jalan Perak, 50450, WP Kuala Lumpur, Malaysia.
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 14. Changes */}
                            <AccordionItem value="section-14">
                                <AccordionTrigger className="text-left text-base md:text-lg">
                                    14. Changes to This Privacy Policy
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>
                                        We may update this Privacy Policy from time to time to reflect changes in our
                                        services, practices or legal requirements. The &quot;Last updated&quot; date
                                        below shows when this Policy was last changed.
                                    </p>
                                    <p>
                                        We encourage you to review this page periodically to stay informed about how we
                                        handle your personal data.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Footer / Last updated */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Last updated: 15 November 2025
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
