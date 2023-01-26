import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// want this to be a singleton service
@Injectable({
    providedIn: 'root'
})
export class ThemeService 
{
   /* How to Add new Themes:
    * 1. navigate to angular.json file 
    * 2. in sed file find the styles section
    * 3. There you will see saga-blue and arya-purple object
    *    copy-paste another object and fill out the information for ur .css
    * 4. re-build the entire project
    * 5. add a new entry here in the 'themeNames'
    * 6. you are done!
   */
   private readonly SELECTEDTHEME = "SELECTEDTHEME";
   public themeNames : { friendlyName: string, themeName: string} [] = 
   [
    {
        friendlyName: "Default",
        themeName: "saga-blue"
    },
    {
        friendlyName: "Darkmode",
        themeName: "arya-purple"
    }
   ]
   constructor(@Inject(DOCUMENT) private document: Document) {}   
   
   getMyCurrentTheme()
   {
        let usersSavedTheme = localStorage.getItem(this.SELECTEDTHEME);   
        let themeIndex = this.themeNames.findIndex(t => t.themeName === usersSavedTheme);    
        if(themeIndex >= 0)        
        {           
            return this.themeNames[themeIndex];       
        }
        else
        {
            return this.themeNames[0];
        }
   }

   switchTheme(theme: string)
   { 
     // in index.html there is an LINK element that we change to target different style sheets
     let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;       
     if (themeLink)         
     {            
        themeLink.href = theme + '.css';            
        localStorage.setItem(this.SELECTEDTHEME, theme);        
     }    
   }    
    
   loadSavedTheme()    
   {        
        let usersSavedTheme = localStorage.getItem(this.SELECTEDTHEME);        
        if(this.themeNames.findIndex(t => t.themeName === usersSavedTheme) >= 0)        
        {           
            this.switchTheme(<string>usersSavedTheme);        
        }   
   }
}