import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);

dayjs.calendar('jalali');

export default dayjs;
