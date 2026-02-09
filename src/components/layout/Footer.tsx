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

        {/* Social & Email Icons */}
        <div className="flex items-center gap-3">
          <SocialLinks />
          <a
            href="mailto:hello@hippieclub.com"
            className="w-8 h-8 rounded-full bg-hippie-green-dark flex items-center justify-center transition-transform hover:scale-110"
            aria-label="Email us"
          >
            <svg
              className="w-4 h-4 text-hippie-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>
        </div>

        {/* Address */}
        <p className="font-body text-sm text-hippie-white drop-shadow-lg text-center">
          663 Newcastle Street Leederville
        </p>
      </div>
    </footer>
  );
};

export default Footer;

