import { View, type ViewProps, Text } from 'react-native'; // Added Text import
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView(props: ThemedViewProps) { 
  if (!props) {
    console.error("ThemedView received undefined props!");
    // Return a basic View to prevent further errors, though this indicates a deeper issue
    return <View style={{ flex: 1, backgroundColor: 'red' }}><Text>Error: ThemedView props undefined</Text></View>;
  }

  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
