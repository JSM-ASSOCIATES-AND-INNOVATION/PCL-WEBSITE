/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React from 'react';
import { BookOpen, MonitorPlay, Wifi, Mic, Scale, HandHeart, Landmark, Building2, Briefcase, GraduationCap, Gavel, UserCheck, Trophy } from 'lucide-react';
import classRoom1 from '../../../../ASSETS/CAMPUS/pcl_classroom_1.webp';
import classRoom2 from '../../../../ASSETS/CAMPUS/pcl_classroom_2.webp';
import classRoom3 from '../../../../ASSETS/CAMPUS/pcl_classroom_3.webp';
import legalClinic from '../../../../ASSETS/CAMPUS/pcl_legal_clinic.webp';
import library from '../../../../ASSETS/CAMPUS/pcl_library.webp';
import justice from '../../../../ASSETS/CAMPUS/pcl_justice.webp';
import outdoor from '../../../../ASSETS/CAMPUS/pcl_outdoor.webp';
import entrance from '../../../../ASSETS/CAMPUS/pcl_entrance.webp';
import mootCourt from '../../../../ASSETS/CAMPUS/pcl_moot_court.jpg';

export const facilitiesData = {
  "academic-digital": {
    title: "Academic & Digital Infrastructure",
    description: "Empowering our scholars with world-class intellectual and technological resources.",
    facilities: [
      {
        id: "library",
        title: "The Prudentia Law Library",
        summary: "An extensive knowledge repository housing over 10,000 volumes.",
        content: "An extensive knowledge repository housing over 10,000 volumes, alongside thousands of national and international journals. Managed by expert librarians, it serves as the intellectual core for legal research and academic excellence.",
        image: library,
        icon: <BookOpen className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "smart-classrooms",
        title: "Interactive Smart Classrooms",
        summary: "Forward-thinking learning spaces equipped with advanced digital teaching tools.",
        content: "Forward-thinking learning spaces equipped with advanced digital teaching tools, enabling dynamic presentations and multimedia-driven educational methodologies.",
        image: classRoom1,
        icon: <MonitorPlay className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "campus-wifi",
        title: "High-Speed Campus Wi-Fi",
        summary: "Seamless, campus-wide internet connectivity.",
        content: "Seamless, campus-wide internet connectivity ensuring students have uninterrupted access to elite online research platforms, global legal databases, and digital academic tools.",
        image: outdoor,
        icon: <Wifi className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "executive-auditorium",
        title: "Executive Auditorium & Conference Hall",
        summary: "A sprawling, technologically advanced venue equipped with premium systems.",
        content: "A sprawling, technologically advanced venue equipped with premium audio-visual systems, designed to host national seminars, legal workshops, and high-profile institutional events.",
        image: entrance,
        icon: <Mic className="text-[#FFBF00] w-6 h-6" />
      }
    ]
  },
  "practical-experiential": {
    title: "Practical & Experiential Learning",
    description: "Bridging the gap between theoretical knowledge and real-world legal practice.",
    facilities: [
      {
        id: "moot-court",
        title: "State-of-the-Art Moot Court Hall",
        summary: "A meticulously designed replica of a real courtroom.",
        content: "A meticulously designed replica of a real courtroom. This facility immerses students in the mechanics of trial and appellate advocacy through rigorous training and competitive moot court events.",
        image: mootCourt,
        icon: <Scale className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "legal-aid-clinic",
        title: "Permanent Legal Aid Clinic",
        summary: "Providing vital community services and hands-on exposure.",
        content: "Operating in collaboration with state legal service authorities, this clinic provides vital community services while giving students hands-on exposure to social justice initiatives and client counseling.",
        image: legalClinic,
        icon: <HandHeart className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "district-court-access",
        title: "Strategic District Court Access",
        summary: "Located in close proximity to a major district court complex.",
        content: "Situated in close proximity to a major district court complex, allowing students to observe live litigation and transition seamlessly from academic theory to actual legal practice.",
        image: classRoom2,
        icon: <Landmark className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "metropolitan-edge",
        title: "The Metropolitan Edge",
        summary: "Unparalleled exposure to premier state-level legal forums.",
        content: "Strategically located in the state capital, offering unparalleled exposure to High Courts, legislative assemblies, specialized tribunals, and premier state-level legal forums.",
        image: classRoom3,
        icon: <Building2 className="text-[#FFBF00] w-6 h-6" />
      }
    ]
  },
  "career-advancement": {
    title: "Career Advancement & Support",
    description: "Forging elite legal professionals ready to dominate the corporate and judicial arenas.",
    facilities: [
      {
        id: "corporate-placements",
        title: "Corporate & Legal Placements",
        summary: "A dedicated placement cell bridging academia and industry.",
        content: "A dedicated placement cell that bridges the gap between academia and industry. We facilitate recruitment with multinational corporations and top-tier law firms, securing competitive positions for our graduates as legal officers and corporate advisors.",
        image: entrance,
        icon: <Briefcase className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "integrated-coaching",
        title: "Integrated Civil Services & Judiciary Coaching",
        summary: "In-house training for competitive examinations.",
        content: "In exclusive partnership with Sharat Chandra Academy, we offer elite in-house training for UPSC Civil Services, state judicial examinations, and competitive legal service entries.",
        image: library,
        icon: <GraduationCap className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "adr-training",
        title: "Alternative Dispute Resolution (ADR) Cell",
        summary: "Specialized training in arbitration and mediation.",
        content: "A specialized cell focused on modern dispute resolution techniques, training students in negotiation, mediation, and arbitration to excel in international and domestic corporate environments.",
        image: classRoom1,
        icon: <Gavel className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "mentorship-program",
        title: "Executive Mentorship Program",
        summary: "Direct guidance from senior advocates and corporate leaders.",
        content: "A structured program pairing top-performing students with senior advocates, corporate counsel, and judicial officers for personalized guidance, networking, and career mapping.",
        image: classRoom2,
        icon: <UserCheck className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "pms-scholarship",
        title: "Pentaiah Memorial Scheme (PMS) Scholarship",
        summary: "A prestigious, full-tuition scholarship for elite scholars.",
        content: "A prestigious, full-tuition scholarship awarded to elite scholars securing a top 100 rank in the TGLAWCET. (Note: In the event of multiple top-100 applicants, the highest-ranking candidate is selected).",
        image: library,
        icon: <Trophy className="text-[#FFBF00] w-6 h-6" />
      }
    ]
  },
  "student-life": {
    title: "Student Life & Well-being",
    description: "Fostering physical well-being, team building, and a balanced academic journey.",
    facilities: [
      {
        id: "athletics-sports",
        title: "Athletics & Sports Facilities",
        summary: "Dedicated grounds for competitive and recreational sports.",
        content: "Dedicated grounds for competitive and recreational sports, encouraging teamwork, discipline, and physical fitness as essential components of a robust legal education.",
        image: outdoor,
        icon: <Trophy className="text-[#FFBF00] w-6 h-6" />
      },
      {
        id: "student-cafeteria",
        title: "The Collegiate Cafeteria",
        summary: "A modern dining facility focusing on hygiene and nutrition.",
        content: "A modern dining facility adhering to strict hygiene and nutritional standards. It serves as a vibrant social hub where ideas are exchanged beyond the confines of the classroom.",
        image: entrance,
        icon: <Building2 className="text-[#FFBF00] w-6 h-6" />
      }
    ]
  }
};

// Helper to get a flat list of all facilities for routing
export const getAllFacilitiesFlat = () => {
  const allFacilities = [];
  Object.keys(facilitiesData).forEach(categoryKey => {
    const category = facilitiesData[categoryKey];
    category.facilities.forEach(facility => {
      allFacilities.push({ ...facility, categoryId: categoryKey, categoryTitle: category.title });
    });
  });
  return allFacilities;
};

// Helper to get a specific facility by ID
export const getFacilityById = (id) => {
  return getAllFacilitiesFlat().find(f => f.id === id);
};
