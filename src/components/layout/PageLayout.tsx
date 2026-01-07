import Header from "./Header";
import Footer from "./Footer";

type BackgroundVariant = "dark" | "teal" | "coral" | "collage";

interface PageLayoutProps {
  children: React.ReactNode;
  background?: BackgroundVariant;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const backgroundClasses: Record<BackgroundVariant, string> = {
  dark: "bg-pattern-dark bg-swirl-dark",
  teal: "bg-pattern-teal bg-swirl-teal",
  coral: "bg-pattern-coral bg-swirl-coral",
  collage: "bg-pattern-collage",
};

const PageLayout = ({
  children,
  background = "dark",
  className = "",
  hideHeader = false,
  hideFooter = false,
}: PageLayoutProps) => {
  return (
    <div
      className={`min-h-screen flex flex-col text-hippie-white ${backgroundClasses[background]} ${className}`}
    >
      {!hideHeader && <Header />}
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default PageLayout;




