import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// want this to be a singleton service
@Injectable({
    providedIn: 'root'
})
export class ThemeService 
{
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
        let themeIndex = this.themeNames.findIndex(t => t.themeName === usersSavedTheme)     
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