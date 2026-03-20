import { getProcessByNumber } from './lib/datajud/getProcessByNumber';

async function test() {
    process.env.DATAJUD_API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
    try {
        const processNumber = '00008323520184013202';
        const result = await getProcessByNumber({ processNumber, tribunal: 'TRF1' });
        console.log('Result length:', result.length);
        console.log(result);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

test();
