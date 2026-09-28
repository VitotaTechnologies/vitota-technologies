import { ContactForm } from './ContactForm';

export function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Get In Touch</h2>
          <p className="mt-4 text-text-secondary">Tell us about your project and we'll respond promptly.</p>
        </div>
        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}