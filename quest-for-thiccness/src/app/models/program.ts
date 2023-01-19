export interface Program 
{
    id: string,
    name:string,
    schedule: string[],
    exesices:
    {
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