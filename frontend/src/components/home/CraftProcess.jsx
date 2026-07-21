import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, SectionTitle } from '../../components/ui';

const steps = [
  {
    number: 1,
    title: 'Material Selection',
    description: "Sourcing the finest natural materials from Nepal's diverse regions, from clay to timber, wool to cotton.",
  },
  {
    number: 2,
    title: 'Hand Shaping',
    description: 'Skilled artisans transform raw materials using time-honored techniques passed down through generations.',
  },
  {
    number: 3,
    title: 'Intricate Detailing',
    description: 'Each piece receives meticulous attention with hand-carved patterns, hand-painted motifs, and beautiful embellishments.',
  },
  {
    number: 4,
    title: 'Finishing & Polishing',
    description: 'Products are carefully finished with natural oils, polishes, and treatments to enhance beauty and durability.',
  },
  {
    number: 5,
    title: 'Quality Assurance',
    description: 'Every item undergoes rigorous inspection to ensure it meets our standards of craftsmanship and authenticity.',
  },
];

const CraftProcess = () => {
  return (
    <Section>
      <Container>
        <SectionTitle
          subtitle="Our Process"
          title="The Craftsmanship Journey"
          description="Every piece tells a story — from raw materials in Nepal's hills to a finished treasure in your home"
        />

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="relative mt-16 md:mt-20"
        >
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-linear-to-r from-primary/20 via-secondary/40 to-primary/20" />

          <div className="grid md:grid-cols-5 gap-8 md:gap-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={{
                  initial: { opacity: 0, y: 40 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-0"
              >
                {/* Vertical connector line (mobile) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute left-5 top-12 w-0.5 h-[calc(100%+2rem)] bg-linear-to-b from-primary/30 to-primary/5" />
                )}

                {/* Step number circle */}
                <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-white flex items-center justify-center font-heading font-semibold text-lg md:text-xl shrink-0 shadow-md">
                  {step.number}
                </div>

                {/* Content */}
                <div className="md:text-center md:mt-4">
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed md:max-w-[200px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CraftProcess;
