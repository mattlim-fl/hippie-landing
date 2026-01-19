import SocialLinks from "@/components/SocialLinks";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  return (
    <footer className={`w-full py-8 px-4 bg-transparent ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        {/* TORSO Illustration */}
        <img
          src="/Graphic Assets/Illustration/Hippie Club - Illustration TORSO.png"
          alt="Hippie Club illustration"
          className="max-w-32 md:max-w-40 h-auto"
        />

        {/* Social Section */}
        <SocialLinks
          showLabel
          labelClassName="bg-hippie-green-dark/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
        />

        {/* Contact Information */}
        <div className="space-y-1 text-center">
          <p className="font-body text-sm text-hippie-white drop-shadow-lg">
            663 Newcastle St, Leederville WA 6060
          </p>
          <p className="font-body text-sm text-hippie-white drop-shadow-lg">
            E hello@hippieclub.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

