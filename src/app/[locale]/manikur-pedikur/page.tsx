import { servicePageRoute } from '@/components/service/ServicePage';

const route = servicePageRoute('manikur-pedikur');

export const generateMetadata = route.generateMetadata;
export default route.Page;
