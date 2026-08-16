import { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function PageTransition() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 页面加载完成后触发动画
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    if (!isLoaded) return;

    // Hero 区域淡入
    gsap.from('[data-section="hero"]', {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out'
    });

    // Profile 区域依次淡入
    gsap.from('[data-section="profile"]', {
      opacity: 0,
      y: 40,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '[data-section="profile"]',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    // Projects 区域淡入
    gsap.from('[data-section="projects"]', {
      opacity: 0,
      y: 40,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '[data-section="projects"]',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    // 项目卡片 stagger 动画
    gsap.from('.project-card', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.project-showcase',
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    });
  }, { dependencies: [isLoaded], scope: document });

  return null;
}
