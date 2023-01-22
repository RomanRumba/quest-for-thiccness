import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Insult } from '../models/insult';
import { lastValueFrom } from 'rxjs';
// want this to be a singleton service
@Injectable({
    providedIn: 'root'
})
export class InsultService 
{
   private readonly INSULTDBURL = "http://192.168.50.130:4200/assets/insultbank.json";//"https://romanrumba.github.io/quest-for-thiccness/assets/insultbank.json";
   private readonly ISUSERPUSSY = "ISUSERPUSSY";
   private readonly insultTypes : string[] = 
   [
    "exersizeinfo",     // 0
    "invalform",        // 1
    "invalidval",       // 2
    "random",           // 3
    "finishedSet",      // 4 
    "updateSet",        // 5
    "declineUpdateSet"  // 6
   ]
   private insultBank: Insult[] = [];
   public insultOn : boolean = false;
   

   constructor(private http: HttpClient) {}   
   
   isUserAPussy()
   {
     let isUserAPussy = localStorage.getItem(this.ISUSERPUSSY);   
     if(isUserAPussy === null)
     {
        this.insultOn = true;
     }
     else
     {
        this.insultOn = isUserAPussy === 'true';
     }

     return this.insultOn.toString();
   }

   updateInsultsFlag(flag: string)
   {
     localStorage.setItem(this.ISUSERPUSSY, flag);
     this.insultOn = flag === 'true';

     if(this.insultOn === true)
     {
        // its okay to lazy load this portion there is no way the user
        // will stumble on a insult page in settings
        this.getInsultBank();
     }
   }

   getRandomInsultType(insultype:number)
   {
      let randomInsultsOfType = this.insultBank.filter(i => i.type === this.insultTypes[insultype]);
      if(randomInsultsOfType.length === 0)
      {
        return "Shiiiii fam i am out of insults."
      }

      return (randomInsultsOfType[Math.floor(Math.random() * randomInsultsOfType.length)]).insult;
   }

   async getInsultBank() : Promise<Insult[]> 
   {
       if(this.insultBank.length != 0)
       {
          return this.insultBank;
       }
       this.insultBank = await lastValueFrom(this.http.get<Insult[]>(this.INSULTDBURL));
       return this.insultBank;
   }

   async loadInsultBankIfNeed()
   {
       this.isUserAPussy();
       if(this.insultOn === true)
       {
         await this.getInsultBank();
       }
   }
}