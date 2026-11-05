import { servicePageRoute } from '@/components/service/ServicePage';

const route = servicePageRoute('keratin');

export const generateMetadata = route.generateMetadata;
export default route.Page;
