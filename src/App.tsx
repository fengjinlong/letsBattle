import React, { useState } from 'react';
import { Page, GameConfig, BossPreset, PlayerState, BossState, BattleStats } from './types';
import { DEFAULT_CONFIG, BOSS_PRESETS, createInitialInventory, getTotalSuppliesCount } from './constants';
import { SetupPage } from './pages/SetupPage';
import { DraftPage } from './pages/DraftPage';
import { BattlePage } from './pages/BattlePage';
import { ResultPage } from './pages/ResultPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('setup');
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [selectedBossPreset, setSelectedBossPreset] = useState<BossPreset>(BOSS_PRESETS.low);
  const [battleStats, setBattleStats] = useState<BattleStats | null>(null);

  // Setup -> Draft
  const handleStartAdventure = () => {
    setCurrentPage('draft');
  };

  // Draft -> Battle
  const handleConfirmBoss = (boss: BossPreset) => {
    setSelectedBossPreset(boss);
    setCurrentPage('battle');
  };

  // Draft -> Setup
  const handleBackToSetup = () => {
    setCurrentPage('setup');
  };

  // Battle -> Result
  const handleFinishBattle = (stats: BattleStats) => {
    setBattleStats(stats);
    setCurrentPage('result');
  };

  // Result -> Setup or Draft
  const handlePlayAgain = () => {
    setCurrentPage('draft');
  };

  const handleReturnToSetup = () => {
    setCurrentPage('setup');
  };

  const activeInventory = config.suppliesInventory || createInitialInventory();

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-start">
      {currentPage === 'setup' && (
        <SetupPage
          config={config}
          onUpdateConfig={setConfig}
          onStart={handleStartAdventure}
        />
      )}

      {currentPage === 'draft' && (
        <DraftPage
          onConfirmBoss={handleConfirmBoss}
          onBack={handleBackToSetup}
        />
      )}

      {currentPage === 'battle' && (
        <BattlePage
          config={config}
          initialPlayer={{
            maxHP: config.playerHP,
            currentHP: config.playerHP,
            attack: config.playerAttack,
            suppliesLeft: getTotalSuppliesCount(activeInventory),
            inventory: { ...activeInventory },
          }}
          boss={{
            preset: selectedBossPreset,
            maxHP: selectedBossPreset.maxHP,
            currentHP: selectedBossPreset.maxHP,
            attack: selectedBossPreset.attack,
          }}
          onFinishBattle={handleFinishBattle}
        />
      )}

      {currentPage === 'result' && battleStats && (
        <ResultPage
          stats={battleStats}
          onPlayAgain={handlePlayAgain}
          onBackToSetup={handleReturnToSetup}
        />
      )}
    </main>
  );
}
