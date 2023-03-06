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
    private readonly CURRENTVERSION = 1.3; 

    public readonly BASEULR = "http://192.168.50.130:4200/";// "https://romanrumba.github.io/quest-for-thiccness/";
    public readonly EXERSIZEDBURL = "http://192.168.50.130:4200/assets/exercises.json"; //"https://romanrumba.github.io/quest-for-thiccness/assets/exercises.json"
    public readonly RESOURCEURL = "http://192.168.50.130:4200/assets/"; //"https://raw.githubusercontent.com/RomanRumba/quest-for-thiccness/prod/assets/";

    private readonly LASTVERSIONKEY = "MYVERSION";
    private readonly FIRSTTIMEKEY = "MYFIRSTTIME";
    private readonly PROGRAMSKEY = "MYPROGRAMS";
    public readonly DEFAULTPAGEKEY = "DEFAULTPAGE";
    public readonly RESTCLOCKSETTING = "MYRESTCLOCK";

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
            this.myPrograms = this.ensureExersizesAreInCorrectFormat(JSON.parse(programsString));
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

    //--------------- Helper functions-----------------

    // Nice function that i can use to parse some data to always have things uniformed
    parseExersizeBeforeSaving(programToParse: Program) : Program
    {
        programToParse.version = this.CURRENTVERSION;

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

    // This function ensures that all the Programs and their exersizes are up-to-date with latests changes.
    ensureExersizesAreInCorrectFormat(programsToCheck : any) : Program[]
    {
        let needUpdate : boolean = false;
        
        // Each object is a Program object but at this stage we are not
        // sure on what version it is so its simpler to use any to avoid possible errors with typescript. 
        programsToCheck.forEach((currentProgram: any) => 
        {   
            // Check if there is a version attribute in the current program,
            // I have actually seen an isssue where there was a program imported that was in a different version.
            if(("version" in currentProgram) === false)
            {
                currentProgram["version"] = 0;
                needUpdate = true;
            }

            if(currentProgram["version"] !== this.CURRENTVERSION)
            {
                /*currentProgram["exesices"].forEach((currentExersize:any) => 
                {
                
                });*/

                // At the end set the current version
                currentProgram["version"] = this.CURRENTVERSION;
                needUpdate = true;
            }
        });
    
        if(needUpdate)
        {
            localStorage.setItem(this.PROGRAMSKEY,JSON.stringify(programsToCheck));
        }
        
        return programsToCheck;
    }

    // dynamic modals will call this function to decide on their width
    getWithForModal()
    {
        let widthOfComponent = "90%";
        if(window.screen.width * window.devicePixelRatio > 960)
        {
          widthOfComponent = "450px";
        }

        return widthOfComponent;
    }

    // something i got on stakc https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    generateUUID() {
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0) {//Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
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

    //--------------- Settings Page related stuff ---------------
    
    getDefaultSettingForKey(key: string, defaultVal: string ): string 
    {
        let defaultValueFromStorage = localStorage.getItem(key);
        if (defaultValueFromStorage === null) {
            return defaultVal;
        }
        return defaultValueFromStorage;
    }

    updateValueOfKey(newvalue: string, key: string) 
    {
        localStorage.setItem(key, newvalue);
    }

}