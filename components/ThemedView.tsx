import { useThemeColor } from '@/hooks/useThemeColor';
import { Text, View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string; // This prop will be unused
};

export function ThemedView(props: ThemedViewProps) { 
  if (!props) {
    // This error case should ideally not happen with proper usage
    return <View style={{ flex: 1, backgroundColor: 'red' }}><Text>Error: ThemedView props undefined</Text></View>;
  }

  const { style, lightColor, darkColor, ...otherProps } = props;
  // useThemeColor will now always use lightColor or the default light theme 'background'
  const backgroundColor = useThemeColor({ light: lightColor /* dark: darkColor */ }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
