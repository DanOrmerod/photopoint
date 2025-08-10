import { Injectable, inject } from '@angular/core';
import { Theme } from './theme.service';
import { WebsiteService } from './website.service';

export interface TemplateBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'spacer' | 'button' | 'columns' | 'testimonial' | 'pricing' | 'contact' | 'stats' | 'cta' | 'features' | 'faq' | 'team' | 'blog' | 'newsletter';
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    borderRadius?: string;
    maxWidth?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    boxShadow?: string;
    [key: string]: any;
  };
  animations?: {
    entrance?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn';
    duration?: number;
    delay?: number;
  };
  responsive?: {
    mobile?: Partial<TemplateBlock['styles']>;
    tablet?: Partial<TemplateBlock['styles']>;
    desktop?: Partial<TemplateBlock['styles']>;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'portfolio' | 'e-commerce' | 'blog' | 'landing' | 'restaurant' | 'agency' | 'healthcare' | 'education' | 'nonprofit' | 'fitness';
  thumbnail: string;
  theme: Theme;
  pages: {
    name: string;
    slug: string;
    title: string;
    metaDescription: string;
    blocks: TemplateBlock[];
    isHomePage?: boolean;
    seo?: {
      keywords?: string[];
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    };
  }[];
  features: string[];
  preview?: {
    primaryColor: string;
    layout: string;
    typography: string;
  };
  pricing: 'free' | 'premium';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  targetAudience: string[];
  includesContent: boolean;
  demoUrl?: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private websiteService: WebsiteService) {}

  private templates: Template[] = [
    // MODERN BUSINESS TEMPLATE
    {
      id: 'modern-business',
      name: 'Modern Business',
      description: 'Professional business website with clean design and trust-building sections',
      category: 'business',
      thumbnail: '/assets/templates/modern-business-thumb.jpg',
      theme: {
        id: 'professional-business',
        name: 'Professional Business',
        description: 'Corporate and trustworthy design',
        category: 'business',
        preview: { primaryColor: '#1f2937', secondaryColor: '#6b7280', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#059669' },
        styles: {} as any,
        cssVariables: {} as any
      },
      features: ['Hero section', 'Services showcase', 'About section', 'Team profiles', 'Contact form', 'Testimonials'],
      pricing: 'free',
      difficulty: 'beginner',
      estimatedSetupTime: '30 minutes',
      targetAudience: ['Small businesses', 'Professional services', 'Consultants', 'B2B companies'],
      includesContent: true,
      tags: ['professional', 'corporate', 'business', 'services', 'clean', 'trustworthy'],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'Your Business Name - Professional Services',
          metaDescription: 'Leading provider of professional services with over 10 years of experience.',
          isHomePage: true,
          blocks: [
            {
              id: 'hero-1',
              type: 'hero',
              content: {
                headline: 'Transform Your Business With Expert Solutions',
                subheading: 'We provide cutting-edge business solutions that drive growth and innovation. Partner with us to achieve your goals.',
                buttonText: 'Get Started Today',
                buttonLink: '#contact',
                backgroundImage: '/assets/images/business-hero.jpg',
                alignment: 'left'
              },
              styles: {
                backgroundColor: '#f8fafc',
                textColor: '#1f2937',
                padding: '120px 0',
                textAlign: 'left'
              }
            },
            {
              id: 'services-1',
              type: 'columns',
              content: {
                title: 'Our Services',
                subtitle: 'Comprehensive solutions tailored to your business needs',
                columns: [
                  {
                    icon: 'fas fa-chart-line',
                    title: 'Business Strategy',
                    description: 'Strategic planning and market analysis to position your business for success.'
                  },
                  {
                    icon: 'fas fa-cogs',
                    title: 'Process Optimization',
                    description: 'Streamline operations and improve efficiency across all business functions.'
                  },
                  {
                    icon: 'fas fa-users',
                    title: 'Team Development',
                    description: 'Build high-performing teams through training and organizational development.'
                  }
                ]
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'about-1',
              type: 'columns',
              content: {
                title: 'Why Choose Us',
                subtitle: 'Over 10 years of proven results',
                columns: [
                  {
                    icon: 'fas fa-award',
                    title: '500+ Projects',
                    description: 'Successfully delivered projects across various industries'
                  },
                  {
                    icon: 'fas fa-handshake',
                    title: '98% Satisfaction',
                    description: 'Client satisfaction rate based on project completion surveys'
                  }
                ]
              },
              styles: {
                backgroundColor: '#f8fafc',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'contact-1',
              type: 'contact',
              content: {
                title: 'Ready to Get Started?',
                subtitle: 'Contact us today for a free consultation',
                phone: '(555) 123-4567',
                email: 'info@yourbusiness.com',
                address: '123 Business Street, City, State 12345'
              },
              styles: {
                backgroundColor: '#1f2937',
                textColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            }
          ]
        },
        {
          name: 'About',
          slug: '/about',
          title: 'About Us - Your Business Name',
          metaDescription: 'Learn about our company, mission, and the expert team behind our success.',
          blocks: [
            {
              id: 'about-hero',
              type: 'hero',
              content: {
                headline: 'About Our Company',
                subheading: 'Building successful businesses for over a decade',
                backgroundImage: '/assets/images/about-hero.jpg'
              },
              styles: {
                backgroundColor: '#f8fafc',
                textColor: '#1f2937',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'company-story',
              type: 'text',
              content: {
                title: 'Our Story',
                content: `Founded in 2014, we started with a simple mission: to help businesses achieve their full potential through innovative solutions and expert guidance.

                Over the years, we've grown from a small team of consultants to a full-service business solutions provider, working with companies of all sizes across various industries.

                Our approach combines deep industry knowledge with cutting-edge technology to deliver results that matter.`
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '60px 0',
                textAlign: 'left'
              }
            }
          ]
        },
        {
          name: 'Services',
          slug: '/services',
          title: 'Our Services - Your Business Name',
          metaDescription: 'Comprehensive business services including strategy, optimization, and team development.',
          blocks: [
            {
              id: 'services-hero',
              type: 'hero',
              content: {
                headline: 'Our Services',
                subheading: 'Comprehensive solutions for your business needs'
              },
              styles: {
                backgroundColor: '#f8fafc',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'detailed-services',
              type: 'columns',
              content: {
                columns: [
                  {
                    icon: 'fas fa-chart-line',
                    title: 'Business Strategy',
                    description: 'Strategic planning, market analysis, competitive research, and business model optimization.'
                  },
                  {
                    icon: 'fas fa-cogs',
                    title: 'Process Optimization',
                    description: 'Workflow improvement, automation implementation, and operational efficiency enhancement.'
                  },
                  {
                    icon: 'fas fa-users',
                    title: 'Team Development',
                    description: 'Leadership training, team building, performance management, and organizational development.'
                  },
                  {
                    icon: 'fas fa-rocket',
                    title: 'Growth Consulting',
                    description: 'Scaling strategies, market expansion, and sustainable growth planning.'
                  }
                ]
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            }
          ]
        },
        {
          name: 'Contact',
          slug: '/contact',
          title: 'Contact Us - Your Business Name',
          metaDescription: 'Get in touch with our team for a free consultation and discover how we can help your business.',
          blocks: [
            {
              id: 'contact-hero',
              type: 'hero',
              content: {
                headline: 'Get In Touch',
                subheading: 'Ready to transform your business? Contact us today.'
              },
              styles: {
                backgroundColor: '#f8fafc',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'contact-details',
              type: 'contact',
              content: {
                title: 'Contact Information',
                phone: '(555) 123-4567',
                email: 'info@yourbusiness.com',
                address: '123 Business Street, City, State 12345',
                hours: 'Monday - Friday: 9:00 AM - 6:00 PM'
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    },

    // CREATIVE AGENCY TEMPLATE
    {
      id: 'creative-agency',
      name: 'Creative Agency',
      description: 'Bold and vibrant website for creative agencies and design studios',
      category: 'creative',
      thumbnail: '/assets/templates/creative-agency-thumb.jpg',
      theme: {
        id: 'creative-bold',
        name: 'Creative Bold',
        description: 'Vibrant and energetic design',
        category: 'creative',
        preview: { primaryColor: '#7c3aed', secondaryColor: '#ec4899', backgroundColor: '#0f0f23', textColor: '#ffffff', accentColor: '#06b6d4' },
        styles: {} as any,
        cssVariables: {} as any
      },
      features: ['Portfolio showcase', 'Creative hero', 'Team profiles', 'Client testimonials', 'Contact form', 'Services grid'],
      pricing: 'free',
      difficulty: 'intermediate',
      estimatedSetupTime: '45 minutes',
      targetAudience: ['Creative agencies', 'Design studios', 'Marketing agencies', 'Freelance designers'],
      includesContent: true,
      tags: ['creative', 'bold', 'portfolio', 'agency', 'design', 'vibrant'],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'Creative Agency - Bringing Ideas to Life',
          metaDescription: 'Award-winning creative agency specializing in branding, design, and digital experiences.',
          isHomePage: true,
          blocks: [
            {
              id: 'hero-creative',
              type: 'hero',
              content: {
                headline: 'We Craft Digital Experiences That Inspire',
                subheading: 'Award-winning creative agency pushing the boundaries of design and innovation.',
                buttonText: 'View Our Work',
                buttonLink: '#portfolio',
                alignment: 'center'
              },
              styles: {
                backgroundColor: '#0f0f23',
                textColor: '#ffffff',
                padding: '140px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'portfolio-preview',
              type: 'gallery',
              content: {
                title: 'Featured Work',
                subtitle: 'Recent projects that showcase our creativity',
                images: [
                  { url: '/assets/portfolio/project-1.jpg', title: 'Brand Identity for Tech Startup', category: 'Branding' },
                  { url: '/assets/portfolio/project-2.jpg', title: 'E-commerce Website Design', category: 'Web Design' },
                  { url: '/assets/portfolio/project-3.jpg', title: 'Mobile App UI/UX', category: 'App Design' },
                  { url: '/assets/portfolio/project-4.jpg', title: 'Marketing Campaign', category: 'Marketing' }
                ]
              },
              styles: {
                backgroundColor: '#1e1b4b',
                textColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'services-creative',
              type: 'columns',
              content: {
                title: 'Our Services',
                subtitle: 'Full-service creative solutions',
                columns: [
                  {
                    icon: 'fas fa-palette',
                    title: 'Brand Identity',
                    description: 'Complete brand strategy, logo design, and visual identity systems.'
                  },
                  {
                    icon: 'fas fa-laptop-code',
                    title: 'Web Design',
                    description: 'Stunning websites that convert visitors into customers.'
                  },
                  {
                    icon: 'fas fa-mobile-alt',
                    title: 'App Design',
                    description: 'User-centered mobile and web application interfaces.'
                  }
                ]
              },
              styles: {
                backgroundColor: '#0f0f23',
                textColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    },

    // PORTFOLIO TEMPLATE
    {
      id: 'photographer-portfolio',
      name: 'Photographer Portfolio',
      description: 'Elegant portfolio template perfect for photographers and visual artists',
      category: 'portfolio',
      thumbnail: '/assets/templates/portfolio-thumb.jpg',
      theme: {
        id: 'artistic-portfolio',
        name: 'Artistic Portfolio',
        description: 'Elegant and artistic design',
        category: 'portfolio',
        preview: { primaryColor: '#18181b', secondaryColor: '#a1a1aa', backgroundColor: '#fafafa', textColor: '#09090b', accentColor: '#e11d48' },
        styles: {} as any,
        cssVariables: {} as any
      },
      features: ['Photo galleries', 'About section', 'Services pricing', 'Contact form', 'Testimonials', 'Blog'],
      pricing: 'free',
      difficulty: 'beginner',
      estimatedSetupTime: '25 minutes',
      targetAudience: ['Photographers', 'Visual artists', 'Creative professionals', 'Portfolio sites'],
      includesContent: true,
      tags: ['photography', 'portfolio', 'artistic', 'gallery', 'visual', 'elegant'],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'John Smith Photography - Professional Photographer',
          metaDescription: 'Award-winning photographer specializing in portraits, weddings, and commercial photography.',
          isHomePage: true,
          blocks: [
            {
              id: 'hero-portfolio',
              type: 'hero',
              content: {
                headline: 'Capturing Life\'s Precious Moments',
                subheading: 'Professional photographer with 15 years of experience in portraits, weddings, and events.',
                buttonText: 'View Portfolio',
                buttonLink: '#gallery',
                backgroundImage: '/assets/images/photography-hero.jpg',
                alignment: 'center'
              },
              styles: {
                backgroundColor: '#fafafa',
                textColor: '#18181b',
                padding: '120px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'featured-gallery',
              type: 'gallery',
              content: {
                title: 'Featured Work',
                images: [
                  { url: '/assets/gallery/wedding-1.jpg', title: 'Sarah & Michael Wedding', category: 'Wedding' },
                  { url: '/assets/gallery/portrait-1.jpg', title: 'Corporate Headshots', category: 'Portrait' },
                  { url: '/assets/gallery/event-1.jpg', title: 'Corporate Event', category: 'Event' },
                  { url: '/assets/gallery/wedding-2.jpg', title: 'Emma & David Wedding', category: 'Wedding' }
                ]
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'about-photographer',
              type: 'columns',
              content: {
                title: 'About Me',
                subtitle: 'Passionate about telling stories through photography',
                columns: [
                  {
                    title: 'My Approach',
                    description: 'I believe every moment tells a unique story. My goal is to capture the authentic emotions and genuine connections that make each event special.'
                  },
                  {
                    title: 'Experience',
                    description: '15+ years of professional photography experience with over 300 weddings and countless portrait sessions completed.'
                  }
                ]
              },
              styles: {
                backgroundColor: '#fafafa',
                padding: '80px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    },

    // RESTAURANT TEMPLATE
    {
      id: 'restaurant',
      name: 'Restaurant & Dining',
      description: 'Appetizing website template for restaurants, cafes, and food businesses',
      category: 'restaurant',
      thumbnail: '/assets/templates/restaurant-thumb.jpg',
      theme: {
        id: 'wellness-lifestyle',
        name: 'Wellness & Lifestyle',
        description: 'Warm and inviting design',
        category: 'creative',
        preview: { primaryColor: '#059669', secondaryColor: '#0d9488', backgroundColor: '#f0fdf4', textColor: '#064e3b', accentColor: '#f59e0b' },
        styles: {} as any,
        cssVariables: {} as any
      },
      features: ['Menu showcase', 'Photo gallery', 'Reservation system', 'Location info', 'Chef\'s story', 'Reviews'],
      pricing: 'free',
      difficulty: 'intermediate',
      estimatedSetupTime: '35 minutes',
      targetAudience: ['Restaurants', 'Cafes', 'Food trucks', 'Catering services', 'Bars'],
      includesContent: true,
      tags: ['restaurant', 'food', 'dining', 'menu', 'hospitality', 'warm'],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'Bella Vista Restaurant - Authentic Italian Dining',
          metaDescription: 'Experience authentic Italian cuisine in a warm, welcoming atmosphere. Fresh ingredients, traditional recipes.',
          isHomePage: true,
          blocks: [
            {
              id: 'restaurant-hero',
              type: 'hero',
              content: {
                headline: 'Authentic Italian Cuisine',
                subheading: 'Fresh ingredients, traditional recipes, and warm hospitality in the heart of the city.',
                buttonText: 'Make Reservation',
                buttonLink: '#reservation',
                backgroundImage: '/assets/images/restaurant-hero.jpg',
                alignment: 'center'
              },
              styles: {
                backgroundColor: '#f0fdf4',
                textColor: '#064e3b',
                padding: '120px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'menu-preview',
              type: 'columns',
              content: {
                title: 'Our Specialties',
                subtitle: 'Signature dishes crafted with passion',
                columns: [
                  {
                    icon: 'fas fa-pizza-slice',
                    title: 'Wood-Fired Pizza',
                    description: 'Authentic Neapolitan pizzas baked in our traditional wood-fired oven.'
                  },
                  {
                    icon: 'fas fa-utensils',
                    title: 'Fresh Pasta',
                    description: 'Handmade pasta prepared daily using time-honored Italian techniques.'
                  },
                  {
                    icon: 'fas fa-wine-glass-alt',
                    title: 'Italian Wines',
                    description: 'Curated selection of Italian wines to perfectly complement your meal.'
                  }
                ]
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'chef-story',
              type: 'text',
              content: {
                title: 'Chef\'s Story',
                content: 'Chef Marco brings over 20 years of culinary experience from the hills of Tuscany to your table. Every dish is prepared with locally-sourced ingredients and traditional Italian techniques passed down through generations.'
              },
              styles: {
                backgroundColor: '#f0fdf4',
                padding: '80px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    },

    // LANDING PAGE TEMPLATE
    {
      id: 'saas-landing',
      name: 'SaaS Landing Page',
      description: 'High-converting landing page template for SaaS and tech products',
      category: 'landing',
      thumbnail: '/assets/templates/saas-landing-thumb.jpg',
      theme: {
        id: 'tech-startup',
        name: 'Tech Startup',
        description: 'Modern and innovative design',
        category: 'business',
        preview: { primaryColor: '#6366f1', secondaryColor: '#8b5cf6', backgroundColor: '#0f0f0f', textColor: '#ffffff', accentColor: '#14b8a6' },
        styles: {} as any,
        cssVariables: {} as any
      },
      features: ['Hero with CTA', 'Feature highlights', 'Pricing table', 'Testimonials', 'FAQ section', 'Sign-up form'],
      pricing: 'premium',
      difficulty: 'advanced',
      estimatedSetupTime: '60 minutes',
      targetAudience: ['SaaS companies', 'Tech startups', 'Software products', 'App developers'],
      includesContent: true,
      tags: ['saas', 'landing-page', 'conversion', 'tech', 'startup', 'modern'],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'TaskFlow - Streamline Your Workflow',
          metaDescription: 'The productivity app that helps teams collaborate more effectively. Try TaskFlow free for 14 days.',
          isHomePage: true,
          blocks: [
            {
              id: 'saas-hero',
              type: 'hero',
              content: {
                headline: 'Streamline Your Team\'s Workflow',
                subheading: 'The all-in-one productivity platform that helps teams collaborate more effectively and get things done faster.',
                buttonText: 'Start Free Trial',
                buttonLink: '#signup',
                alignment: 'center'
              },
              styles: {
                backgroundColor: '#0f0f0f',
                textColor: '#ffffff',
                padding: '120px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'features-grid',
              type: 'columns',
              content: {
                title: 'Everything You Need',
                subtitle: 'Powerful features to boost your team\'s productivity',
                columns: [
                  {
                    icon: 'fas fa-tasks',
                    title: 'Task Management',
                    description: 'Organize tasks, set priorities, and track progress with intuitive project boards.'
                  },
                  {
                    icon: 'fas fa-comments',
                    title: 'Team Chat',
                    description: 'Built-in messaging and video calls to keep your team connected.'
                  },
                  {
                    icon: 'fas fa-chart-bar',
                    title: 'Analytics',
                    description: 'Detailed insights and reports to optimize your team\'s performance.'
                  }
                ]
              },
              styles: {
                backgroundColor: '#1f1f1f',
                textColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'pricing-section',
              type: 'pricing',
              content: {
                title: 'Simple, Transparent Pricing',
                subtitle: 'Start free, upgrade when you need more',
                plans: [
                  {
                    name: 'Starter',
                    price: '$0',
                    period: 'forever',
                    features: ['Up to 5 team members', 'Basic task management', 'Email support'],
                    buttonText: 'Get Started',
                    highlighted: false
                  },
                  {
                    name: 'Professional',
                    price: '$12',
                    period: 'per user/month',
                    features: ['Unlimited team members', 'Advanced features', 'Priority support', 'Analytics'],
                    buttonText: 'Start Free Trial',
                    highlighted: true
                  },
                  {
                    name: 'Enterprise',
                    price: 'Custom',
                    period: 'contact us',
                    features: ['Custom integrations', 'Dedicated support', 'Advanced security', 'SLA'],
                    buttonText: 'Contact Sales',
                    highlighted: false
                  }
                ]
              },
              styles: {
                backgroundColor: '#0f0f0f',
                textColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    },

    // E-COMMERCE TEMPLATE
    {
      id: 'fashion-store',
      name: 'Fashion Store',
      description: 'Stylish e-commerce template for fashion and lifestyle brands',
      category: 'e-commerce',
      thumbnail: '/assets/templates/fashion-store-thumb.jpg',
      theme: {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Clean and sophisticated design',
        category: 'business',
        preview: { primaryColor: '#0f172a', secondaryColor: '#64748b', backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#3b82f6' },
        styles: {} as any,
        cssVariables: {} as any
      },
      features: ['Product showcase', 'Category navigation', 'Shopping cart', 'Checkout process', 'Customer reviews', 'Brand story'],
      pricing: 'premium',
      difficulty: 'advanced',
      estimatedSetupTime: '90 minutes',
      targetAudience: ['Fashion brands', 'Online stores', 'E-commerce businesses', 'Retail companies'],
      includesContent: true,
      tags: ['e-commerce', 'fashion', 'shopping', 'retail', 'products', 'store'],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'Luxe Fashion - Premium Clothing & Accessories',
          metaDescription: 'Discover premium fashion and accessories. Free shipping on orders over $100.',
          isHomePage: true,
          blocks: [
            {
              id: 'fashion-hero',
              type: 'hero',
              content: {
                headline: 'Elevate Your Style',
                subheading: 'Discover our curated collection of premium fashion and accessories for the modern lifestyle.',
                buttonText: 'Shop Collection',
                buttonLink: '#products',
                backgroundImage: '/assets/images/fashion-hero.jpg',
                alignment: 'left'
              },
              styles: {
                backgroundColor: '#ffffff',
                textColor: '#0f172a',
                padding: '120px 0',
                textAlign: 'left'
              }
            },
            {
              id: 'featured-products',
              type: 'gallery',
              content: {
                title: 'Featured Products',
                subtitle: 'Handpicked favorites from our latest collection',
                images: [
                  { url: '/assets/products/dress-1.jpg', title: 'Summer Dress', category: 'Dresses' },
                  { url: '/assets/products/jacket-1.jpg', title: 'Leather Jacket', category: 'Outerwear' },
                  { url: '/assets/products/bag-1.jpg', title: 'Designer Handbag', category: 'Accessories' },
                  { url: '/assets/products/shoes-1.jpg', title: 'Premium Sneakers', category: 'Footwear' }
                ]
              },
              styles: {
                backgroundColor: '#f8fafc',
                padding: '100px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'brand-story',
              type: 'text',
              content: {
                title: 'Our Story',
                content: 'Founded with a passion for timeless style and quality craftsmanship, we curate premium fashion pieces that empower you to express your unique style with confidence.'
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    }
  ];

  getTemplates(): Template[] {
    return this.templates;
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(template => template.id === id);
  }

  getTemplatesByCategory(category: string): Template[] {
    return this.templates.filter(template => template.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.templates.map(t => t.category))];
  }

  generateTemplatePreview(template: Template): string {
    const theme = template.theme;
    return `
      <div style="
        background: ${theme.preview?.backgroundColor || '#ffffff'};
        color: ${theme.preview?.textColor || '#000000'};
        padding: 16px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        border: 1px solid #e5e7eb;
        height: 200px;
        overflow: hidden;
        position: relative;
      ">
        <!-- Header -->
        <div style="
          background: ${theme.preview?.primaryColor || '#000000'};
          height: 8px;
          border-radius: 4px;
          margin-bottom: 12px;
        "></div>
        
        <!-- Hero Section -->
        <div style="
          background: ${theme.preview?.backgroundColor || '#f8fafc'};
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          text-align: center;
          border: 1px solid ${theme.preview?.primaryColor || '#000000'}20;
        ">
          <div style="
            width: 60%;
            height: 4px;
            background: ${theme.preview?.primaryColor || '#000000'};
            margin: 0 auto 6px auto;
            border-radius: 2px;
          "></div>
          <div style="
            width: 80%;
            height: 2px;
            background: ${theme.preview?.secondaryColor || '#666666'};
            margin: 0 auto 4px auto;
            border-radius: 1px;
          "></div>
          <div style="
            width: 30%;
            height: 6px;
            background: ${theme.preview?.accentColor || '#0066cc'};
            margin: 4px auto 0 auto;
            border-radius: 3px;
          "></div>
        </div>
        
        <!-- Content Sections -->
        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
          <div style="
            flex: 1;
            height: 40px;
            background: ${theme.preview?.backgroundColor || '#ffffff'};
            border: 1px solid ${theme.preview?.secondaryColor || '#cccccc'}30;
            border-radius: 4px;
            padding: 6px;
          ">
            <div style="width: 100%; height: 3px; background: ${theme.preview?.primaryColor || '#000000'}; border-radius: 1px; margin-bottom: 3px;"></div>
            <div style="width: 70%; height: 2px; background: ${theme.preview?.secondaryColor || '#666666'}; border-radius: 1px; margin-bottom: 2px;"></div>
            <div style="width: 85%; height: 2px; background: ${theme.preview?.secondaryColor || '#666666'}; border-radius: 1px;"></div>
          </div>
          <div style="
            flex: 1;
            height: 40px;
            background: ${theme.preview?.backgroundColor || '#ffffff'};
            border: 1px solid ${theme.preview?.secondaryColor || '#cccccc'}30;
            border-radius: 4px;
            padding: 6px;
          ">
            <div style="width: 100%; height: 3px; background: ${theme.preview?.primaryColor || '#000000'}; border-radius: 1px; margin-bottom: 3px;"></div>
            <div style="width: 80%; height: 2px; background: ${theme.preview?.secondaryColor || '#666666'}; border-radius: 1px; margin-bottom: 2px;"></div>
            <div style="width: 60%; height: 2px; background: ${theme.preview?.secondaryColor || '#666666'}; border-radius: 1px;"></div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 16px;
          height: 20px;
          background: ${theme.preview?.primaryColor || '#000000'};
          border-radius: 4px;
          opacity: 0.1;
        "></div>
        
        <!-- Category Badge -->
        <div style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: ${theme.preview?.accentColor || '#0066cc'};
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        ">${template.category}</div>
      </div>
    `;
  }

  async applyTemplate(websiteId: string, template: Template): Promise<void> {
    console.log('Applying template:', template.name, 'to website:', websiteId);
    
    try {
      // 1. Update website with template theme
      console.log('Updating website theme to:', template.theme.name);
      await this.websiteService.updateWebsite(websiteId, {
        theme: template.theme.name
      });
      console.log('✅ Updated website theme successfully');
      
      // 2. Get existing pages to check for duplicates
      console.log('Checking for existing pages...');
      const existingPages = await this.websiteService.getPages(websiteId);
      console.log(`Found ${existingPages.length} existing pages`);
      
      // 3. Create or update pages based on template structure
      const processedPages = [];
      
      for (let i = 0; i < template.pages.length; i++) {
        const pageTemplate = template.pages[i];
        const targetSlug = pageTemplate.slug === '/' ? 'home' : pageTemplate.slug.replace(/^\//, '');
        console.log(`Processing page ${i + 1}/${template.pages.length}: ${pageTemplate.name} (${targetSlug})`);
        
        try {
          // Convert template blocks to page content
          const pageContent = {
            template: {
              id: template.id,
              name: template.name,
              appliedAt: new Date().toISOString()
            },
            blocks: pageTemplate.blocks.map(block => ({
              id: block.id,
              type: block.type,
              content: block.content,
              styles: block.styles,
              animations: block.animations,
              responsive: block.responsive
            })),
            meta: {
              seo: pageTemplate.seo || {}
            }
          };
          
          // Check if page with this slug already exists
          const existingPage = existingPages.find(p => p.slug === targetSlug);
          
          let processedPage;
          if (existingPage) {
            // Update existing page
            console.log(`📝 Updating existing page: ${existingPage.title} (${targetSlug})`);
            processedPage = await this.websiteService.updatePage(websiteId, existingPage.id, {
              title: pageTemplate.title,
              content: JSON.stringify(pageContent),
              metaTitle: pageTemplate.title,
              metaDescription: pageTemplate.metaDescription,
              isHomePage: pageTemplate.isHomePage || false,
              sortOrder: i + 1
            });
          } else {
            // Create new page
            console.log(`📄 Creating new page: ${pageTemplate.name} (${targetSlug})`);
            processedPage = await this.websiteService.createPage(websiteId, {
              title: pageTemplate.title,
              slug: targetSlug,
              content: JSON.stringify(pageContent),
              metaTitle: pageTemplate.title,
              metaDescription: pageTemplate.metaDescription,
              isHomePage: pageTemplate.isHomePage || false,
              sortOrder: i + 1
            });
          }
          
          processedPages.push(processedPage);
          console.log(`✅ ${existingPage ? 'Updated' : 'Created'} page: ${processedPage.title} with ${pageTemplate.blocks.length} blocks`);
        } catch (pageError) {
          console.error(`❌ Failed to process page ${pageTemplate.name}:`, pageError);
          throw new Error(`Failed to process page "${pageTemplate.name}": ${pageError instanceof Error ? pageError.message : String(pageError)}`);
        }
      }
      
      console.log(`🎉 Template "${template.name}" applied successfully to website ${websiteId}`);
      console.log(`📄 Processed ${processedPages.length} pages with ${template.pages.reduce((total, page) => total + page.blocks.length, 0)} total blocks`);
      console.log('📋 Pages processed:', processedPages.map(p => `${p.title} (${p.slug})`).join(', '));
      
    } catch (error) {
      console.error('❌ Error applying template:', error);
      throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
