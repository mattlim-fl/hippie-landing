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
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;

