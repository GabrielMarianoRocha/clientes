import { Layout as LayoutKitten, LayoutProps } from '@ui-kitten/components';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import Loading from '../../screens/utils/Loading';

type Props = LayoutProps &
  SafeAreaViewProps & {
    loading?: boolean;
  };

export default function Layout({ children, loading = false, ...props }: Props) {
  return (
    <SafeAreaView {...props}>
      {loading ? <Loading /> : <LayoutKitten {...props}>{children}</LayoutKitten>}
    </SafeAreaView>
  );
}
