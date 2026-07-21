import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineMap, HiOutlinePaperAirplane } from 'react-icons/hi';
import { Button, Container } from '../components/ui';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: HiOutlineMap,
      title: 'Visit Us',
      detail: 'Kathmandu, Nepal',
    },
    {
      icon: HiOutlinePhone,
      title: 'Call Us',
      detail: '+977-1-2345678',
    },
    {
      icon: HiOutlineMail,
      title: 'Email Us',
      detail: 'info@kalabazaar.com',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-6">
              Get in Touch
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold text-text mb-6 leading-tight">
              Let's Start a <span className="text-primary">Conversation</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted leading-relaxed">
              Have a question, suggestion, or just want to say hello? We'd love to hear from you.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-6 tracking-tight">
                Contact Information
              </h2>
              <p className="text-text-muted text-lg mb-12 leading-relaxed">
                Reach out to us through any of these channels. We typically respond within 24 hours.
              </p>

              <div className="space-y-6">
                {contactInfo.map(({ icon: Icon, title, detail }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-border/50"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-text mb-1">
                        {title}
                      </h3>
                      <p className="text-text-muted">{detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/50 p-8">
                <h2 className="font-heading text-2xl font-semibold text-text mb-6">
                  Send us a Message
                </h2>

                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" icon={HiOutlinePaperAirplane}>
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Contact;