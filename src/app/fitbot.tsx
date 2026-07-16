import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { fetchFitbotFaqs, FaqItem } from '@/services/fitbotService';
import { translateList } from '@/lib/translate';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ChatMessage = {
  id: string;
  from: 'bot' | 'user';
  text: string;
};

export default function FitBotScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ i18n.language dependency add ki taake language switch karne pe FAQs
  // (question + answer dono) dobara fetch+translate ho jayen.
  useEffect(() => {
    let isActive = true;
    (async () => {
      setLoading(true);
      const data = await fetchFitbotFaqs();
      const translated = await translateList(data, ['question', 'answer'], i18n.language);
      if (isActive) {
        setFaqs(translated);
        setLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [i18n.language]);

  // User ek FAQ question pe tap kare -- uska pehle se likha hua answer turant chat mein aa jaye
  const handleFaqPress = (faq: FaqItem) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), from: 'user', text: faq.question };
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), from: 'bot', text: faq.answer };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // Free-text input -- agar wo kisi FAQ se match kare to uska answer, warna default reply
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), from: 'user', text };
    setInput('');

    const matched = faqs.find((f) => f.question.toLowerCase() === text.trim().toLowerCase());

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          from: 'bot',
          text: matched ? matched.answer : t('common.fitbotNoAnswer'),
        },
      ]);
    }, 400);
  };

  if (loading) {
    return (
      <View style={[{ flex: 1 }, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <BackHeader />
          <Text style={[styles.title, { color: theme.text }]}>{t('common.fitbotTitle')}</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={styles.greetingWrap} showsVerticalScrollIndicator={false}>
            <View style={[styles.botIconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={36} color={theme.primary} />
            </View>
            <Text style={[styles.greetingTitle, { color: theme.text }]}>{t('common.fitbotGreeting')}</Text>

            <View style={styles.promptsWrap}>
              {faqs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={[styles.promptChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => handleFaqPress(faq)}
                >
                  <Text style={[styles.promptText, { color: theme.text }]}>{faq.question}</Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.messagesWrap} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.from === 'user'
                    ? [styles.userBubble, { backgroundColor: theme.primary }]
                    : [styles.botBubble, { backgroundColor: theme.surface }],
                ]}
              >
                <Text style={{ color: msg.from === 'user' ? '#FFFFFF' : theme.text, fontSize: 13 }}>
                  {msg.text}
                </Text>
              </View>
            ))}

            {/* Suggested questions bottom mein bhi milte rahein taake user aur pooch sake */}
            <View style={[styles.promptsWrap, { marginTop: 12 }]}>
              {faqs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={[styles.promptChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => handleFaqPress(faq)}
                >
                  <Text style={[styles.promptText, { color: theme.text }]}>{faq.question}</Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={t('common.typeYourQuestion') ?? undefined}
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={() => sendMessage(input)}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '700' },
  menuBtn: { padding: 4 },

  greetingWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 40 },
  botIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  greetingTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', paddingHorizontal: 10 },

  promptsWrap: { width: '100%', gap: 10, marginTop: 8 },
  promptChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  promptText: { fontSize: 13, flex: 1, marginRight: 8 },

  messagesWrap: { flexGrow: 1, paddingVertical: 10, gap: 10 },
  messageBubble: { maxWidth: '80%', borderRadius: 14, padding: 12 },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: { alignSelf: 'flex-start' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    marginTop: 10,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 10 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});
