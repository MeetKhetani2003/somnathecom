"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";

export default function About() {
  return (
    <div className="bg-bg-base min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 py-20 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "radial-gradient(#8B1D8F 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        <div className="relative z-10 mx-auto max-w-[1240px] px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[40px] font-bold tracking-tight text-dark md:text-[56px] lg:text-[64px]"
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-dark/70 md:text-[18px]"
          >
            Welcome to Somnath NX. We believe that true comfort starts from the moment you unwind. As India's premium destination for nightwear and loungewear, our mission is to redefine your relaxation experience.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden rounded-[32px] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 z-10"></div>
              <Image 
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80" 
                alt="Premium Fabrics" 
                fill 
                className="object-cover" 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-display text-[32px] font-bold text-dark md:text-[40px]">Crafted with Passion</h2>
                <p className="mt-4 text-[16px] leading-relaxed text-dark/70">
                  Founded with a vision to provide luxurious comfort without compromise, Somnath NX has grown into a trusted name for high-quality nightwear. Every stitch, every fabric, and every design is thoughtfully curated to bring you the best in class. 
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-dark/70">
                  From our signature Tencel collections to our cozy Hosiery line, we prioritize breathable, skin-friendly materials that look as good as they feel.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 pt-4">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-dark mb-2">Premium Quality</h3>
                  <p className="text-[14px] text-dark/60">We source only the finest fabrics ensuring longevity and unmatched softness.</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-dark mb-2">Customer First</h3>
                  <p className="text-[14px] text-dark/60">Your comfort is our priority. We design with your daily relaxation in mind.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-surface py-20 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-[1240px] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-[32px] font-bold text-dark">Why Choose Us?</h2>
            <p className="mt-4 text-[16px] text-dark/60 max-w-2xl mx-auto">Experience the Somnath NX difference with every order.</p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Secure Shopping", desc: "100% secure payment gateways for a worry-free experience." },
              { icon: Truck, title: "Fast Delivery", desc: "Express shipping options so you get your comfort wear sooner." },
              { icon: Heart, title: "Ethical Practices", desc: "Committed to sustainable and ethical manufacturing processes." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center p-6"
              >
                <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/5 text-primary">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 font-display text-[18px] font-bold text-dark">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-dark/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
