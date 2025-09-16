import { Injectable } from '@angular/core';
import { Template, TemplateBlock } from './template.service';
import { Theme } from './theme.service';

/**
 * Template Builder Service - Advanced template creation and management
 * 
 * This service provides tools for building high-quality, professional templates
 * with better content, design patterns, and user experience.
 */
@Injectable({
  providedIn: 'root'
})
export class TemplateBuilderService {

  /**
   * Creates a professional template with industry best practices
   */
  createTemplate(config: TemplateConfig): Template {
    const template: Template = {
      id: config.id,
      name: config.name,
      description: config.description,
      category: config.category,
      thumbnail: config.thumbnail || this.generateThumbnailPath(config.id),
      theme: config.theme,
      pages: config.pages.map(page => ({
        ...page,
        blocks: page.blocks.map(block => this.enhanceBlock(block))
      })),
      features: config.features,
      pricing: config.pricing || 'free',
      difficulty: config.difficulty || 'beginner',
      estimatedSetupTime: config.estimatedSetupTime || '30 minutes',
      targetAudience: config.targetAudience || [],
      includesContent: config.includesContent !== false,
      demoUrl: config.demoUrl,
      tags: config.tags || [],
      preview: config.preview
    };

    return template;
  }

  /**
   * Enhances a template block with animations, responsive design, and better styling
   */
  private enhanceBlock(block: TemplateBlock): TemplateBlock {
    return {
      ...block,
      animations: block.animations || {
        entrance: 'fadeIn',
        duration: 600,
        delay: 0
      },
      responsive: block.responsive || this.getDefaultResponsiveStyles(block.type),
      styles: {
        ...this.getDefaultBlockStyles(block.type),
        ...block.styles
      }
    };
  }

  /**
   * Returns default responsive styles for different block types
   */
  private getDefaultResponsiveStyles(blockType: string): any {
    const responsiveStyles: { [key: string]: any } = {
      hero: {
        mobile: { padding: '60px 20px', fontSize: '28px' },
        tablet: { padding: '80px 40px', fontSize: '36px' },
        desktop: { padding: '120px 0', fontSize: '48px' }
      },
      text: {
        mobile: { padding: '40px 20px', fontSize: '16px' },
        tablet: { padding: '60px 40px', fontSize: '18px' },
        desktop: { padding: '80px 0', fontSize: '18px' }
      },
      columns: {
        mobile: { padding: '40px 20px' },
        tablet: { padding: '60px 40px' },
        desktop: { padding: '80px 0' }
      }
    };

    return responsiveStyles[blockType] || {};
  }

