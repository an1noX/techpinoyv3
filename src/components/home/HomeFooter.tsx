
import { Link } from "react-router-dom";
import { Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export const HomeFooter = () => {
  const { settings } = useSettings();
  
  // Default footer sections
  const footerSections = [
    {
      title: "My Account",
      links: [
        { label: "Shopping Cart", url: "/cart" },
        { label: "Track Order", url: "/track-order" },
        { label: "Auto Reorder", url: "/reorder" }
      ]
    },
    {
      title: "Company Info",
      links: [
        { label: "About Us", url: "/about" },
        { label: "Contact Us", url: "/contact" },
        { label: "Blog", url: "/blog" },
        { label: "Coupons", url: "/coupons" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Shipping Policy", url: "/shipping" },
        { label: "Returns Policy", url: "/returns" },
        { label: "Payment Methods", url: "/payment" },
        { label: "Terms of Use", url: "/terms" },
        { label: "Privacy Policy", url: "/privacy" }
      ]
    }
  ];

  // Social media icons with links from settings
  const socialIcons = [
    { Icon: Facebook, url: settings?.social_media?.facebook || '#' },
    { Icon: Twitter, url: settings?.social_media?.twitter || '#' },
    { Icon: Instagram, url: settings?.social_media?.instagram || '#' },
    { Icon: Youtube, url: settings?.social_media?.youtube || '#' }
  ];

  // Contact information from settings
  const contactPhone = settings?.phone_number || "(877) 518-1272";
  const contactEmail = settings?.email || "support@techpinoy.com";
  const officeHours = settings?.office_hours || "Mon - Fri 9am - 5pm PST\nCLOSED SAT. & SUN.";

  // Format office hours for display (handle line breaks)
  const formattedOfficeHours = officeHours.split("\n").map((line, index) => (
    <div key={index}>{line}</div>
  ));

  return (
    <footer className="bg-teal-700 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 border-b border-teal-600 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.url} 
                      className="hover:text-yellow-300 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-teal-600 pb-2">
              Have a Question?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                <a 
                  href={`tel:${contactPhone.replace(/\D/g, '')}`} 
                  className="hover:text-yellow-300 transition-colors text-sm"
                >
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                <a 
                  href={`mailto:${contactEmail}`} 
                  className="hover:text-yellow-300 transition-colors text-sm"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="text-sm mt-2 text-teal-200">
                {formattedOfficeHours}
              </li>
              
              <li>
                <h3 className="text-lg font-semibold mt-6 mb-2">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialIcons.map(({ Icon, url }, index) => (
                    <a 
                      key={index} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-teal-700 rounded-full h-8 w-8 flex items-center justify-center hover:bg-yellow-300 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-teal-800 py-4">
        <div className="container mx-auto px-4 text-center text-teal-100">
          <p className="text-sm">
            © {new Date().getFullYear()} {settings?.store_name || 'TechPinoy'}. All Rights Reserved | 
            <Link to="/privacy" className="hover:text-yellow-300 ml-1 mr-1">Privacy Policy</Link> | 
            <Link to="/terms" className="hover:text-yellow-300 ml-1">Terms of Use</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
