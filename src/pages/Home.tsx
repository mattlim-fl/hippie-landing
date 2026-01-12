import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout";

const Home = () => {
  return (
    <PageLayout background="collage" hideHeader>
      <div 
        className="flex-1 flex flex-col relative"
        style={{
          backgroundImage: 'url(/hippie-club-collage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-start pt-8 px-4 relative z-10">
          {/* Logo */}
          <h1 className="font-display text-4xl md:text-5xl text-hippie-gold tracking-wider uppercase mb-4 drop-shadow-lg">
            Hippie Club
          </h1>

          {/* Opening Hours */}
          <p className="font-display text-hippie-coral text-lg md:text-xl uppercase tracking-wide mb-8 drop-shadow-lg">
            Saturdays<br />
            9pm - 5am
          </p>

          {/* Navigation Buttons */}
          <nav className="flex flex-col gap-3 w-full max-w-xs mb-6">
            <Link to="/photos" className="hippie-btn-pill text-center">
              Photos
            </Link>
            <Link to="/guest-list" className="hippie-btn-pill text-center">
              Guest List
            </Link>
            <a 
              href="https://manorleederville.com/services" 
              target="_blank"
              rel="noopener noreferrer"
              className="hippie-btn-pill text-center"
            >
              Venue Hire at Manor
            </a>
            <a 
              href="https://manorleederville.com/karaoke" 
              target="_blank"
              rel="noopener noreferrer"
              className="hippie-btn-pill text-center"
            >
              Karaoke at Manor
            </a>
          </nav>
        </section>

        {/* "Have you been snapped?" Section */}
        <section className="pt-4 pb-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto relative">
            {/* Photos arranged horizontally with vertical offset */}
            <div className="flex flex-row gap-4 justify-center items-start relative">
              {/* Left photo (home-1.jpg) - positioned higher */}
              <div className="w-32 h-40 md:w-40 md:h-52 border-2 border-hippie-coral rounded-lg transform -rotate-3 overflow-hidden shadow-lg">
                <img 
                  src="/home-1.jpg" 
                  alt="Hippie Club nightlife photo" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Starburst text - positioned in the middle, overlapping both images */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-hippie-white px-6 py-3 rounded-full transform rotate-[-5deg] shadow-lg">
                  <span className="font-display text-hippie-charcoal text-sm md:text-base uppercase tracking-wide text-center block">
                    Have you been snapped?
                  </span>
                </div>
              </div>

              {/* Right photo (home-2.jpg) - positioned lower */}
              <div className="w-32 h-40 md:w-40 md:h-52 border-2 border-hippie-coral rounded-lg transform rotate-2 overflow-hidden shadow-lg mt-24 md:mt-32">
                <img 
                  src="/home-2.jpg" 
                  alt="Hippie Club nightlife photo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Section */}
        <section className="py-8 px-4 flex flex-col items-center relative z-10">
          {/* Follow Us */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-display text-sm text-hippie-white uppercase tracking-wider bg-hippie-green-dark/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              Follow Us
            </span>
            <a
              href="https://instagram.com/hippieclub"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-hippie-green-dark flex items-center justify-center transition-transform hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 text-hippie-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://facebook.com/hippieclub"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-hippie-green-dark flex items-center justify-center transition-transform hover:scale-110"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 text-hippie-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;

