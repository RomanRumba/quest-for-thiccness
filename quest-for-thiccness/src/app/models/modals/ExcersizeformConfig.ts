import { Excersize } from "../excersize";
import { Program } from "../program";

export interface ExcersizeformConfig 
{
    /**
     * 1 = new program
     * 2 = update program
     */
    flag: 1 | 2 , 
    excersizes: Excersize[],
    program: Program
}