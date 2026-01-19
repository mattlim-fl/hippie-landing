import { Link } from "react-router-dom";
import SocialLinks from "@/components/SocialLinks";

interface HeaderProps {
  className?: string;
}

const Header = ({ className = "" }: HeaderProps) => {
  return (
    <header className={`w-full py-6 px-4 md:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="font-display text-2xl md:text-3xl text-hippie-gold tracking-wider uppercase">
            Hippie Club
          </h1>
        </Link>

        {/* Social Links */}
        <SocialLinks
          showLabel
          labelClassName="hidden sm:inline mr-2"
          className="gap-2"
        />
      </div>
    </header>
  );
};

export default Header;




