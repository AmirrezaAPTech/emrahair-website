import { servicePageRoute } from '@/components/service/ServicePage';

const route = servicePageRoute('sac-kesimi');

export const generateMetadata = route.generateMetadata;
export default route.Page;
