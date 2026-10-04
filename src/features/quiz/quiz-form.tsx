import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createQuestion } from './data';
import type { QuizDraft, QuizQuestion } from './types';
import { colors, radius, shadow, spacing, type } from '@/theme/tokens';

type QuizFormProps = {
  initialValue?: QuizDraft;
  onCancel: () => void;
  onSubmit: (value: QuizDraft) => void;
};

const optionLabels = ['A', 'B', 'C', 'D'];

export function QuizForm({ initialValue, onCancel, onSubmit }: QuizFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialValue?.questions ?? [createQuestion()]);

  const updateQuestion = (questionId: string, patch: Partial<QuizQuestion>) => {
    setQuestions((current) => current.map((question) => question.id === questionId ? { ...question, ...patch } : question));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((current) => current.map((question) => {
      if (question.id !== questionId) return question;
      const options = [...question.options] as QuizQuestion['options'];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const save = () => {
    const cleanTitle = title.trim();
    const invalidQuestion = questions.findIndex((question) => !question.text.trim() || question.options.some((option) => !option.trim()));
    if (!cleanTitle) {
      Alert.alert('Thiếu tên Quiz', 'Bạn hãy nhập tên bài kiểm tra trước khi lưu.');
      return;
    }
    if (invalidQuestion >= 0) {
      Alert.alert('Chưa hoàn thành câu hỏi', `Câu ${invalidQuestion + 1} cần có nội dung và đủ 4 lựa chọn.`);
      return;
    }
    onSubmit({
      title: cleanTitle,
      description: description.trim(),
      questions: questions.map((question) => ({
        ...question,
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()) as QuizQuestion['options'],
      })),
      status: 'ready',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={onCancel} style={styles.iconButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>{initialValue ? 'CHỈNH SỬA ĐỀ' : 'QUIZ MỚI'}</Text>
            <Text numberOfLines={1} style={styles.headerTitle}>{title || 'Quiz chưa đặt tên'}</Text>
          </View>
          <View style={styles.countBadge}><Text style={styles.countText}>{questions.length} câu</Text></View>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <View style={styles.introIcon}><Text style={styles.introEmoji}>✦</Text></View>
            <View style={styles.introCopy}>
              <Text style={styles.introTitle}>Tạo một bài kiểm tra thật dễ hiểu</Text>
              <Text style={styles.introText}>Mỗi câu gồm 4 lựa chọn. Chạm vào vòng tròn để đánh dấu đáp án đúng.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Tên bài kiểm tra <Text style={styles.required}>*</Text></Text>
            <TextInput
              maxLength={120}
              onChangeText={setTitle}
              placeholder="Ví dụ: Chi tiêu thông minh"
              placeholderTextColor="#98A49E"
              style={styles.input}
              value={title}
            />
            <Text style={styles.label}>Mô tả ngắn</Text>
            <TextInput
              maxLength={240}
              multiline
              onChangeText={setDescription}
              placeholder="Quiz này giúp học sinh ôn lại nội dung gì?"
              placeholderTextColor="#98A49E"
              style={[styles.input, styles.descriptionInput]}
              textAlignVertical="top"
              value={description}
            />
          </View>

          <View style={styles.questionHeading}>
            <View>
              <Text style={styles.questionHeadingTitle}>Câu hỏi</Text>
              <Text style={styles.questionHeadingSub}>Chọn duy nhất một đáp án đúng</Text>
            </View>
            <Text style={styles.questionTotal}>{questions.length}</Text>
          </View>

          {questions.map((question, questionIndex) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionTop}>
                <View style={styles.questionNumber}><Text style={styles.questionNumberText}>{questionIndex + 1}</Text></View>
                <Text style={styles.questionTitle}>Câu {questionIndex + 1}</Text>
                {questions.length > 1 && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}
                    hitSlop={8}
                  >
                    <Text style={styles.removeText}>Xóa</Text>
                  </Pressable>
                )}
              </View>
              <TextInput
                multiline
                onChangeText={(value) => updateQuestion(question.id, { text: value })}
                placeholder="Nhập nội dung câu hỏi..."
                placeholderTextColor="#98A49E"
                style={[styles.input, styles.questionInput]}
                textAlignVertical="top"
                value={question.text}
              />
              <Text style={styles.answerHint}>CÁC LỰA CHỌN</Text>
              {question.options.map((option, optionIndex) => {
                const selected = question.correctOption === optionIndex;
                return (
                  <View key={`${question.id}-${optionIndex}`} style={[styles.optionRow, selected && styles.optionRowSelected]}>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => updateQuestion(question.id, { correctOption: optionIndex })}
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected && <View style={styles.radioDot} />}
                    </Pressable>
                    <View style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
                      <Text style={[styles.optionLetterText, selected && styles.optionLetterTextSelected]}>{optionLabels[optionIndex]}</Text>
                    </View>
                    <TextInput
                      onChangeText={(value) => updateOption(question.id, optionIndex, value)}
                      placeholder={`Lựa chọn ${optionLabels[optionIndex]}`}
                      placeholderTextColor="#98A49E"
                      style={styles.optionInput}
                      value={option}
                    />
                    {selected && <Text style={styles.correctText}>Đúng</Text>}
                  </View>
                );
              })}
            </View>
          ))}

          <Pressable accessibilityRole="button" onPress={() => setQuestions((current) => [...current, createQuestion()])} style={styles.addButton}>
            <View style={styles.addIcon}><Text style={styles.addIconText}>＋</Text></View>
            <View style={styles.addCopy}>
              <Text style={styles.addTitle}>Thêm câu hỏi</Text>
              <Text style={styles.addSub}>Tạo thêm một câu với 4 lựa chọn</Text>
            </View>
            <Text style={styles.addArrow}>›</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}><Text style={styles.cancelText}>Hủy</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={save} style={styles.saveButton}>
            <Text style={styles.saveText}>Lưu & xem trước</Text><Text style={styles.saveArrow}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  header: { minHeight: 70, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.ink, fontSize: 31, lineHeight: 32, marginTop: -2 },
  headerCopy: { flex: 1 },
  headerEyebrow: { ...type.eyebrow, color: colors.purple, fontSize: 9 },
  headerTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 2 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 7, backgroundColor: colors.purpleSoft, borderRadius: radius.round },
  countText: { color: colors.purple, fontSize: 11, fontWeight: '900' },
  content: { padding: spacing.lg, paddingBottom: 36, gap: spacing.lg },
  intro: { flexDirection: 'row', gap: 13, padding: 16, backgroundColor: colors.purpleSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: '#DDD0FA' },
  introIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple },
  introEmoji: { color: colors.white, fontSize: 21 },
  introCopy: { flex: 1 },
  introTitle: { color: '#42296B', fontSize: 14, fontWeight: '900' },
  introText: { color: '#695780', fontSize: 11, lineHeight: 17, marginTop: 4 },
  section: { gap: 9 },
  label: { color: colors.inkSoft, fontSize: 13, fontWeight: '800', marginTop: 3 },
  required: { color: colors.coral },
  input: { minHeight: 54, paddingHorizontal: 15, paddingVertical: 13, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, color: colors.ink, fontSize: 14, fontWeight: '600' },
  descriptionInput: { minHeight: 90 },
  questionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionHeadingTitle: { ...type.h2, color: colors.ink },
  questionHeadingSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  questionTotal: { width: 32, height: 32, lineHeight: 32, textAlign: 'center', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.ink, color: colors.white, fontWeight: '900' },
  questionCard: { padding: 17, gap: 12, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  questionTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  questionNumber: { width: 31, height: 31, borderRadius: 11, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  questionNumberText: { color: colors.ink, fontWeight: '900' },
  questionTitle: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '900' },
  removeText: { color: '#B6543C', fontSize: 12, fontWeight: '800' },
  questionInput: { minHeight: 82 },
  answerHint: { ...type.eyebrow, color: colors.muted, fontSize: 9, marginTop: 2 },
  optionRow: { minHeight: 54, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: '#FCFDFB' },
  optionRowSelected: { borderColor: colors.green, backgroundColor: '#F0FAF4' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#B8C2BD', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.green },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
  optionLetter: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#EEF1EF', alignItems: 'center', justifyContent: 'center' },
  optionLetterSelected: { backgroundColor: colors.green },
  optionLetterText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  optionLetterTextSelected: { color: colors.white },
  optionInput: { flex: 1, minWidth: 0, height: 48, color: colors.ink, fontSize: 13, fontWeight: '600' },
  correctText: { color: colors.greenDark, fontSize: 10, fontWeight: '900' },
  addButton: { minHeight: 76, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#B7A1E8', borderRadius: radius.xl, backgroundColor: '#FAF8FF' },
  addIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  addIconText: { color: colors.purple, fontSize: 24, fontWeight: '500' },
  addCopy: { flex: 1 },
  addTitle: { color: colors.purple, fontSize: 14, fontWeight: '900' },
  addSub: { color: colors.muted, fontSize: 10, marginTop: 3 },
  addArrow: { color: colors.purple, fontSize: 27 },
  footer: { paddingHorizontal: spacing.lg, paddingTop: 12, paddingBottom: 8, gap: 10, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white },
  cancelButton: { minHeight: 52, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
  cancelText: { color: colors.inkSoft, fontWeight: '900' },
  saveButton: { flex: 1, minHeight: 52, paddingHorizontal: 18, borderRadius: radius.md, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.yellow, ...shadow.button },
  saveText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  saveArrow: { color: colors.ink, fontSize: 20 },
});
