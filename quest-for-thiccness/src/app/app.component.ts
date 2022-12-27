import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Quest for Thiccness';

  items: MenuItem[] = [];

  ngOnInit() {
      this.items = 
      [
        {
          label:'Home',
          icon:'pi pi-home',
          routerLink: ['/home']
        }
      ];
  }
}
