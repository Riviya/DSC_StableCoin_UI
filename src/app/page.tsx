'use client';

import React from 'react';
import Home from '../components/Home';
import Header from '../components/Header';
import DemoWrapper from '../components/DemoWrapper';
import ModeToggle from '../components/ModeToggle';
import { useDemoMode } from './hooks/useDemoMode';

const Page: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <>
      <ModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} />
      {isDemoMode ? (
        <DemoWrapper isDemoMode={isDemoMode}>
          {/* Both components now share the same wrapper and state */}
          <Header />
          <Home />
        </DemoWrapper>
      ) : (
        <>
          <Header />
          <Home />
        </>
      )}
    </>
  );
};

export default Page;