import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'subtitleH2' | 'link';
  textColor?: 'black' | 'white'; // 👈 nuevo prop
};

export function ThemedText({
  style,
  type = 'default',
  textColor,
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        textColor === 'black' ? { color: '#000' } : undefined,
        textColor === 'white' ? { color: '#fff' } : undefined,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'subtitleH2' ? styles.subtitleH2 : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 14,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    marginBlock: 5
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitleH2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