  /**
   * Returns default styling for different block types
   */
  private getDefaultBlockStyles(blockType: string): any {
    const defaultStyles: { [key: string]: any } = {
      hero: {
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      text: {
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.7'
      },
      columns: {
        display: 'grid',
        gap: '40px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      },
      testimonial: {
        backgroundColor: '#f8fafc',
        padding: '60px 0',
        textAlign: 'center'
      },
      pricing: {
        backgroundColor: '#ffffff',
        padding: '80px 0'
      },
      contact: {
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: '80px 0'
      }
    };

    return defaultStyles[blockType] || {};
  }

  /**
   * Generates thumbnail path for a template
   */
  private generateThumbnailPath(templateId: string): string {
    return `/assets/templates/${templateId}-thumb.jpg`;
  }

  /**
   * Creates professional content blocks with realistic, engaging content
   */
  createContentLibrary() {
    return {
      heroes: [
        {
          business: {
            headline: 'Transform Your Business With Expert Solutions',
            subheading: 'We provide cutting-edge business solutions that drive growth and innovation. Partner with us to achieve your goals.',
            buttonText: 'Get Started Today'
          },
          creative: {
            headline: 'We Create Extraordinary Digital Experiences',
            subheading: 'Award-winning creative agency specializing in branding, web design, and digital marketing that tells your story.',
            buttonText: 'View Our Work'
          },
          portfolio: {
            headline: 'Capturing Life\'s Beautiful Moments',
            subheading: 'Professional photographer with over 8 years of experience in weddings, portraits, and commercial photography.',
            buttonText: 'View Portfolio'
          }
        }
      ],
      testimonials: [
        {
          text: "Working with this team transformed our business. Their strategic approach and attention to detail exceeded our expectations.",
          author: "Sarah Johnson",
          role: "CEO, TechStart Inc.",
          avatar: "/assets/images/testimonials/sarah.jpg",
          rating: 5
        },
        {
          text: "The creative vision and execution were flawless. Our brand identity has never looked better.",
          author: "Michael Chen",
          role: "Founder, Design Co.",
          avatar: "/assets/images/testimonials/michael.jpg",
          rating: 5
        }
      ],
      stats: [
        { number: '500+', label: 'Projects Completed' },
        { number: '98%', label: 'Client Satisfaction' },
        { number: '10+', label: 'Years Experience' },
        { number: '24/7', label: 'Support Available' }
      ],
      services: {
        business: [
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
        ],
        creative: [
          {
            icon: 'fas fa-paint-brush',
            title: 'Brand Identity',
            description: 'Complete brand identity design including logo, colors, and style guide.'
          },
          {
            icon: 'fas fa-laptop-code',
            title: 'Web Design',
            description: 'Custom website design that converts visitors into customers.'
          },
          {
            icon: 'fas fa-bullhorn',
            title: 'Digital Marketing',
            description: 'Comprehensive digital marketing strategies that drive results.'
          }
        ]
      }
    };
  }

  /**
   * Creates industry-specific template collections
   */
  createIndustryTemplates() {
    return {
      healthcare: this.createHealthcareTemplate(),
      fitness: this.createFitnessTemplate(),
      education: this.createEducationTemplate(),
      nonprofit: this.createNonprofitTemplate(),
      technology: this.createTechnologyTemplate(),
      consulting: this.createConsultingTemplate()
    };
  }

  private createHealthcareTemplate(): Partial<Template> {
    return {
      name: 'Healthcare & Medical',
      description: 'Professional medical practice website with appointment booking and patient resources',
      category: 'healthcare',
      targetAudience: ['Medical practices', 'Healthcare providers', 'Clinics', 'Specialists'],
      tags: ['medical', 'healthcare', 'professional', 'appointments', 'patient-care'],
      features: [
        'Online appointment booking',
        'Doctor profiles',
        'Medical services',
        'Patient testimonials',
        'Insurance information',
        'Contact forms'
      ]
    };
  }

  private createFitnessTemplate(): Partial<Template> {
    return {
      name: 'Fitness & Wellness',
      description: 'Dynamic fitness studio website with class schedules and membership options',
      category: 'fitness',
      targetAudience: ['Gyms', 'Fitness studios', 'Personal trainers', 'Wellness centers'],
      tags: ['fitness', 'health', 'wellness', 'classes', 'membership', 'training'],
      features: [
        'Class schedules',
        'Trainer profiles',
        'Membership plans',
        'Success stories',
        'Facility photos',
        'Online booking'
      ]
    };
  }

  private createEducationTemplate(): Partial<Template> {
    return {
      name: 'Education & Learning',
      description: 'Educational institution website with course information and student resources',
      category: 'education',
      targetAudience: ['Schools', 'Universities', 'Training centers', 'Online courses'],
      tags: ['education', 'learning', 'courses', 'students', 'academic', 'institution'],
      features: [
        'Course catalog',
        'Faculty profiles',
        'Student resources',
        'Academic calendar',
        'Admission information',
        'News and events'
      ]
    };
  }

  private createNonprofitTemplate(): Partial<Template> {
    return {
      name: 'Nonprofit & Charity',
      description: 'Compelling nonprofit website designed to inspire donations and volunteer engagement',
      category: 'nonprofit',
      targetAudience: ['Nonprofits', 'Charities', 'NGOs', 'Community organizations'],
      tags: ['nonprofit', 'charity', 'donations', 'volunteers', 'social-impact', 'community'],
      features: [
        'Mission statement',
        'Donation forms',
        'Volunteer opportunities',
        'Impact stories',
        'Event listings',
        'Newsletter signup'
      ]
    };
  }

  private createTechnologyTemplate(): Partial<Template> {
    return {
      name: 'Technology & Software',
      description: 'Modern tech company website showcasing products and technical expertise',
      category: 'business',
      targetAudience: ['Tech startups', 'Software companies', 'IT services', 'App developers'],
      tags: ['technology', 'software', 'innovation', 'development', 'digital', 'tech'],
      features: [
        'Product showcase',
        'Technical documentation',
        'Team expertise',
        'Case studies',
        'API documentation',
        'Developer resources'
      ]
    };
  }

  private createConsultingTemplate(): Partial<Template> {
    return {
      name: 'Consulting & Professional Services',
      description: 'Authoritative consulting website that builds trust and showcases expertise',
      category: 'business',
      targetAudience: ['Consultants', 'Professional services', 'Advisors', 'Coaches'],
      tags: ['consulting', 'professional', 'expertise', 'advisory', 'business', 'strategy'],
      features: [
        'Service offerings',
        'Consultant profiles',
        'Case studies',
        'Client testimonials',
        'Free resources',
        'Consultation booking'
      ]
    };
  }
}

/**
 * Configuration interface for creating new templates
 */
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: Template['category'];
  theme: Theme;
  pages: Template['pages'];
  features: string[];
  thumbnail?: string;
  pricing?: Template['pricing'];
  difficulty?: Template['difficulty'];
  estimatedSetupTime?: string;
  targetAudience?: string[];
  includesContent?: boolean;
  demoUrl?: string;
  tags?: string[];
  preview?: Template['preview'];
}
