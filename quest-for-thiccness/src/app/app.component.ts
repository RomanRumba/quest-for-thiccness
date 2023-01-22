import { Component } from '@angular/core';
import {  Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CommonService } from './services/commonService';
import { InsultService } from './services/insultService';
import { ThemeService } from './services/themeService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'Quest for Thiccness';
  public items: MenuItem[] = [];
  
  constructor(private themeService: ThemeService,
              private insultService: InsultService,
              private commonService: CommonService,
              private route: Router)
  {
    this.themeService.loadSavedTheme();
  }

  ngOnInit() 
  {
    this.insultService.loadInsultBankIfNeed()
    .then(() => 
    {
      this.items = 
      [
        {
          label:'Exercises',
          icon:'pi pi-home',
          routerLink: ['/exercises']
        },
        {
          label:'My Programs',
          icon:'pi pi-book',
          routerLink: ['/myprograms']
        },
        {
          label:'Setttings',
          icon:'pi pi-cog',
          routerLink: ['/settings']
        }
      ];

      let defaultPageCheck = this.commonService.getDefaultPage();
      if(defaultPageCheck !== "exercises")
      {
        this.route.navigate(["/"+defaultPageCheck]);
      }
    });
  }
}
