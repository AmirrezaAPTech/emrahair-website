import { servicePageRoute } from '@/components/service/ServicePage';

const route = servicePageRoute('balyaj');

export const generateMetadata = route.generateMetadata;
export default route.Page;
