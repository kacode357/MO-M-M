import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { geminiApiClient } from '../../services/GeminiApiClient';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

// Markdown parsing utilities
const parseInlineBold = (
  text: string,
  baseStyle: StyleProp<TextStyle>,
  boldStyle: StyleProp<TextStyle>,
): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={[baseStyle, boldStyle]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={index} style={baseStyle}>{part}</Text>;
  });
};

const parseMarkdown = (
  text: string,
  baseStyle: StyleProp<TextStyle>,
  boldStyle: StyleProp<TextStyle>,
): React.ReactNode[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (/^\*\*(.+)\*\*$/.test(trimmed)) {
      const content = trimmed.slice(2, -2);
      elements.push(
        <Text key={index} style={[baseStyle, boldStyle, styles.headerMarkdown]}>
          {content}
        </Text>,
      );
      return;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
    if (numberedMatch) {
      elements.push(
        <View key={index} style={styles.listItem}>
          <Text style={[baseStyle, styles.listPrefix]}>{`${numberedMatch[1]}. `}</Text>
          <Text style={[baseStyle, styles.listContent]}>
            {parseInlineBold(numberedMatch[2], baseStyle, boldStyle)}
          </Text>
        </View>,
      );
      return;
    }

    if (trimmed.startsWith('* ')) {
      const content = trimmed.slice(2);
      elements.push(
        <View key={index} style={styles.listItem}>
          <Text style={[baseStyle, styles.listPrefix]}>• </Text>
          <Text style={[baseStyle, styles.listContent]}>
            {parseInlineBold(content, baseStyle, boldStyle)}
          </Text>
        </View>,
      );
      return;
    }

    elements.push(
      <Text key={index} style={[baseStyle, styles.textLine]}>
        {parseInlineBold(trimmed, baseStyle, boldStyle)}
      </Text>,
    );
  });

  return elements;
};

// Optimized TypewriterText component
interface TypewriterTextProps {
  text: string;
  baseStyle: StyleProp<TextStyle>;
  boldStyle: StyleProp<TextStyle>;
  onComplete: () => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

const TypewriterText = React.memo(
  function TypewriterText({ text, baseStyle, boldStyle, onComplete, scrollViewRef }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const CHUNK_SIZE = 4; // Adjust chunk size for smoother animation or faster typing

    const stopAnimation = useCallback(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, []);

    const updateText = useCallback(() => {
      if (indexRef.current < text.length) {
        const nextIndex = Math.min(indexRef.current + CHUNK_SIZE, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        indexRef.current = nextIndex;

        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }

        rafRef.current = requestAnimationFrame(updateText);
      } else {
        setIsComplete(true);
        stopAnimation(); // Stop animation frame request
        onComplete();
      }
    }, [text, onComplete, scrollViewRef, stopAnimation]);

    useEffect(() => {
      setDisplayedText('');
      indexRef.current = 0;
      setIsComplete(false);
      stopAnimation(); 

      rafRef.current = requestAnimationFrame(updateText);

      return () => {
        stopAnimation();
      };
    }, [text, updateText, stopAnimation]);

    const handleFastForward = useCallback(() => {
      if (!isComplete) {
        stopAnimation(); // Stop ongoing animation
        setDisplayedText(text);
        indexRef.current = text.length;
        setIsComplete(true);
        onComplete();
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true }); // Animated scroll for fast forward
        }
      }
    }, [isComplete, text, onComplete, scrollViewRef, stopAnimation]);

    return (
      <TouchableOpacity
        onPress={handleFastForward}
        activeOpacity={isComplete ? 1 : 0.8}
        accessibilityLabel="Skip typing animation"
        disabled={isComplete}
      >
        {parseMarkdown(displayedText, baseStyle, boldStyle)}
      </TouchableOpacity>
    );
  }
);
// TypewriterText.displayName = 'TypewriterText'; // Not strictly necessary if named function is used inside memo

