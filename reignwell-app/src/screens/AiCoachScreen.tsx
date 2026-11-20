import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hello! I'm your ReignWell AI Coach. I can help you optimise your nutrition, interpret your blood work, and build habits that stick. What would you like to work on today?",
    time: '12:00 PM',
  },
  {
    id: '2',
    role: 'user',
    text: 'My Vitamin D is low. What should I do?',
    time: '12:01 PM',
  },
  {
    id: '3',
    role: 'ai',
    text: "Your Vitamin D at 22 ng/mL is below the optimal range (30–100 ng/mL). Here's what I recommend:\n\n• Supplement with 2,000–4,000 IU of D3 daily, taken with a fatty meal\n• Get 15–20 mins of direct sunlight between 10am–2pm\n• Add fatty fish (salmon, mackerel) twice a week\n\nRetest in 8–12 weeks. Would you like me to add a D3 supplement to your stack?",
    time: '12:01 PM',
  },
];

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const AI_REPLIES = [
  "That's a great question. Based on your recent data, I'd suggest focusing on sleep quality first — it directly impacts nutrient absorption and recovery.",
  "Your metrics are trending in the right direction. Keep up with the current protocol and we can reassess in two weeks.",
  "I'd recommend adding magnesium glycinate to your evening routine — it supports both sleep and muscle recovery.",
  "Looking at your blood work trends, your LDL has been elevated. Have you considered reducing saturated fat intake and adding more omega-3s?",
];

let replyIndex = 0;

export default function AiCoachScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time: now() };
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: AI_REPLIES[replyIndex % AI_REPLIES.length],
      time: now(),
    };
    replyIndex++;
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.topBar}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarIcon}>✦</Text>
        </View>
        <View>
          <Text style={styles.coachName}>ReignWell Coach</Text>
          <Text style={styles.coachStatus}>● Online</Text>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>PRO</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.aiText]}>
              {m.text}
            </Text>
            <Text style={[styles.bubbleTime, m.role === 'user' ? styles.userTime : styles.aiTime]}>
              {m.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask your coach…"
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF6EC',
  },
  avatarIcon: { fontSize: 18, color: '#C9A84C' },
  coachName: { fontSize: 15, fontWeight: '700', color: '#111111' },
  coachStatus: { fontSize: 12, color: '#22C55E', marginTop: 1 },
  premiumBadge: {
    marginLeft: 'auto',
    backgroundColor: '#C9A84C',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumText: { fontSize: 10, fontWeight: '800', color: '#111111', letterSpacing: 1 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  bubble: { maxWidth: '82%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#111111', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F7F7F7', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  userText: { color: '#FFFFFF' },
  aiText: { color: '#111111' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  userTime: { color: '#888888', textAlign: 'right' },
  aiTime: { color: '#AAAAAA' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111111',
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { fontSize: 20, color: '#111111', fontWeight: '700' },
});
