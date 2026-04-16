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

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#booking') {
      const element = document.getElementById('booking');
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [hash]);

  return (
    <>
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