// Custom hook for chat logic
const useChat = () => {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const sendMessage = useCallback(async (text?: string) => {
    const message = text || prompt;
    if (!message.trim()) {
      setError('Vui lòng nhập tin nhắn.');
      return;
    }

    if (isBotTyping || loading) {
      Alert.alert('Thông báo', 'Măm Map Bot đang trả lời hoặc đang tải. Vui lòng đợi.');
      return;
    }

    setLoading(true);
    setError(null);
    const userMsg: ChatMessage = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMsg]);
    setPrompt('');

    try {
      const userName = (await AsyncStorage.getItem('user_name')) || null;
      setIsBotTyping(true);
      const response = await geminiApiClient.generateContent(message, userName);
      setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err: any) {
      console.error("Lỗi khi gửi tin nhắn:", err);
      const errorMessage = err.message || 'Đã xảy ra lỗi không xác định.';
      setError(`Lỗi: ${errorMessage}`);
      Alert.alert('Lỗi', `Đã xảy ra lỗi: ${errorMessage}`);
      setChatHistory(prev => prev.filter(msg => msg !== userMsg));
    } finally {
      setLoading(false);
    }
  }, [prompt, isBotTyping, loading]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return { prompt, setPrompt, chatHistory, loading, error, sendMessage, isBotTyping, setIsBotTyping };
};

// ChatHeader Component
interface ChatHeaderProps {
  colors: any;
  onSelect: (suggestion: string) => void;
  disabled: boolean;
  visible: boolean;
}

const ChatHeader = React.memo(
  function ChatHeader({ colors, onSelect, disabled, visible }: ChatHeaderProps) { // Named function
    if (!visible) return null;
    const suggestions = [
      'Làm sao để đăng ký quán trên Măm Map?',
      'Lợi ích khi chủ quán dùng Măm Map?',
      'Cách người dùng review quán?',
      'Tôi tìm quán ăn vặt gần đây thế nào?',
      'Có quy định gì khi đăng bài review không?',
      'Măm Map giải quyết tranh chấp review ra sao?',
    ];

    return (
      <Animatable.View animation="fadeInDown" duration={500} style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
          Măm Map gợi ý:
        </Text>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestion, { backgroundColor: colors.tabBackground }]}
            onPress={() => onSelect(suggestion)}
            disabled={disabled}
          >
            <Text style={[styles.suggestionText, { color: colors.whiteText }]}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </Animatable.View>
    );
  }
);
// ChatHeader.displayName = 'ChatHeader'; // Not strictly necessary if named function is used inside memo

// MessageList Component
interface MessageListProps {
  messages: ChatMessage[];
  colors: any;
  loading: boolean;
  error: string | null;
  setIsBotTyping: (typing: boolean) => void;
}

const MessageList = React.memo(
  function MessageList({ messages, colors, loading, error, setIsBotTyping }: MessageListProps) { // Named function
    const scrollViewRef = useRef<ScrollView>(null);
    const [animatingMessageIndex, setAnimatingMessageIndex] = useState<number | null>(null);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [messages, loading, animatingMessageIndex]);

    useEffect(() => {
      const lastBotMessageIndex = messages.findIndex(
        (msg, idx) => idx === messages.length - 1 && msg.role === 'bot'
      );

      if (lastBotMessageIndex !== -1) {
        setAnimatingMessageIndex(lastBotMessageIndex);
      } else {
        setAnimatingMessageIndex(null);
      }
    }, [messages]);

    return (
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messageContainer}
        style={styles.messageList}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isAnimating = index === animatingMessageIndex;

          return (
            <Animatable.View
              key={`${msg.role}-${index}-${msg.text.length}`}
              animation={isUser ? 'fadeInRight' : 'fadeInLeft'}
              duration={500}
              style={[
                styles.message,
                isUser ? styles.userMessage : styles.botMessage,
                { backgroundColor: isUser ? colors.tabBackground : colors.grayBackground },
              ]}
            >
              {isAnimating ? (
                <TypewriterText
                  text={msg.text}
                  baseStyle={isUser ? styles.userText : styles.botText} // Ensure correct style for bot text if user fast-forwards
                  boldStyle={{ fontFamily: Fonts.Comfortaa.Bold }}
                  onComplete={() => {
                    setAnimatingMessageIndex(null);
                    setIsBotTyping(false);
                  }}
                  scrollViewRef={scrollViewRef}
                />
              ) : (
                parseMarkdown(msg.text, isUser ? styles.userText : styles.botText, {
                  fontFamily: Fonts.Comfortaa.Bold,
                })
              )}
            </Animatable.View>
          );
        })}
        {loading && (
          <Animatable.View animation="pulse" iterationCount="infinite" style={styles.loading}>
            <ActivityIndicator size="small" color={colors.primaryText} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Măm Map Bot đang trả lời...
            </Text>
          </Animatable.View>
        )}
        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
      </ScrollView>
    );
  }
);
// MessageList.displayName = 'MessageList'; // Not strictly necessary if named function is used inside memo


