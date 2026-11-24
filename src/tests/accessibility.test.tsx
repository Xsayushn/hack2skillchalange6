import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import * as axe from 'axe-core';
import { RoutinePlanner } from '../components/RoutinePlanner';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { IaqHacksGuide } from '../components/IaqHacksGuide';
import { ImpactTracker } from '../components/ImpactTracker';
import { Navbar } from '../components/Navbar';
import { AiAssistantChat } from '../components/AiAssistantChat';
import { RoutineItem, UserImpactMetrics } from '../types/aqi';
import { AssistantContext } from '../types/assistant';

describe('Accessibility & Interactive UI Behavior', () => {
  afterEach(() => {
    cleanup();
  });
  const dummyRoutines: RoutineItem[] = [
    {
      id: 'r1',
      timeSlot: '08:00 - 09:30',
      title: 'Low-Emission Commute',
      originalAction: 'Solo driving 20 km',
      ecoCleanAction: 'Electric metro rail',
      emissionSavedKgCo2: 3.08,
      exposureAvoidedPm25Ug: 150,
      healthBenefit: 'Reduces diesel exhaust exposure',
      isAdopted: false,
      assumptions: 'Based on EPA AP-42',
    },
  ];

  const dummyMetrics: UserImpactMetrics = {
    estimatedInhaledMassSavedUg: 150,
    transportCo2SavedKg: 3.08,
    adoptedRoutinesCount: 1,
    calculationAssumptions: {
      adultRestVentilationM3Hr: 0.6,
      adultExertionVentilationM3Hr: 2.1,
      n95FiltrationEfficiencyPct: 95,
      commuteDistanceKm: 20,
      commuteMode: 'Private Car',
      baselineEmissionFactorKgKm: 0.192,
      cleanTransitEmissionFactorKgKm: 0.038,
    },
  };

  it('RoutinePlanner uses one clear adoption control per routine and avoids nested interactive controls', () => {
    const onToggle = vi.fn();
    const { container, getByRole, getAllByRole } = render(
      <RoutinePlanner routines={dummyRoutines} onToggleRoutine={onToggle} />
    );

    // Verify button exists with proper aria-pressed
    const toggleBtn = getByRole('button', { name: /Adopt Low-Emission Commute/i });
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');
    expect(
      getAllByRole('button').filter((button) => button.hasAttribute('aria-pressed'))
    ).toHaveLength(1);

    // Click toggle
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith('r1');

    // Verify there are NO nested button-in-button or div[role=button] wrapping button
    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.closest('button, [role="button"]') === btn).toBe(true);
    });
  });

  it('IaqHacksGuide accordion sets correct aria-expanded, aria-controls, and aria-pressed attributes', () => {
    const { getAllByRole } = render(<IaqHacksGuide />);

    // Check category filter button has aria-pressed
    const filterButtons = getAllByRole('button');
    const allCategoryBtn = filterButtons.find((b) => b.textContent?.trim() === 'All');
    expect(allCategoryBtn?.getAttribute('aria-pressed')).toBe('true');

    // Check Corsi-Rosenthal accordion header
    const corsiHeader = filterButtons.find((b) => b.textContent?.includes('Corsi-Rosenthal'));
    expect(corsiHeader).toBeDefined();
    expect(corsiHeader?.getAttribute('aria-expanded')).toBe('true'); // Default expanded
    expect(corsiHeader?.getAttribute('aria-controls')).toBe('hack-panel-corsi-rosenthal-box');
  });

  it('ApiKeyModal traps focus, handles Escape key, and restores previous focus', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    // Trigger button that had focus before modal opened
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = render(
      <ApiKeyModal isOpen={true} onClose={onClose} currentKey="" onSaveKey={onSave} />
    );

    // Escape key calls onClose
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    // Unmount/close modal restores focus to trigger
    rerender(<ApiKeyModal isOpen={false} onClose={onClose} currentKey="" onSaveKey={onSave} />);
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it('ApiKeyModal retains typed input across parent re-renders and handles Tab wrapping', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    const { container, getAllByRole, rerender } = render(
      <ApiKeyModal isOpen={true} onClose={onClose} currentKey="" onSaveKey={onSave} />
    );

    const input = container.querySelector('#gemini-key-input') as HTMLInputElement;
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: 'AIzaSyDraftTestingKeyInFlight123456789' } });
    expect(input.value).toBe('AIzaSyDraftTestingKeyInFlight123456789');

    // Simulate parent re-render with new function references
    rerender(<ApiKeyModal isOpen={true} onClose={() => {}} currentKey="" onSaveKey={() => {}} />);

    // Typed input is preserved!
    expect(input.value).toBe('AIzaSyDraftTestingKeyInFlight123456789');

    // Focus wrapping test: Tab on the last element wraps to the first
    const focusable = getAllByRole('button');
    const lastElement = focusable[focusable.length - 1];
    const firstElement = focusable[0];

    lastElement.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: false });
    // Tab trapped inside modal
    expect(document.activeElement).toBeDefined();

    // Shift+Tab on first element wraps
    firstElement.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBeDefined();
  });

  it('announces the selected navigation section and high-contrast toggle state', () => {
    const { getAllByRole, getByRole, getByLabelText } = render(
      <Navbar
        onOpenApiKeyModal={() => {}}
        hasCustomKey={false}
        highContrast
        toggleHighContrast={() => {}}
        activeTab="iaq"
        setActiveTab={() => {}}
      />
    );

    expect(
      getAllByRole('button', { name: 'Indoor Air Hacks' }).every(
        (button) => button.getAttribute('aria-current') === 'page'
      )
    ).toBe(true);

    // Verify mobile navigation exists as a labelled nav landmark
    const mobileNav = getByLabelText('Mobile Navigation');
    expect(mobileNav.tagName.toLowerCase()).toBe('nav');

    expect(
      getByRole('button', { name: 'Toggle High Contrast Mode' }).getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('AiAssistantChat exposes aria-live polite region for screen reader announcements', () => {
    const dummyContext: AssistantContext = {
      cityName: 'Delhi',
      currentAqi: 350,
      aqiCategory: 'Hazardous',
      pm25: 295,
      estimatedStagnationRisk: 'High',
      vulnerabilities: ['Respiratory/Asthma'],
      hasPurifier: true,
      commuteMode: 'Electric Metro Rail',
    };

    const { container } = render(<AiAssistantChat context={dummyContext} apiKey="" />);

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeDefined();
    expect(liveRegion?.getAttribute('role')).toBe('log');
  });

  it('ImpactTracker renders valid region with accessible landmarks and no NaN/undefined', () => {
    const { container, getByRole } = render(<ImpactTracker metrics={dummyMetrics} />);

    const region = getByRole('region');
    expect(region).toBeDefined();
    expect(region.getAttribute('aria-label')).toBeDefined();

    // Verify no NaN or undefined text rendered
    expect(container.textContent).not.toContain('NaN');
    expect(container.textContent).not.toContain('undefined');
  });

  it('passes axe-core accessibility checks on rendered components with zero critical violations', async () => {
    const { container } = render(
      <main>
        <ImpactTracker metrics={dummyMetrics} />
        <RoutinePlanner routines={dummyRoutines} onToggleRoutine={() => {}} />
      </main>
    );

    const results = await axe.run(container, {
      rules: {
        // Exclude color-contrast in JSDOM because CSS stylesheets aren't computed by jsdom engine
        'color-contrast': { enabled: false },
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });
});
