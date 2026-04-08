import {
  Dribbble,
  Facebook,
  Github,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

const quickLinks = [
  { text: 'About Us', href: '#' },
  { text: 'How It Works', href: '#' },
  { text: 'Blog', href: '#' },
  { text: 'Success Stories', href: '#' },
];

const supportLinks = [
  { text: 'Help Center', href: '#' },
  { text: 'Contact Us', href: '#' },
  { text: 'FAQ', href: '#' },
  { text: 'Privacy Policy', href: '#' },
];

const contactInfo = [
  { icon: Mail, text: 'support@edutu.com' },
  { icon: Phone, text: '+1 (555) 123-4567' },
  { icon: MapPin, text: 'San Francisco, CA', isAddress: true },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-zinc-950 mt-16 w-full">
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="text-center sm:text-left">
            <div className="flex justify-center gap-2 sm:justify-start">
              <span className="text-2xl font-bold text-white">Edutu</span>
            </div>

            <p className="mt-6 max-w-md text-center leading-relaxed text-zinc-400 sm:max-w-xs sm:text-left">
              AI-powered platform connecting students to global opportunities - scholarships, fellowships, internships, and more.
            </p>

            <ul className="mt-8 flex justify-center gap-6 sm:justify-start">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-zinc-400 hover:text-orange-500 transition">
                    <span className="sr-only">{label}</span>
                    <Icon className="size-6" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium text-white">Quick Links</p>
            <ul className="mt-8 space-y-4 text-sm">
              {quickLinks.map(({ text, href }) => (
                <li key={text}>
                  <Link className="text-zinc-400 hover:text-orange-500 transition" href={href}>
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium text-white">Support</p>
            <ul className="mt-8 space-y-4 text-sm">
              {supportLinks.map(({ text, href }) => (
                <li key={text}>
                  <Link className="text-zinc-400 hover:text-orange-500 transition" href={href}>
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium text-white">Contact</p>
            <ul className="mt-8 space-y-4 text-sm">
              {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                <li key={text}>
                  <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                    <Icon className="size-5 shrink-0 text-orange-500" />
                    {isAddress ? (
                      <address className="text-zinc-400 flex-1 not-italic transition">
                        {text}
                      </address>
                    ) : (
                      <span className="text-zinc-400 flex-1 transition">
                        {text}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm text-zinc-500">
              <span className="block sm:inline">All rights reserved.</span>
            </p>

            <p className="mt-4 text-sm text-zinc-500 sm:order-first sm:mt-0">
              &copy; 2025 Edutu. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}