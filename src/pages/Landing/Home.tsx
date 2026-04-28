import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from "../../components/landing/Hero.tsx";
import Features from '../../components/landing/Features.tsx';
import AIHighlight from '../../components/landing/AIHighlight.tsx';
import Showcase from '../../components/landing/Showcase.tsx';
import HowItWorks from '../../components/landing/HowItWorks.tsx';
import TestimonialCarousel from '../../components/landing/TestimonialCarousel.tsx';
import CTA from '../../components/landing/CTA.tsx';
import BookingForm from '../../components/landing/BookingForm.tsx';
import SEO from '../../components/common/SEO.tsx';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <>
      <SEO 
        title="Predictive AI CRM for Future-Ready Businesses"
        description="Streamline customer relationships with Avinya AI CRM. Automate sales, manage leads, and scale your business with intelligent AI insights."
        keywords="AI CRM, Predictive Sales, Lead Management Automation, Intelligent CRM, Avinya AI"
      />
      <Hero />
      <Features />
      <AIHighlight />
      <Showcase />
      <HowItWorks />
      <TestimonialCarousel />
      <div id="booking">
        <BookingForm />
      </div>
      <CTA />
    </>
  );
}
