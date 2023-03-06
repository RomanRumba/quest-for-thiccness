export interface Program 
{
    version: number, // this can be whatever number in the start, it will get a correct value in (parseExersizeBeforeSaving)
    id: string,
    name:string,
    schedule: string[],
    exesices:
    {
        position: number;
        resourceUrl: string,
        exesiceID: string,
        isSetBased: boolean,
        notes:string,
        sets:
        {
            setId: string,
            weightOrSec: number | null, 
            repsOrMin: number | null,
            pause: number | null
        }[]
    }[]
}