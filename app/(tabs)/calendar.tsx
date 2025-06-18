import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const monthColors = [
  '#00ffff', // January - Aqua
  '#00e6e6', // February - Lighter Aqua
  '#00cccc', // March
  '#00b3b3', // April
  '#009999', // May
  '#008080', // June
  '#007070', // July
  '#005f5f', // August
  '#004f4f', // September
  '#003f3f', // October
  '#002f2f', // November
  '#001f1f', // December
];

const PHI = 1.618;
const BASE = 13; // base spacing
const SPACING = {
  sm: BASE,
  md: Math.round(BASE * PHI), // ≈21
  lg: Math.round(BASE * PHI * PHI), // ≈34
};

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadNotes = async () => {
      const saved = await AsyncStorage.getItem('notes');
      if (saved) {
        const notes = JSON.parse(saved);
        // Build markedDates object
        const marks: Record<string, any> = {};
        notes.forEach((msg: any) => {
          if (msg.date) {
            const d = new Date(msg.date);
            const key = d.toISOString().split('T')[0];
            const color = monthColors[d.getMonth()];
            marks[key] = {
              selected: true,
              selectedColor: color,
            };
          }
        });
        setMarkedDates(marks);
      }
    };
    loadNotes();
  }, []);

  // Custom day component for spacing and style
  const renderDay = (props: any) => {
    const { date, state } = props;
    const key = date?.dateString;
    const isSelected = key && markedDates[key]?.selected;
    const selectedColor = key && markedDates[key]?.selectedColor || 'transparent';
    const isToday = key === new Date().toISOString().split('T')[0];
    return (
      <View
        style={{
          padding: 6,
          borderRadius: 8,
          backgroundColor: isSelected ? selectedColor : isToday ? '#00e6e6' : 'transparent',
          borderWidth: 1,
          borderColor: isSelected ? selectedColor : '#005f5f',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color:
              state === 'disabled'
                ? '#00b3b3'
                : isSelected
                ? '#001a1a'
                : '#f0ffff',
            fontWeight: isSelected ? 'bold' : '500',
            fontSize: 16,
          }}
        >
          {date?.day}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        markingType="custom"
        dayComponent={renderDay}
        theme={{
          backgroundColor: '#001a1a',
          calendarBackground: '#001a1a',
          textSectionTitleColor: '#f0ffff',
          selectedDayBackgroundColor: '#00ffff',
          selectedDayTextColor: '#001a1a',
          todayTextColor: '#00e6e6',
          dayTextColor: '#f0ffff',
          textDisabledColor: '#00b3b3',
          monthTextColor: '#f0ffff',
          arrowColor: '#00ffff',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 22,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001a1a',
    alignItems: 'stretch',
    paddingTop: 55,
  },
  calendar: {
    alignSelf: 'stretch',
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#002f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 0,
  },
}); 