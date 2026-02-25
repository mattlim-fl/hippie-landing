import { PageLayout, PageTitle } from "@/components/layout";
import { ContactForm } from "@/components/contact";

const Contact = () => {
  return (
    <PageLayout background="dark">
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12">
        <PageTitle className="mb-4">Contact Us</PageTitle>

        <p className="text-center text-hippie-white/70 max-w-md mb-8">
          Have a question or need to get in touch? Select a category below and we'll help you out.
        </p>

        <div className="w-full max-w-lg">
          <div className="bg-black/40 backdrop-blur-sm border-2 border-hippie-gold/30 rounded-xl p-6 md:p-8">
            <ContactForm venue="hippie" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
