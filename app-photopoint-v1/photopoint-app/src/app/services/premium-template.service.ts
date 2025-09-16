import { Injectable } from '@angular/core';
import { TemplateBuilderService, TemplateConfig } from './template-builder.service';
import { Template } from './template.service';
import { ThemeService } from './theme.service';

/**
 * Premium Template Collection Service
 * 
 * Creates high-quality, professional templates with realistic content,
 * advanced features, and superior user experience.
 */
@Injectable({
  providedIn: 'root'
})
export class PremiumTemplateService {

  constructor(
    private templateBuilder: TemplateBuilderService,
    private themeService: ThemeService
  ) {}

  /**
   * Creates a premium business consulting template
   * This template showcases best practices for building high-quality templates
   */
  createPremiumBusinessTemplate(): Template {
    const config: TemplateConfig = {
      id: 'premium-business-consulting',
      name: 'Premium Business Consulting',
      description: 'Elite business consulting template designed to attract high-value clients and establish thought leadership',
      category: 'business',
      theme: this.themeService.getThemeById('professional-business')!,
      pricing: 'premium',
      difficulty: 'intermediate',
      estimatedSetupTime: '45 minutes',
      targetAudience: [
        'Management consultants',
        'Strategy advisors',
        'Business coaches',
        'Corporate training companies',
        'Executive consultants'
      ],
      tags: ['consulting', 'premium', 'professional', 'B2B', 'executive', 'strategy'],
      features: [
        'Executive-level design',
        'Client case studies',
        'Thought leadership blog',
        'Consultation booking system',
        'Testimonials from Fortune 500 clients',
        'White papers and resources',
        'Speaking engagement portfolio',
        'ROI calculator tool'
      ],
      pages: [
        {
          name: 'Home',
          slug: '/',
          title: 'Strategic Business Consulting - Transform Your Organization',
          metaDescription: 'Expert business consulting services for Fortune 500 companies. 20+ years of experience driving organizational transformation and measurable results.',
          isHomePage: true,
          seo: {
            keywords: ['business consulting', 'strategic planning', 'organizational transformation', 'executive consulting'],
            ogTitle: 'Elite Business Consulting - Strategic Transformation Experts',
            ogDescription: 'Partner with seasoned executives who have transformed 200+ organizations. Get strategic insights that drive real business results.',
            ogImage: '/assets/images/og-business-consulting.jpg'
          },
          blocks: [
            {
              id: 'hero-premium',
              type: 'hero',
              content: {
                headline: 'Transform Your Organization Into a Market Leader',
                subheading: 'Strategic consulting for executives who demand exceptional results. We\'ve helped 200+ companies achieve sustainable growth through proven methodologies and deep industry expertise.',
                buttonText: 'Schedule Strategic Assessment',
                buttonLink: '#consultation',
                secondaryButtonText: 'View Case Studies',
                secondaryButtonLink: '#case-studies',
                backgroundImage: '/assets/images/executive-boardroom.jpg',
                alignment: 'left',
                trustSignals: [
                  'Fortune 500 Trusted',
                  '200+ Companies Transformed',
                  '20+ Years Experience'
                ]
              },
              styles: {
                backgroundColor: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))',
                textColor: '#ffffff',
                padding: '120px 0 100px 0',
                minHeight: '650px',
                textAlign: 'left',
                backgroundSize: 'cover',
                backgroundPosition: 'center center'
              },
              animations: {
                entrance: 'slideUp',
                duration: 800,
                delay: 200
              },
              responsive: {
                mobile: { 
                  padding: '80px 20px 60px 20px', 
                  fontSize: '32px',
                  textAlign: 'center'
                },
                tablet: { 
                  padding: '100px 40px 80px 40px', 
                  fontSize: '40px' 
                },
                desktop: { 
                  padding: '120px 0 100px 0', 
                  fontSize: '52px' 
                }
              }
            },
            {
              id: 'trust-indicators',
              type: 'stats',
              content: {
                title: 'Trusted by Industry Leaders',
                stats: [
                  { 
                    number: '$2.3B+', 
                    label: 'Revenue Generated',
                    description: 'Additional revenue created for clients through our strategic initiatives'
                  },
                  { 
                    number: '200+', 
                    label: 'Companies Transformed',
                    description: 'Organizations that achieved sustainable competitive advantage'
                  },
                  { 
                    number: '94%', 
                    label: 'Project Success Rate',
                    description: 'Clients who exceeded their strategic objectives within 18 months'
                  },
                  { 
                    number: '20+', 
                    label: 'Years Experience',
                    description: 'Decades of proven expertise across multiple industries'
                  }
                ],
                clientLogos: [
                  '/assets/images/clients/microsoft.png',
                  '/assets/images/clients/goldman-sachs.png',
                  '/assets/images/clients/mckinsey.png',
                  '/assets/images/clients/deloitte.png'
                ]
              },
              styles: {
                backgroundColor: '#f8fafc',
                padding: '80px 0',
                textAlign: 'center',
                borderTop: '1px solid #e2e8f0'
              },
              animations: {
                entrance: 'fadeIn',
                duration: 600,
                delay: 400
              }
            },
            {
              id: 'services-executive',
              type: 'features',
              content: {
                title: 'Strategic Services That Drive Results',
                subtitle: 'Comprehensive consulting solutions designed for executive-level impact',
                features: [
                  {
                    icon: 'fas fa-chess-king',
                    title: 'Strategic Planning & Execution',
                    description: 'Comprehensive strategic planning with actionable roadmaps, KPI frameworks, and execution support. We don\'t just plan - we ensure successful implementation.',
                    benefits: ['Market positioning analysis', 'Competitive intelligence', 'Growth strategy development', 'Performance measurement systems'],
                    caseStudyLink: '/case-study/fortune-500-turnaround'
                  },
                  {
                    icon: 'fas fa-rocket',
                    title: 'Digital Transformation',
                    description: 'End-to-end digital transformation that modernizes operations, enhances customer experience, and drives operational efficiency.',
                    benefits: ['Technology roadmap', 'Process optimization', 'Change management', 'ROI measurement'],
                    caseStudyLink: '/case-study/digital-transformation'
                  },
                  {
                    icon: 'fas fa-users-cog',
                    title: 'Organizational Excellence',
                    description: 'Build high-performing organizations through culture transformation, leadership development, and operational excellence.',
                    benefits: ['Leadership coaching', 'Culture assessment', 'Team optimization', 'Performance management'],
                    caseStudyLink: '/case-study/organizational-transformation'
                  },
                  {
                    icon: 'fas fa-chart-line',
                    title: 'Mergers & Acquisitions',
                    description: 'Strategic M&A advisory from due diligence through integration, ensuring successful transactions and value realization.',
                    benefits: ['Due diligence support', 'Integration planning', 'Synergy realization', 'Cultural integration'],
                    caseStudyLink: '/case-study/merger-success'
                  }
                ]
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'left'
              },
              animations: {
                entrance: 'slideUp',
                duration: 600,
                delay: 200
              }
            },
            {
              id: 'case-studies-premium',
              type: 'testimonial',
              content: {
                title: 'Client Success Stories',
                subtitle: 'Real results from real engagements',
                testimonials: [
                  {
                    text: "The strategic transformation they led resulted in a 340% increase in market share within 24 months. Their methodology is unmatched in the industry.",
                    author: "Sarah Chen",
                    role: "CEO, TechGlobal Industries",
                    company: "Fortune 500 Technology Company",
                    avatar: "/assets/images/testimonials/sarah-chen.jpg",
                    results: "$1.2B revenue increase",
                    industryLogo: "/assets/images/industries/technology.png",
                    caseStudyLink: "/case-study/techglobal-transformation"
                  },
                  {
                    text: "Their M&A expertise was instrumental in our successful acquisition strategy. They identified $50M in synergies we hadn't considered.",
                    author: "Michael Rodriguez",
                    role: "Chief Strategy Officer",  
                    company: "Leading Healthcare Corporation",
                    avatar: "/assets/images/testimonials/michael-rodriguez.jpg",
                    results: "$50M synergies realized",
                    industryLogo: "/assets/images/industries/healthcare.png",
                    caseStudyLink: "/case-study/healthcare-merger"
                  },
                  {
                    text: "The digital transformation roadmap they created became our blueprint for the next five years. ROI exceeded projections by 180%.",
                    author: "Jennifer Wu",
                    role: "Chief Digital Officer",
                    company: "Global Manufacturing Leader", 
                    avatar: "/assets/images/testimonials/jennifer-wu.jpg",
                    results: "180% ROI achievement",
                    industryLogo: "/assets/images/industries/manufacturing.png",
                    caseStudyLink: "/case-study/manufacturing-digital"
                  }
                ]
              },
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'center'
              },
              animations: {
                entrance: 'fadeIn',
                duration: 800,
                delay: 300
              }
            },
            {
              id: 'thought-leadership',
              type: 'blog',
              content: {
                title: 'Strategic Insights & Thought Leadership',
                subtitle: 'Latest perspectives on business strategy and organizational transformation',
                articles: [
                  {
                    title: 'The Future of Strategic Planning in a Post-Digital World',
                    excerpt: 'How traditional strategic planning must evolve to address rapid technological change and market disruption.',
                    author: 'David Thompson, Senior Partner',
                    publishDate: '2024-01-15',
                    readTime: '8 min read',
                    category: 'Strategy',
                    image: '/assets/images/blog/strategic-planning-future.jpg',
                    link: '/insights/future-strategic-planning'
                  },
                  {
                    title: 'Measuring ROI in Digital Transformation Initiatives',
                    excerpt: 'A framework for quantifying the business impact of digital transformation investments.',
                    author: 'Lisa Chen, Digital Strategy Director',
                    publishDate: '2024-01-10',
                    readTime: '6 min read',
                    category: 'Digital Transformation',
                    image: '/assets/images/blog/digital-roi.jpg', 
                    link: '/insights/digital-transformation-roi'
                  },
                  {
                    title: 'Building Resilient Organizations: Lessons from Crisis Leadership',
                    excerpt: 'Key strategies for organizational resilience based on leadership during challenging times.',
                    author: 'Michael Foster, Managing Director',
                    publishDate: '2024-01-05',
                    readTime: '10 min read',
                    category: 'Leadership',
                    image: '/assets/images/blog/resilient-organizations.jpg',
                    link: '/insights/resilient-organizations'
                  }
                ]
              },
              styles: {
                backgroundColor: '#f8fafc',
                padding: '100px 0',
                textAlign: 'left'
              }
            },
            {
              id: 'cta-consultation',
              type: 'cta',
              content: {
                headline: 'Ready to Transform Your Organization?',
                subheading: 'Schedule a complimentary strategic assessment with our senior partners. Discover the opportunities that could define your organization\'s future.',
                buttonText: 'Schedule Strategic Assessment',
                buttonLink: '#consultation-form',
                features: [
                  '60-minute strategic assessment',
                  'Custom opportunity analysis', 
                  'Senior partner consultation',
                  'No obligation discussion'
                ],
                urgencyText: 'Limited availability - Only 3 assessments per month',
                guaranteeText: '100% Confidential - NDA provided before discussion'
              },
              styles: {
                backgroundColor: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                textColor: '#ffffff',
                padding: '80px 0',
                textAlign: 'center'
              },
              animations: {
                entrance: 'slideUp',
                duration: 600,
                delay: 200
              }
            }
          ]
        },
        {
          name: 'About',
          slug: '/about',
          title: 'About Our Consulting Team - Strategic Business Advisors',
          metaDescription: 'Meet our team of senior business consultants with Fortune 500 experience. Combined 200+ years of strategic consulting expertise.',
          blocks: [
            {
              id: 'about-hero',
              type: 'hero',
              content: {
                headline: 'Senior-Level Expertise, Partner-Level Attention',
                subheading: 'Our consulting team brings decades of Fortune 500 experience to every engagement. We don\'t just advise - we partner with you to achieve extraordinary results.',
                backgroundImage: '/assets/images/consulting-team.jpg'
              },
              styles: {
                backgroundColor: '#f8fafc',
                textColor: '#1f2937',
                padding: '100px 0',
                textAlign: 'center'
              }
            },
            {
              id: 'team-profiles',
              type: 'team',
              content: {
                title: 'Our Leadership Team',
                subtitle: 'Meet the senior partners who will lead your transformation',
                team: [
                  {
                    name: 'David Thompson',
                    role: 'Managing Partner & Founder',
                    bio: 'Former McKinsey partner with 25 years of strategic consulting experience. Led 50+ Fortune 500 transformations with average 200% ROI.',
                    expertise: ['Strategic Planning', 'M&A Advisory', 'Organizational Design'],
                    education: 'Harvard MBA, Stanford BS Engineering',
                    achievements: [
                      'Named "Consultant of the Year" by Strategy & Business',
                      'Author of "Strategic Transformation: A CEO\'s Guide"',
                      'Board member of 3 Fortune 500 companies'
                    ],
                    image: '/assets/images/team/david-thompson.jpg',
                    linkedIn: 'https://linkedin.com/in/davidthompson'
                  },
                  {
                    name: 'Lisa Chen', 
                    role: 'Senior Partner, Digital Strategy',
                    bio: 'Former Deloitte principal specializing in digital transformation. Expert in technology strategy and organizational change management.',
                    expertise: ['Digital Transformation', 'Technology Strategy', 'Change Management'],
                    education: 'Wharton MBA, MIT BS Computer Science',
                    achievements: [
                      'Led $2B+ in digital transformation initiatives',
                      'Speaker at Davos World Economic Forum',
                      'Published researcher on AI business applications'
                    ],
                    image: '/assets/images/team/lisa-chen.jpg',
                    linkedIn: 'https://linkedin.com/in/lisachen'
                  },
                  {
                    name: 'Michael Foster',
                    role: 'Senior Partner, Organizational Excellence', 
                    bio: 'Former BCG partner and Fortune 500 executive. Specializes in culture transformation and leadership development.',
                    expertise: ['Culture Transformation', 'Leadership Development', 'Performance Management'],
                    education: 'Kellogg MBA, Yale BA Economics',
                    achievements: [
                      'Former Chief Strategy Officer at Fortune 100 company',
                      'Certified executive coach (ICF Master)',
                      'Author of "Culture as Competitive Advantage"'
                    ],
                    image: '/assets/images/team/michael-foster.jpg',
                    linkedIn: 'https://linkedin.com/in/michaelfoster'
                  }
                ]
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: '100px 0',
                textAlign: 'center'
              }
            }
          ]
        }
      ]
    };

    return this.templateBuilder.createTemplate(config);
  }

  /**
   * Creates additional premium templates
   */
  createPremiumTemplateCollection(): Template[] {
    return [
      this.createPremiumBusinessTemplate(),
      // Add more premium templates here
    ];
  }
}
