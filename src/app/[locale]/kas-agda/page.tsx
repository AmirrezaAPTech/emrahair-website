import { servicePageRoute } from '@/components/service/ServicePage';

const route = servicePageRoute('kas-agda');

export const generateMetadata = route.generateMetadata;
export default route.Page;
