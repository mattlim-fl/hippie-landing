interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

const PageTitle = ({ children, className = "" }: PageTitleProps) => {
  return (
    <h2 className={`hippie-page-title ${className}`}>
      {children}
    </h2>
  );
};

export default PageTitle;

