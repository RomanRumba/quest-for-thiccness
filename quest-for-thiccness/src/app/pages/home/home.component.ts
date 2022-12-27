import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Excersize } from 'src/app/models/excersize';
import { CommonService } from 'src/app/services/commonService';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  public excersizes: Excersize[] = [];
  public selectedExcersizes: Excersize[] = [];
  public actions: MenuItem[] = [];

  constructor(private commonService: CommonService) { }

  ngOnInit() 
  {
    this.commonService.getExersizes().then((res: Excersize[]) => { this.excersizes = res; });
    this.actions = [
      {  
        tooltip: 'Add',
        icon: 'pi pi-plus', 
      }
   ];
  }
}