// ChatInput Component
interface ChatInputProps {
  prompt: string;
  setPrompt: (text: string) => void;
  onSend: () => void;
  colors: any;
  disabled: boolean;
}

const ChatInput = React.memo(
  function ChatInput({ prompt, setPrompt, onSend, colors, disabled }: ChatInputProps) { // Named function
    return (
      <Animatable.View
        animation="slideInUp"
        duration={500}
        style={[styles.inputContainer, { borderTopColor: colors.grayBackground, backgroundColor: colors.background }]}
      >
        <TextInput
          style={[styles.input, { borderColor: colors.grayBackground, color: colors.text }]}
          placeholder="Nhập tin nhắn của bạn..."
          placeholderTextColor={colors.icon}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.send, { backgroundColor: colors.primaryText, opacity: disabled ? 0.5 : 1 }]}
          onPress={onSend}
          disabled={disabled}
        >
          <Text style={[styles.sendText, { color: colors.whiteText }]}>Gửi</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  }
);
// ChatInput.displayName = 'ChatInput'; // Not strictly necessary if named function is used inside memo

// Main Component
const AiCreateChatBot = () => { // Function Declaration, displayName inferred
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { prompt, setPrompt, chatHistory, loading, error, sendMessage, isBotTyping, setIsBotTyping } =
    useChat();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.titleBar, { backgroundColor: colors.primaryText }]}>
        <Text style={[styles.titleText, { color: colors.whiteText }]}>BOT MĂM MAP</Text>
      </View>
      <ChatHeader
        colors={colors}
        onSelect={sendMessage}
        disabled={loading || isBotTyping}
        visible={!chatHistory.length && !error}
      />
      <MessageList
        messages={chatHistory}
        colors={colors}
        loading={loading}
        error={error}
        setIsBotTyping={setIsBotTyping}
      />
      <ChatInput
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={() => sendMessage()}
        colors={colors}
        disabled={loading || isBotTyping}
      />
    </KeyboardAvoidingView>
  );
};
// AiCreateChatBot.displayName = 'AiCreateChatBot'; // Not strictly necessary for function declaration

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleBar: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  titleText: {
    fontSize: 22,
    fontFamily: Fonts.Baloo2.Bold,
    letterSpacing: 1,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Fonts.Baloo2.SemiBold,
    marginBottom: 10,
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    elevation: 2,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: Fonts.Comfortaa.Medium,
  },
  messageList: { flex: 1 },
  messageContainer: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  message: {
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userMessage: { alignSelf: 'flex-end' },
  botMessage: { alignSelf: 'flex-start' },
  userText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.Comfortaa.Regular,
  },
  botText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.Comfortaa.Regular,
  },
  headerMarkdown: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: { flexDirection: 'row', marginBottom: 4 },
  listPrefix: { width: 24, textAlign: 'left' },
  listContent: { flex: 1 },
  textLine: { marginBottom: 4 },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: Fonts.Comfortaa.Regular,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.Comfortaa.Regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 120,
    minHeight: 45,
    fontSize: 16,
    fontFamily: Fonts.Comfortaa.Regular,
  },
  send: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sendText: {
    fontSize: 16,
    fontFamily: Fonts.Baloo2.Bold,
  },
});

export default AiCreateChatBot;