import React, { useCallback, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [tab, setTab] = useState('Home'); // Home | Choose | Settings | About
  const [theme, setTheme] = useState('light'); // light | dark

  // Saved selection used by Home; defaults to 1x D6
  const [savedSelection, setSavedSelection] = useState({ 4: 0, 6: 1, 8: 0, 10: 0, 12: 0, 20: 0 });
  // Draft selection while on Choose tab
  const [draftSelection, setDraftSelection] = useState({ 4: 0, 6: 1, 8: 0, 10: 0, 12: 0, 20: 0 });

  const [rolls, setRolls] = useState([]); // array of numbers from the last roll

  const totalDice = useMemo(() => Object.values(savedSelection).reduce((a, b) => a + b, 0), [savedSelection]);
  const selectionLabel = useMemo(() => {
    const parts = Object.entries(savedSelection)
      .filter(([, n]) => n > 0)
      .map(([sides, n]) => `D${sides}x${n}`);
    return parts.length ? parts.join('  ') : 'D6x1';
  }, [savedSelection]);

  const onRoll = useCallback(() => {
    const next = [];
    const sel = { ...savedSelection };
    // Ensure default selection if all zero
    if (Object.values(sel).every((n) => n === 0)) sel[6] = 1;
    for (const sides of [4, 6, 8, 10, 12, 20]) {
      const count = sel[sides] || 0;
      for (let i = 0; i < count; i++) {
        next.push(Math.floor(Math.random() * sides) + 1);
      }
    }
    setRolls(next);
  }, [savedSelection]);

  const colors = useMemo(() => (
    theme === 'dark'
      ? {
          // Provided dark palette
          bg: '#232323', // --color-bg-dark
          text: '#e9e9e9',
          subtext: '#cfcfcf',
          boxBg: '#373737', // --color-gray-dark-100
          boxBorder: '#4B4B4B', // --color-gray-dark-200
          pillBg: '#373737',
          pillBorder: '#4B4B4B',
          primaryBg: '#78DCE8', // use blue as primary
          primaryText: '#232323',
          secondaryBg: '#373737',
          secondaryBorder: '#4B4B4B',
          secondaryText: '#e0e0e0',
          tabBg: '#232323',
          tabBorder: '#4B4B4B',
          // Accents
          accentRed: '#FF6188',
          accentOrange: '#FFD866',
          accentGreen: '#A9DC76',
          accentBlue: '#78DCE8',
        }
      : {
          bg: '#f5f8fb',
          text: '#111',
          subtext: '#333',
          boxBg: '#fff',
          boxBorder: '#d5dbe3',
          pillBg: '#eef7fb',
          pillBorder: '#cfeaf5',
          // Use same accent palette as dark
          accentRed: '#FF6188',
          accentOrange: '#FFD866',
          accentGreen: '#A9DC76',
          accentBlue: '#78DCE8',
          // Primary uses accentBlue
          primaryBg: '#78DCE8',
          primaryText: '#111',
          secondaryBg: '#fff',
          secondaryBorder: '#c7d2fe',
          secondaryText: '#1f2a79',
          tabBg: '#eef7fb',
          tabBorder: '#cfeaf5',
        }
  ), [theme]);

  const renderHome = () => {
    const total = rolls.reduce((a, b) => a + b, 0);
    return (
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Digital Dice</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>{selectionLabel}</Text>
        <View style={[styles.resultsBox, { backgroundColor: colors.boxBg, borderColor: colors.boxBorder }]}>
          {rolls.length === 0 ? (
            <Text style={[styles.resultsHint, { color: colors.subtext }]}>Tap Roll to roll your selected dice</Text>
          ) : (
            <>
              <View style={styles.resultsRow}>
                {rolls.map((r, i) => (
                  <View key={i} style={[styles.resultPill, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
                    <Text style={[styles.resultPillText, { color: colors.text }]}>{r}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.totalText, { color: colors.text }]}>Total: {total}</Text>
            </>
          )}
        </View>
        <Pressable accessibilityRole="button" onPress={onRoll} style={[styles.primaryBtn, { backgroundColor: colors.primaryBg }]}>
          <Text style={[styles.primaryBtnText, { color: colors.primaryText }]}>Roll</Text>
        </Pressable>
      </View>
    );
  };

  const renderChoose = () => (
    <View style={[styles.content, { flex: 1, width: '100%' }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Dice</Text>
      <Text style={[styles.paragraph, { color: colors.subtext }]}>Use + to add, − to remove. Clear to reset. Save to apply.</Text>
      <ScrollView contentContainerStyle={styles.grid} style={{ alignSelf: 'stretch' }}>
        {[4, 6, 8, 10, 12, 20].map((sides) => (
          <DieCard
            key={sides}
            sides={sides}
            count={draftSelection[sides] || 0}
            onAdd={() => setDraftSelection((prev) => ({ ...prev, [sides]: (prev[sides] || 0) + 1 }))}
            onMinus={() => setDraftSelection((prev) => ({ ...prev, [sides]: Math.max(0, (prev[sides] || 0) - 1) }))}
            colors={colors}
          />
        ))}
        <View style={{ height: 12 }} />
      </ScrollView>

      <View style={styles.chooseActions}>
        <Pressable accessibilityRole="button" onPress={() => setDraftSelection({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 })} style={[styles.secondaryBtn, styles.chooseBtn, { backgroundColor: colors.secondaryBg, borderColor: colors.secondaryBorder, flex: 1 }] }>
          <Text style={[styles.chooseBtnText, { color: colors.secondaryText }]}>Clear</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            const sanitized = { ...draftSelection };
            if (Object.values(sanitized).every((n) => n === 0)) sanitized[6] = 1;
            setSavedSelection(sanitized);
            setTab('Home');
          }}
          style={[styles.primaryBtn, styles.chooseBtn, { backgroundColor: colors.primaryBg, flex: 1 }]}
        >
          <Text style={[styles.chooseBtnText, { color: colors.primaryText }]}>Save</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.paragraph, { color: colors.subtext }]}>Theme</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={() => setTheme('light')} style={[styles.secondaryBtn, { backgroundColor: theme==='light'? colors.primaryBg : colors.secondaryBg, borderColor: colors.secondaryBorder }]}>
          <Text style={[styles.secondaryBtnText, { color: theme==='light'? colors.primaryText : colors.secondaryText }]}>Light</Text>
        </Pressable>
        <Pressable onPress={() => setTheme('dark')} style={[styles.secondaryBtn, { backgroundColor: theme==='dark'? colors.primaryBg : colors.secondaryBg, borderColor: colors.secondaryBorder }]}>
          <Text style={[styles.secondaryBtnText, { color: theme==='dark'? colors.primaryText : colors.secondaryText }]}>Dark</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderAbout = () => (
    <View style={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>About</Text>
      <Text style={[styles.paragraph, { color: colors.text }]}>Digital Dice — a simple dice roller built with Expo/React Native.</Text>
    </View>
  );

  const renderContent = () => {
    switch (tab) {
      case 'Home':
        return renderHome();
      case 'Choose':
        return renderChoose();
      case 'Settings':
        return renderSettings();
      case 'About':
        return renderAbout();
      default:
        return renderHome();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.body}>{renderContent()}</View>
      <View style={[styles.tabBar, { backgroundColor: colors.tabBg, borderTopColor: colors.accentBlue }]}>
        <TabButton label="Home" active={tab === 'Home'} onPress={() => setTab('Home')} colors={colors} />
        <TabButton label="Dice" active={tab === 'Choose'} onPress={() => setTab('Choose')} colors={colors} />
        <TabButton label="Settings" active={tab === 'Settings'} onPress={() => setTab('Settings')} colors={colors} />
        <TabButton label="About" active={tab === 'About'} onPress={() => setTab('About')} colors={colors} />
      </View>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

function TabButton({ label, active, onPress, colors }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive, active && { backgroundColor: colors.accentBlue }]} hitSlop={8}>
      <Text style={[
        styles.tabLabel,
        { color: active ? colors.primaryText : colors.subtext },
        active && styles.tabLabelActive,
      ]}>{label}</Text>
    </Pressable>
  );
}

function DieCard({ sides, count, onAdd, onMinus, colors }) {
  return (
    <View style={[styles.card, { borderColor: colors.boxBorder, backgroundColor: colors.boxBg }]}> 
      <Text style={[styles.cardTitle, { color: colors.text }]}>D{String(sides)}</Text>
      <Text style={[styles.cardCount, { color: colors.text }]}>{count}</Text>
      <Pressable onPress={onMinus} style={[styles.cardMinusBtn, { backgroundColor: colors.boxBg, borderColor: colors.accentRed }]} hitSlop={10} accessibilityLabel={`Remove D${sides}`}>
        <Text style={[styles.cardMinusText, { color: colors.accentRed }]}>−</Text>
      </Pressable>
      <Pressable onPress={onAdd} style={[styles.cardPlusBtn, { backgroundColor: colors.boxBg, borderColor: colors.accentBlue }]} hitSlop={10} accessibilityLabel={`Add D${sides}`}>
        <Text style={[styles.cardPlusText, { color: colors.accentBlue }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginTop: -8,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  resultsBox: {
    minHeight: 140,
    alignSelf: 'stretch',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#fff',
    padding: 16,
    position: 'relative',
  },
  resultsHint: {
    textAlign: 'center',
    color: '#666',
  },
  resultsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  resultPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  resultPillText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  totalText: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  primaryBtn: {
    marginTop: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#3b5bfd',
    borderRadius: 14,
    elevation: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Shared style for Dice screen action buttons to ensure equal size
  chooseBtn: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  chooseBtnText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    minWidth: 140,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#1f2a79',
    fontSize: 16,
    fontWeight: '700',
  },
  chooseActions: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  card: {
    width: '48%',
    minHeight: 128,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2d3a8c',
    padding: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2a79',
  },
  cardCount: {
    fontSize: 22,
    marginTop: 8,
    color: '#111',
    fontWeight: '700',
  },
  cardMinusBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffe3e3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffb3b3',
  },
  cardMinusText: {
    fontSize: 24,
    lineHeight: 24,
    color: '#b00020',
    fontWeight: '800',
  },
  cardPlusBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7dd3fc',
  },
  cardPlusText: {
    fontSize: 24,
    lineHeight: 24,
    color: '#075985',
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d0d7ff',
    backgroundColor: '#e8ecff',
    paddingBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#111',
    fontWeight: '900',
  },
});
