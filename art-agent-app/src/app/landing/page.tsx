'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Newspaper, Tags, CheckCircle, BarChart2 } from 'lucide-react';
import React from 'react';

// Animation variants for Framer Motion
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// --- Reusable Components ---

const Header = () => (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200"
  >
    <div className="container mx-auto px-6 py-4">
      <div className="flex justify-between items-center">
        <Link href="/landing" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-md flex items-center justify-center">
            <Image src="/Artplan_logo.svg" alt="Artplan Logo" width={32} height={32} className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">A.R.T</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Agente de Relatórios e Tendências</p>
          </div>
        </Link>
        <Link 
          href="/dashboard" 
          className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center gap-2"
        >
          <span>Acessar Dashboard</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </motion.header>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
  <motion.div variants={fadeIn} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 transform hover:-translate-y-1 transition-transform duration-300">
    <div className="bg-primary/10 text-primary h-12 w-12 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h4 className="text-xl font-bold mb-2 text-slate-900">{title}</h4>
    <p className="text-slate-600">{children}</p>
  </motion.div>
);

const Footer = () => (
  <footer className="bg-slate-100 border-t border-slate-200">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="bg-primary p-2 rounded-md flex items-center justify-center">
            <Image src="/Artplan_logo.svg" alt="Artplan Logo" width={28} height={28} className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold text-slate-800">A.R.T</p>
            <p className="text-sm text-slate-500">Agente de Relatórios e Tendências</p>
          </div>
        </div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Artplan. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

// --- Page Sections ---

const HeroSection = () => (
  <section className="bg-white" id="hero">
    <div className="container mx-auto px-6 py-20 sm:py-28">
      <motion.div 
        className="grid lg:grid-cols-2 gap-16 items-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeIn} className="text-slate-900">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Monitore o Mercado com <span className="text-primary">Inteligência</span>
          </h2>
          <p className="text-lg md:text-xl max-w-xl text-slate-600 mb-8">
            Com o A.R.T, você acompanha em tempo real as principais tendências, concorrentes e oportunidades do mercado de publicidade e marketing, de forma automática e precisa.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-primary-dark transition-colors duration-300 text-lg inline-flex items-center gap-3"
          >
            <span>Acessar a Plataforma</span>
            <ArrowRight size={20} />
          </Link>
        </motion.div>
        <motion.div variants={fadeIn} className="hidden lg:block relative">
          <div className="bg-slate-50 p-8 rounded-lg shadow-xl border border-slate-200">
            <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center"><Newspaper size={20} /></div>
              <p className="text-slate-700">Notícia sobre <span className="font-bold text-primary">"Novos Clientes"</span> detectada.</p>
            </div>
            <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg shadow-sm ml-8">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center"><Tags size={20} /></div>
              <p className="text-slate-700">Artigo sobre <span className="font-bold text-primary">"Prêmios"</span> categorizado.</p>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center"><BarChart2 size={20} /></div>
              <p className="text-slate-700">Relatório de <span className="font-bold text-primary">"Concorrentes"</span> atualizado.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-20 sm:py-24 bg-slate-50" id="features">
    <div className="container mx-auto px-6">
      <motion.div 
        className="text-center mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeIn}
      >
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
          Tudo que você precisa em um só lugar
        </h3>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Nossa plataforma oferece as ferramentas essenciais para uma análise de mercado completa e eficaz, automatizando o trabalho manual.
        </p>
      </motion.div>
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={staggerContainer}
      >
        <FeatureCard icon={<Newspaper size={28} />} title="Coleta de Notícias">
          Agregamos informações de dezenas de fontes para que você não perca nada importante sobre o mercado.
        </FeatureCard>
        <FeatureCard icon={<Tags size={28} />} title="Categorização Automática">
          Nosso sistema organiza o conteúdo por tags e categorias (Concorrentes, Prêmios, etc.), facilitando sua análise.
        </FeatureCard>
        <FeatureCard icon={<CheckCircle size={28} />} title="Validação de Dados">
          Garantimos a precisão e a relevância das informações coletadas para sua tomada de decisão, corrigindo dados incorretos.
        </FeatureCard>
        <FeatureCard icon={<BarChart2 size={28} />} title="Dashboard Intuitivo">
          Visualize os dados de forma clara e objetiva, com filtros e relatórios interativos para encontrar o que importa.
        </FeatureCard>
      </motion.div>
    </div>
  </section>
);


// --- Main Landing Page Component ---

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}