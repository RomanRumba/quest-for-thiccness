import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Excersize } from '../models/excersize';
import { lastValueFrom } from 'rxjs';
import { Program } from '../models/program';

// want this to be a singleton service
@Injectable({
    providedIn: 'root'
})
export class CommonService 
{
    public readonly BASEULR = "http://192.168.50.130:4200/";// "https://romanrumba.github.io/quest-for-thiccness/";
    public readonly EXERSIZEDBURL = "http://192.168.50.130:4200/assets/excersizes.json"; //"https://romanrumba.github.io/quest-for-thiccness/assets/excersizes.json"
    

    private readonly FIRSTTIMEKEY = "MYFIRSTTIME";
    private readonly PROGRAMSKEY = "MYPROGRAMS";
    private readonly DEFAULTPAGEKEY = "DEFAULTPAGE";

    private availableExersizes : Excersize[] = [];
    private myPrograms: Program[] | null = null;
    
    constructor(private http: HttpClient) { }

    async getExersizes() : Promise<Excersize[]> 
    {
        if(this.availableExersizes.length != 0)
        {
           return this.availableExersizes;
        }
        this.availableExersizes = await lastValueFrom(this.http.get<Excersize[]>(this.EXERSIZEDBURL));
        return this.availableExersizes;
    }

    getMyPrograms() : Program[]
    {
        if(this.myPrograms !== null)
        {
            return this.myPrograms;
        }

        let programsString = localStorage.getItem(this.PROGRAMSKEY);

        if(programsString === null)
        {
            this.myPrograms = [];
        }
        else
        {
            this.myPrograms = JSON.parse(programsString);
        }
        return <Program[]>this.myPrograms;
    }
   
    async getExcersizesInProgram(id: string) : Promise<Excersize[] | Error>
    {
       this.myPrograms = this.getMyPrograms();
       this.availableExersizes = await this.getExersizes();
       let desiredProgram = this.myPrograms.find(p => p.id === id);
       if(typeof(desiredProgram) === "undefined")
       {
          throw Error("Program not found in the database");
       }

       let exercisesInProgram : Excersize[] = [];

       desiredProgram.exesices.forEach(excersizeToReturn => 
       {
          let exersizeFound = this.availableExersizes.find(e => e.id === excersizeToReturn.exesiceID);
          if(typeof(exersizeFound) === "undefined")
          {
            throw Error("Excersize " + excersizeToReturn.exesiceID +" not found in the database");
          }
          else
          {
            exercisesInProgram.push(exersizeFound);
          }
       });

        return exercisesInProgram;
    }

    saveNewProgram(newProgram: Program)
    {
        var programsToSave = this.getMyPrograms();
        programsToSave?.push(this.parseExersizeBeforeSaving(newProgram));
        localStorage.setItem(this.PROGRAMSKEY,JSON.stringify(this.myPrograms));
    }

    updateProgram(programToUpdate: Program)
    {
        this.myPrograms = this.getMyPrograms();
        let programToUpdateExists = this.myPrograms.findIndex(p => p.id === programToUpdate.id);
        if(programToUpdateExists === -1)
        {
            throw Error("Program not found.");
        }
        this.myPrograms[programToUpdateExists] = this.parseExersizeBeforeSaving(programToUpdate);
        localStorage.setItem(this.PROGRAMSKEY,JSON.stringify(this.myPrograms));
    }

    deleteProgram(id: string) : Program[]
    {
        this.myPrograms = this.getMyPrograms();
        let programIndexToDelete = this.myPrograms.findIndex(p => p.id === id);
        if(programIndexToDelete !== -1)
        {
            this.myPrograms.splice(programIndexToDelete, 1);
            localStorage.setItem(this.PROGRAMSKEY,JSON.stringify(this.myPrograms));            
        }
        else
        {
            throw Error("Program with ID " + id + " not found in your database")
        }
        return <Program[]>this.myPrograms;
    }

    //--------------- Default Page stuff ---------------
    getDefaultPage(): string
    {
        let defaultPage = localStorage.getItem(this.DEFAULTPAGEKEY);
        if(defaultPage === null)
        {
            return "exercises";
        }
        return defaultPage;
    }

    updateDefaultPage(newDefaultPage:string)
    {
        localStorage.setItem(this.DEFAULTPAGEKEY,newDefaultPage);
    }

    //--------------- Helper functions-----------------
    // something i got on stakc https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    generateUUID() { 
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    parseExersizeBeforeSaving(programToParse: Program) : Program
    {
        programToParse.exesices.forEach(exercises => 
        {   
            // if the resource url contains this then we need to parse the iframe to only obtain the youtube url
            if(exercises.resourceUrl.includes("title=\"YouTube video player\""))
            {
                var parser = new DOMParser();
                var parsedIframe = parser.parseFromString(exercises.resourceUrl, "text/html");
                let iFrame = parsedIframe.getElementsByTagName("iframe");
                // Read URL:
                exercises.resourceUrl = iFrame[0].src;
            }

            exercises.sets.forEach(exerciseSet => 
            {
                if(exerciseSet.weightOrSec === null || typeof(exerciseSet.weightOrSec) === "undefined")
                {
                    exerciseSet.weightOrSec = 0;
                }
                if(exerciseSet.repsOrMin === null || typeof(exerciseSet.repsOrMin) === "undefined")
                {
                    exerciseSet.repsOrMin = 0;
                }
                if(exerciseSet.pause === null || typeof(exerciseSet.pause) === "undefined")
                {
                    exerciseSet.pause = 0;
                }
            });
        });
        return programToParse;
    }

    // ----------- First Time settings -------------
    isThisMyFirstTime() : boolean
    {
        let firstTime = localStorage.getItem(this.FIRSTTIMEKEY);
        if(firstTime === null)
        {
            return true;
        }
        return false;
    } 

    setFirstTimeDone()
    {
        localStorage.setItem(this.FIRSTTIMEKEY,"true");
    }

    clearFirstimeDone()
    {
        localStorage.removeItem(this.FIRSTTIMEKEY);
    }
}