interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  return (
    <footer className={`w-full py-6 px-4 text-center bg-transparent ${className}`}>
      {/* Contact Information */}
      <div className="space-y-1">
        <p className="font-body text-sm text-hippie-white drop-shadow-lg">
          663 Newcastle St, Leederville WA 6060
        </p>
        <p className="font-body text-sm text-hippie-white drop-shadow-lg">
          E hello@manorleederville.com
        </p>
      </div>
    </footer>
  );
};

export default Footer;

